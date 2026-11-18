import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { blockProfile, likeProfile, markRead as apiMarkRead, passProfile, reportProfile, sendText, sendVoiceNote, setPaused as apiSetPaused, unblockProfile, unmatch as apiUnmatch } from '@/features/api';
import { fetchDeck, fetchIncoming, fetchMatches, fetchMessages, subscribeMessages } from '@/features/backend/remote';
import { buildDeck, incomingLikes } from '@/features/discover/deck';
import { mockProfileById, type DemoProfile } from '@/features/mock-data';
import { usePersistentState } from '@/lib/persist';
import { isBackendConfigured, supabase } from '@/lib/supabase';
import type { DiscoverFilters, Message } from '@/types/domain';

/**
 * Social state: likes, passes, matches, messages, filters and incognito.
 *
 * Two modes behind one API, so screens never care which is live:
 * - Demo (no Supabase keys): everything is local, persisted on the device,
 *   and demo profiles "reply" so the app can be tried end to end.
 * - Live (EXPO_PUBLIC_SUPABASE_* set): deck, likes, matches and chat come
 *   from Supabase (RPCs in supabase/migrations), chat updates in realtime.
 */

export interface LikeRecord {
  at: string;
  rose?: boolean;
  comment?: string;
  promptId?: string;
}
export interface MatchRecord {
  id: string;
  profileId: string;
  createdAt: string;
}
export type NotificationKey = 'matches' | 'messages' | 'likes' | 'reminders';
export interface DatePlan {
  place: string;
  when: string;
  contactName: string;
  contactPhone: string;
  sharedAt?: string;
}
export interface SocialState {
  liked: Record<string, LikeRecord>;
  /** People you blocked: never shown again anywhere. */
  blocked: string[];
  /** Hidden from Discover and Likes; matches and chats stay. */
  paused: boolean;
  notifications: Record<NotificationKey, boolean>;
  datePlans: Record<string, DatePlan>;
  passed: string[];
  matches: Record<string, MatchRecord>;
  messages: Record<string, Message[]>;
  filters: DiscoverFilters;
  /** ISO time an Incognito pass runs until. */
  incognitoUntil?: string;
}

export const SOCIAL_KEY = 'makoma.social.v1';
export const DEFAULT_NOTIFICATIONS: Record<NotificationKey, boolean> = { matches: true, messages: true, likes: true, reminders: true };
const extras = { blocked: [] as string[], paused: false, notifications: DEFAULT_NOTIFICATIONS, datePlans: {} as Record<string, DatePlan> };
export const DEFAULT_FILTERS: DiscoverFilters = {
  intents: ['marriage', 'serious', 'friendship_networking'],
  minAge: 21,
  maxAge: 45,
  verifiedOnly: false,
  languages: [],
  institutionIds: [],
};

const t0 = '2026-11-17T18:00:00Z';
const demoSeed: SocialState = {
  ...extras,
  liked: { akosua: { at: t0 } },
  passed: [],
  matches: { 'm-akosua': { id: 'm-akosua', profileId: 'akosua', createdAt: t0 } },
  messages: {
    'm-akosua': [
      { id: 'd1', matchId: 'm-akosua', senderId: 'them', kind: 'text', body: 'Kwame, I am still recovering from our last debate. Are you genuinely telling me East Legon has better kelewele than Osu? Be serious!', createdAt: t0 },
      { id: 'd2', matchId: 'm-akosua', senderId: 'me', kind: 'voice', audioUrl: '', durationMs: 14000, createdAt: t0 },
      { id: 'd3', matchId: 'm-akosua', senderId: 'them', kind: 'voice', audioUrl: '', durationMs: 19000, createdAt: t0 },
    ],
  },
  filters: DEFAULT_FILTERS,
};
const liveSeed: SocialState = { ...extras, liked: {}, passed: [], matches: {}, messages: {}, filters: DEFAULT_FILTERS };

type NewMessage = { kind: 'text'; body: string } | { kind: 'voice'; audioUrl: string; durationMs: number } | { kind: 'gift'; giftId: string; offerId: string };
type LikeOpts = { rose?: boolean; comment?: string; promptId?: string };

interface SocialApi {
  state: SocialState;
  hydrated: boolean;
  /** True when talking to Supabase rather than demo data. */
  live: boolean;
  /** Loading deck / likes / matches from the server. */
  loading: boolean;
  error: string | null;
  /** People still to meet, best first. */
  deck: DemoProfile[];
  /** People who liked you and are waiting for an answer. */
  incoming: DemoProfile[];
  /** Any profile the app has seen (deck, likes, matches). */
  profile: (id: string | undefined) => DemoProfile | undefined;
  /** Match id whose other person is "typing" a demo reply right now. */
  typingIn: string | null;
  /** Reload deck, likes and matches (no-op in demo). */
  refresh: () => Promise<void>;
  /** Load a conversation and listen for new messages. Returns a cleanup. */
  openChat: (matchId: string) => () => void;
  /** Like someone. Resolves to the match id when it is mutual, else null. */
  like: (profileId: string, opts?: LikeOpts) => Promise<string | null>;
  pass: (profileId: string) => Promise<void>;
  send: (matchId: string, message: NewMessage) => Promise<void>;
  setFilters: (filters: DiscoverFilters) => void;
  /** Block someone (and end any match). Optionally file a report first. */
  block: (profileId: string, report?: { reason: string; details?: string }) => Promise<void>;
  /** File a report without blocking. */
  report: (profileId: string, reason: string, details?: string) => Promise<void>;
  unblock: (profileId: string) => Promise<void>;
  unmatch: (matchId: string) => Promise<void>;
  setPaused: (paused: boolean) => Promise<void>;
  setNotification: (key: NotificationKey, on: boolean) => void;
  saveDatePlan: (matchId: string, plan: DatePlan) => void;
  buyIncognito: (hours: number) => void;
  endIncognito: () => void;
  reset: () => void;
}

const Ctx = createContext<SocialApi | null>(null);

const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);
const live = isBackendConfigured;

export function SocialProvider({ children }: { children: ReactNode }) {
  // Persisted: everything in demo; only filters + incognito matter in live mode.
  const [state, setState, hydrated] = usePersistentState<SocialState>(SOCIAL_KEY, live ? liveSeed : demoSeed);
  const [typingIn, setTypingIn] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ---- Live-mode server data (memory only) ----
  const [deckRemote, setDeckRemote] = useState<DemoProfile[]>([]);
  const [incomingRemote, setIncomingRemote] = useState<DemoProfile[]>([]);
  const [profiles, setProfiles] = useState<Record<string, DemoProfile>>({});
  const [loading, setLoading] = useState(live);
  const [error, setError] = useState<string | null>(null);
  const meRef = useRef<string | null>(null);

  const remember = useCallback((list: DemoProfile[]) => setProfiles((p) => ({ ...p, ...Object.fromEntries(list.map((x) => [x.id, x])) })), []);

  const refresh = useCallback(async () => {
    if (!live) return;
    const { data } = await supabase.auth.getSession();
    const me = data.session?.user.id;
    if (!me) {
      setLoading(false);
      return;
    }
    meRef.current = me;
    setError(null);
    try {
      const [deck, inc, matches] = await Promise.all([fetchDeck(state.filters), fetchIncoming(), fetchMatches(me)]);
      setDeckRemote(deck);
      setIncomingRemote(inc);
      remember([...deck, ...inc, ...matches.map((m) => m.profile)]);
      setState((s) => {
        const msgs = { ...s.messages };
        for (const m of matches) if (!msgs[m.id]?.length && m.last) msgs[m.id] = [m.last];
        return {
          ...s,
          matches: Object.fromEntries(matches.map((m) => [m.id, { id: m.id, profileId: m.profile.id, createdAt: m.createdAt }])),
          messages: msgs,
        };
      });
    } catch (e: any) {
      setError(e?.message ?? 'Could not load. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [state.filters, remember, setState]);

  // Load on start and whenever filters change; again when someone signs in.
  useEffect(() => {
    if (!live || !hydrated) return;
    const t = setTimeout(refresh, 0);
    return () => clearTimeout(t);
  }, [hydrated, refresh]);
  useEffect(() => {
    if (!live) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const putMessage = useCallback(
    (matchId: string, m: Message) =>
      setState((s) => {
        const list = s.messages[matchId] ?? [];
        if (list.some((x) => x.id === m.id)) return s;
        return { ...s, messages: { ...s.messages, [matchId]: [...list, m] } };
      }),
    [setState],
  );

  const openChat = useCallback(
    (matchId: string) => {
      if (!live || !matchId) return () => {};
      let stop = () => {};
      let alive = true;
      supabase.auth.getSession().then(({ data }) => {
        const me = data.session?.user.id;
        if (!me || !alive) return;
        fetchMessages(matchId, me)
          .then((list) => alive && setState((s) => ({ ...s, messages: { ...s.messages, [matchId]: list } })))
          .catch((e) => setError(e?.message ?? 'Could not load messages.'));
        apiMarkRead(matchId).catch(() => {});
        stop = subscribeMessages(
          matchId,
          me,
          (m) => {
            putMessage(matchId, m);
            if (m.senderId === 'them') apiMarkRead(matchId).catch(() => {});
          },
          (id, readAt) => setState((s) => ({ ...s, messages: { ...s.messages, [matchId]: (s.messages[matchId] ?? []).map((x) => (x.id === id ? { ...x, readAt } : x)) } })),
        );
      });
      return () => {
        alive = false;
        stop();
      };
    },
    [putMessage, setState],
  );

  // ---- Actions ----
  const like: SocialApi['like'] = useCallback(
    async (profileId, opts = {}) => {
      if (live) {
        const matchId = await likeProfile(profileId, opts);
        setDeckRemote((d) => d.filter((p) => p.id !== profileId));
        setIncomingRemote((d) => d.filter((p) => p.id !== profileId));
        setState((s) => ({
          ...s,
          liked: { ...s.liked, [profileId]: { at: now(), ...opts } },
          matches: matchId ? { ...s.matches, [matchId]: { id: matchId, profileId, createdAt: now() } } : s.matches,
        }));
        if (matchId && opts.comment) await sendText(matchId, opts.comment).catch(() => {});
        return matchId;
      }
      const profile = mockProfileById(profileId);
      const mutual = !!profile?.likesYou;
      const matchId = `m-${profileId}`;
      setState((s) => {
        const next: SocialState = { ...s, liked: { ...s.liked, [profileId]: { at: now(), ...opts } } };
        if (mutual && !s.matches[matchId]) {
          next.matches = { ...s.matches, [matchId]: { id: matchId, profileId, createdAt: now() } };
          const opener: Message[] = profile?.likesYou?.comment
            ? [{ id: uid(), matchId, senderId: 'them', kind: 'text', body: profile.likesYou.comment, createdAt: profile.likesYou.at }]
            : [];
          const mine: Message[] = opts.comment ? [{ id: uid(), matchId, senderId: 'me', kind: 'text', body: opts.comment, createdAt: now() }] : [];
          next.messages = { ...s.messages, [matchId]: [...opener, ...mine] };
        }
        return next;
      });
      return mutual ? matchId : null;
    },
    [setState],
  );

  const pass: SocialApi['pass'] = useCallback(
    async (profileId) => {
      if (live) {
        setDeckRemote((d) => d.filter((p) => p.id !== profileId));
        setIncomingRemote((d) => d.filter((p) => p.id !== profileId));
        await passProfile(profileId);
        return;
      }
      setState((s) => ({ ...s, passed: [...new Set([...s.passed, profileId])] }));
    },
    [setState],
  );

  const send: SocialApi['send'] = useCallback(
    async (matchId, message) => {
      if (live) {
        // Realtime delivers the saved row back to us (and to them).
        if (message.kind === 'text') await sendText(matchId, message.body);
        else if (message.kind === 'voice') await sendVoiceNote(matchId, message.audioUrl, message.durationMs);
        return;
      }
      const mine = { ...message, id: uid(), matchId, senderId: 'me', createdAt: now() } as Message;
      setState((s) => ({ ...s, messages: { ...s.messages, [matchId]: [...(s.messages[matchId] ?? []), mine] } }));
      if (message.kind === 'gift') return;
      // Demo only: the match replies after a moment (voice for voice, so treats can unlock).
      const profile = mockProfileById(matchId.replace(/^m-/, ''));
      if (!profile) return;
      timers.current.push(setTimeout(() => setTypingIn(matchId), 500));
      timers.current.push(
        setTimeout(() => {
          setTypingIn((cur) => (cur === matchId ? null : cur));
          setState((s) => {
            const list = s.messages[matchId] ?? [];
            const n = list.filter((m) => m.senderId === 'them').length;
            const reply: Message =
              message.kind === 'voice'
                ? { id: uid(), matchId, senderId: 'them', kind: 'voice', audioUrl: '', durationMs: 8000 + (n % 4) * 3000, createdAt: now() }
                : { id: uid(), matchId, senderId: 'them', kind: 'text', body: profile.replies[n % profile.replies.length], createdAt: now() };
            const seen = list.map((m) => (m.senderId === 'me' && !m.readAt ? { ...m, readAt: now() } : m));
            return { ...s, messages: { ...s.messages, [matchId]: [...seen, reply] } };
          });
        }, 2200),
      );
    },
    [setState],
  );

  /** Remove someone from matches, chats, deck and likes (and remember the block). */
  const dropProfile = (profileId: string, blocked: boolean) => {
    setDeckRemote((d) => d.filter((p) => p.id !== profileId));
    setIncomingRemote((d) => d.filter((p) => p.id !== profileId));
    setState((s) => {
      const gone = Object.values(s.matches).filter((m) => m.profileId === profileId).map((m) => m.id);
      const matches = { ...s.matches };
      const messages = { ...s.messages };
      for (const id of gone) {
        delete matches[id];
        delete messages[id];
      }
      return {
        ...s,
        matches,
        messages,
        // Demo: an unmatched person shouldn't come back as a new like or in the deck.
        passed: blocked ? s.passed : [...new Set([...s.passed, profileId])],
        blocked: blocked ? [...new Set([...s.blocked, profileId])] : s.blocked,
      };
    });
  };

  const api: SocialApi = {
    state,
    hydrated,
    live,
    loading,
    error,
    deck: live ? deckRemote : buildDeck(state),
    incoming: live ? incomingRemote : incomingLikes(state),
    profile: (id) => (id ? (live ? profiles[id] : mockProfileById(id)) : undefined),
    typingIn,
    refresh,
    openChat,
    like,
    pass,
    send,
    setFilters: (filters) => setState((s) => ({ ...s, filters })),
    block: async (profileId, report) => {
      if (live) {
        if (report) await reportProfile(profileId, report.reason, report.details);
        await blockProfile(profileId);
      }
      dropProfile(profileId, true);
      if (live) refresh();
    },
    report: async (profileId, reason, details) => {
      if (live) await reportProfile(profileId, reason, details);
    },
    unblock: async (profileId) => {
      if (live) await unblockProfile(profileId);
      setState((s) => ({ ...s, blocked: s.blocked.filter((x) => x !== profileId) }));
    },
    unmatch: async (matchId) => {
      const profileId = state.matches[matchId]?.profileId;
      if (live) await apiUnmatch(matchId);
      if (profileId) dropProfile(profileId, false);
    },
    setPaused: async (paused) => {
      if (live) await apiSetPaused(paused);
      setState((s) => ({ ...s, paused }));
      if (live) refresh();
    },
    setNotification: (key, on) => setState((s) => ({ ...s, notifications: { ...s.notifications, [key]: on } })),
    saveDatePlan: (matchId, plan) => setState((s) => ({ ...s, datePlans: { ...s.datePlans, [matchId]: plan } })),
    // TODO(live): sold through Paystack; the webhook sets profiles.incognito_until.
    buyIncognito: (hours) => setState((s) => ({ ...s, incognitoUntil: new Date(Date.now() + hours * 3600_000).toISOString() })),
    endIncognito: () => setState((s) => ({ ...s, incognitoUntil: undefined })),
    reset: () => {
      setState(live ? liveSeed : demoSeed);
      setDeckRemote([]);
      setIncomingRemote([]);
      setProfiles({});
    },
  };
  return <Ctx value={api}>{children}</Ctx>;
}

export function useSocial() {
  const v = use(Ctx);
  if (!v) throw new Error('useSocial must be used inside SocialProvider');
  return v;
}

/** Last message in a conversation, for list previews. */
export const lastMessage = (s: SocialState, matchId: string) => {
  const list = s.messages[matchId];
  return list?.[list.length - 1];
};
