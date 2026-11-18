/**
 * Supabase reads/writes for the social side (deck, likes, matches, chat),
 * returning the same shapes the demo uses so screens don't care which is live.
 */
import { supabase } from '@/lib/supabase';
import type { DemoProfile } from '@/features/mock-data';
import type { DiscoverFilters, IncomingLike, Message } from '@/types/domain';
import { signPaths } from './media';

type RawProfile = Omit<DemoProfile, 'replies'> & { likesYou?: IncomingLike };

/** Swap storage paths for signed URLs on photos and voice intros. */
async function hydrate(raw: RawProfile[]): Promise<DemoProfile[]> {
  const photoPaths = raw.flatMap((p) => (p.photos ?? []).map((ph) => String(ph.source)));
  const voicePaths = raw.map((p) => p.voicePrompt?.audioUrl).filter((v): v is string => !!v);
  const [photos, voices] = await Promise.all([signPaths('profile-photos', photoPaths), signPaths('voice-intros', voicePaths)]);
  return raw.map((p) => ({
    ...p,
    replies: [],
    photos: (p.photos ?? []).map((ph) => ({ ...ph, source: photos[String(ph.source)] ?? '' })),
    voicePrompt: p.voicePrompt ? { ...p.voicePrompt, audioUrl: voices[p.voicePrompt.audioUrl ?? ''] } : undefined,
  }));
}

export async function fetchDeck(f: DiscoverFilters): Promise<DemoProfile[]> {
  const { data, error } = await supabase.rpc('discover_feed', {
    p_intents: f.intents,
    p_min_age: f.minAge,
    p_max_age: f.maxAge,
    p_verified_only: f.verifiedOnly,
    p_languages: f.languages,
    p_institution_ids: f.institutionIds,
    p_city: f.city ?? null,
  });
  if (error) throw error;
  return hydrate(((data as { profile: RawProfile }[]) ?? []).map((c) => c.profile));
}

export async function fetchIncoming(): Promise<DemoProfile[]> {
  const { data, error } = await supabase.rpc('likes_received');
  if (error) throw error;
  return hydrate((data as RawProfile[]) ?? []);
}

interface MessageRow {
  id: string;
  match_id?: string;
  sender_id: string;
  kind: Message['kind'];
  body?: string | null;
  audio_path?: string | null;
  duration_ms?: number | null;
  created_at: string;
  gift_id?: string | null;
  offer_id?: string | null;
  gifts?: { offer_id: string } | null;
}

export function rowToMessage(r: MessageRow, matchId: string, me: string, audioUrl = ''): Message {
  const base = { id: r.id, matchId, senderId: r.sender_id === me ? 'me' : 'them', createdAt: r.created_at };
  if (r.kind === 'voice') return { ...base, kind: 'voice', audioUrl, durationMs: r.duration_ms ?? 0 };
  if (r.kind === 'gift') return { ...base, kind: 'gift', giftId: r.gift_id ?? '', offerId: r.gifts?.offer_id ?? r.offer_id ?? '' };
  return { ...base, kind: 'text', body: r.body ?? '' };
}

async function signVoice(rows: MessageRow[]) {
  return signPaths('voice-notes', rows.filter((r) => r.kind === 'voice' && r.audio_path).map((r) => r.audio_path!));
}

export interface RemoteMatch {
  id: string;
  createdAt: string;
  profile: DemoProfile;
  last?: Message;
}

export async function fetchMatches(me: string): Promise<RemoteMatch[]> {
  const { data, error } = await supabase.rpc('my_matches');
  if (error) throw error;
  const rows = (data as { id: string; createdAt: string; profile: RawProfile; lastMessage: MessageRow | null }[]) ?? [];
  const profiles = await hydrate(rows.map((r) => r.profile));
  const voice = await signVoice(rows.map((r) => r.lastMessage).filter((m): m is MessageRow => !!m));
  return rows.map((r, i) => ({
    id: r.id,
    createdAt: r.createdAt,
    profile: profiles[i],
    last: r.lastMessage ? rowToMessage(r.lastMessage, r.id, me, voice[r.lastMessage.audio_path ?? '']) : undefined,
  }));
}

export async function fetchMessages(matchId: string, me: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, kind, body, audio_path, duration_ms, gift_id, created_at, gifts(offer_id)')
    .eq('match_id', matchId)
    .order('created_at');
  if (error) throw error;
  const rows = (data as unknown as MessageRow[]) ?? [];
  const voice = await signVoice(rows);
  return rows.map((r) => rowToMessage(r, matchId, me, voice[r.audio_path ?? '']));
}

/** Live inserts for one conversation. */
export function subscribeMessages(matchId: string, me: string, onMessage: (m: Message) => void) {
  const channel = supabase
    .channel(`match:${matchId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` }, async (payload) => {
      const row = payload.new as MessageRow;
      if (row.kind === 'gift' && row.gift_id) {
        const { data } = await supabase.from('gifts').select('offer_id').eq('id', row.gift_id).maybeSingle();
        row.offer_id = data?.offer_id ?? null;
      }
      const voice = await signVoice([row]).catch(() => ({}) as Record<string, string>);
      onMessage(rowToMessage(row, matchId, me, voice[row.audio_path ?? '']));
    })
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
