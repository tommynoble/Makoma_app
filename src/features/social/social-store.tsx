import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { mockProfileById } from '@/features/mock-data';
import { usePersistentState } from '@/lib/persist';
import type { DiscoverFilters, Message } from '@/types/domain';

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
export interface SocialState {
  liked: Record<string, LikeRecord>;
  passed: string[];
  matches: Record<string, MatchRecord>;
  messages: Record<string, Message[]>;
  filters: DiscoverFilters;
  /** ISO time an Incognito pass runs until. */
  incognitoUntil?: string;
}

export const SOCIAL_KEY = 'makoma.social.v1';
export const DEFAULT_FILTERS: DiscoverFilters = {
  intents: ['marriage', 'serious', 'friendship_networking'],
  minAge: 21,
  maxAge: 45,
  verifiedOnly: false,
  languages: [],
  institutionIds: [],
};

const t0 = '2026-11-17T18:00:00Z';
const seed: SocialState = {
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

type NewMessage = { kind: 'text'; body: string } | { kind: 'voice'; audioUrl: string; durationMs: number } | { kind: 'gift'; giftId: string; offerId: string };

interface SocialApi {
  state: SocialState;
  hydrated: boolean;
  /** Match id whose other person is "typing" a demo reply right now. */
  typingIn: string | null;
  /** Like someone. Returns the new match id when it is mutual, else null. */
  like: (profileId: string, opts?: { rose?: boolean; comment?: string; promptId?: string }) => string | null;
  pass: (profileId: string) => void;
  send: (matchId: string, message: NewMessage) => void;
  setFilters: (filters: DiscoverFilters) => void;
  buyIncognito: (hours: number) => void;
  endIncognito: () => void;
  reset: () => void;
}

const Ctx = createContext<SocialApi | null>(null);

const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

export function SocialProvider({ children }: { children: ReactNode }) {
  const [state, setState, hydrated] = usePersistentState<SocialState>(SOCIAL_KEY, seed);
  const [typingIn, setTypingIn] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const like: SocialApi['like'] = useCallback(
    (profileId, opts = {}) => {
      const profile = mockProfileById(profileId);
      const mutual = !!profile?.likesYou; // TODO: the backend decides (like_profile RPC).
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

  const pass = useCallback((profileId: string) => setState((s) => ({ ...s, passed: [...new Set([...s.passed, profileId])] })), [setState]);

  const send: SocialApi['send'] = useCallback(
    (matchId, message) => {
      const mine = { ...message, id: uid(), matchId, senderId: 'me', createdAt: now() } as Message;
      setState((s) => ({ ...s, messages: { ...s.messages, [matchId]: [...(s.messages[matchId] ?? []), mine] } }));
      if (message.kind === 'gift') return;
      // Demo only: the match replies after a moment (voice for voice, so treats can unlock).
      const profile = mockProfileById(matchId.replace(/^m-/, ''));
      if (!profile) return;
      timers.current.push(setTimeout(() => setTypingIn(matchId), 500));
      const t = setTimeout(() => {
        setTypingIn((cur) => (cur === matchId ? null : cur));
        setState((s) => {
          const list = s.messages[matchId] ?? [];
          const n = list.filter((m) => m.senderId === 'them').length;
          const reply: Message =
            message.kind === 'voice'
              ? { id: uid(), matchId, senderId: 'them', kind: 'voice', audioUrl: '', durationMs: 8000 + (n % 4) * 3000, createdAt: now() }
              : { id: uid(), matchId, senderId: 'them', kind: 'text', body: profile.replies[n % profile.replies.length], createdAt: now() };
          return { ...s, messages: { ...s.messages, [matchId]: [...list, reply] } };
        });
      }, 2200);
      timers.current.push(t);
    },
    [setState],
  );

  const api: SocialApi = {
    state,
    hydrated,
    typingIn,
    like,
    pass,
    send,
    setFilters: (filters) => setState((s) => ({ ...s, filters })),
    buyIncognito: (hours) => setState((s) => ({ ...s, incognitoUntil: new Date(Date.now() + hours * 3600_000).toISOString() })),
    endIncognito: () => setState((s) => ({ ...s, incognitoUntil: undefined })),
    reset: () => setState(seed),
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
