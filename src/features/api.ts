/**
 * Thin data-access layer. Screens call these, never `supabase` directly, so
 * the backend can change without touching UI. Each function falls back to
 * mock data while the backend isn't configured, so screens can be built
 * against the designs before Supabase is set up.
 */
import { File } from 'expo-file-system';
import { isBackendConfigured, supabase } from '@/lib/supabase';
import type { DiscoverCard, DiscoverFilters, Message, Visibility } from '@/types/domain';
import { MOCK_CARDS } from './mockData';

// ---- Discover -------------------------------------------------------------

export async function fetchDiscover(filters: DiscoverFilters): Promise<DiscoverCard[]> {
  if (!isBackendConfigured) {
    return MOCK_CARDS.filter(
      (c) =>
        filters.intents.includes(c.profile.intent) &&
        (!filters.verifiedOnly || c.profile.verification === 'verified'),
    );
  }
  // Ranking (shared ground, intent, verification) and incognito visibility
  // are enforced server-side in the `discover_feed` function.
  const { data, error } = await supabase.rpc('discover_feed', {
    p_intents: filters.intents,
    p_min_age: filters.minAge,
    p_max_age: filters.maxAge,
    p_verified_only: filters.verifiedOnly,
    p_languages: filters.languages,
    p_institution_ids: filters.institutionIds,
    p_city: filters.city ?? null,
  });
  if (error) throw error;
  return data as DiscoverCard[];
}

/** Returns the match id if the like was mutual. */
export async function likeProfile(targetId: string, openingPromptId?: string, comment?: string) {
  if (!isBackendConfigured) return null;
  const { data, error } = await supabase.rpc('like_profile', {
    p_target: targetId,
    p_prompt_id: openingPromptId ?? null,
    p_comment: comment ?? null,
  });
  if (error) throw error;
  return (data as string | null) ?? null;
}

export async function passProfile(targetId: string) {
  if (!isBackendConfigured) return;
  const { error } = await supabase.rpc('pass_profile', { p_target: targetId });
  if (error) throw error;
}

// ---- Chat -----------------------------------------------------------------

export async function sendText(matchId: string, body: string) {
  const { error } = await supabase.from('messages').insert({ match_id: matchId, kind: 'text', body });
  if (error) throw error;
}

export async function sendVoiceNote(matchId: string, uri: string, durationMs: number) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Not signed in');
  const path = `${matchId}/${userId}/${Date.now()}.m4a`;
  const bytes = await new File(uri).arrayBuffer();
  const up = await supabase.storage.from('voice-notes').upload(path, bytes, { contentType: 'audio/m4a' });
  if (up.error) throw up.error;
  const { error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, kind: 'voice', audio_path: path, duration_ms: durationMs });
  if (error) throw error;
}

export function subscribeToMessages(matchId: string, onMessage: (m: Message) => void) {
  const channel = supabase
    .channel(`match:${matchId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
      (payload) => onMessage(payload.new as unknown as Message),
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// ---- MoMo gifts -----------------------------------------------------------

/**
 * Starts a MoMo appreciation gift. The edge function creates a pending gift
 * row and a Paystack transaction and returns a checkout URL; Paystack's
 * webhook marks the gift paid and posts the gift message into the chat.
 */
export async function startGift(matchId: string, giftId: string, note?: string) {
  const { data, error } = await supabase.functions.invoke<{ authorizationUrl: string; reference: string }>(
    'gift-initiate',
    { body: { matchId, giftId, note } },
  );
  if (error) throw error;
  return data!;
}

// ---- Privacy & verification -----------------------------------------------

export async function setVisibility(visibility: Visibility) {
  const { error } = await supabase.rpc('set_visibility', { p_visibility: visibility });
  if (error) throw error;
}

export async function submitSelfieVerification(selfieUri: string, pose: string) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Not signed in');
  const path = `${userId}/${Date.now()}.jpg`;
  const bytes = await new File(selfieUri).arrayBuffer();
  const up = await supabase.storage.from('verification-selfies').upload(path, bytes, { contentType: 'image/jpeg' });
  if (up.error) throw up.error;
  const { error } = await supabase.from('verification_requests').insert({ selfie_path: path, pose });
  if (error) throw error;
}

export async function reportProfile(targetId: string, reason: string, details?: string) {
  const { error } = await supabase.from('reports').insert({ reported_id: targetId, reason, details });
  if (error) throw error;
}

export async function blockProfile(targetId: string) {
  const { error } = await supabase.from('blocks').insert({ blocked_id: targetId });
  if (error) throw error;
}
