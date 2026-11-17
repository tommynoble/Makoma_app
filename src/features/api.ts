/**
 * Thin data-access layer. Screens call these, never `supabase` directly, so
 * the backend can change without touching UI. Each function falls back to
 * mock data while the backend isn't configured, so screens can be built
 * against the designs before Supabase is set up.
 */
import { File } from 'expo-file-system';
import { isBackendConfigured, supabase } from '@/lib/supabase';
import type { DiscoverCard, DiscoverFilters, GiftOffer, GiftUnlock, Message, Visibility, Voucher } from '@/types/domain';
import { MOCK_CARDS, MOCK_GIFT_OFFERS, MOCK_VOUCHERS } from './mock-data';

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
export async function likeProfile(targetId: string, opts: { promptId?: string; comment?: string; rose?: boolean } = {}) {
  if (!isBackendConfigured) return null;
  const { data, error } = await supabase.rpc('like_profile', {
    p_target: targetId,
    p_prompt_id: opts.promptId ?? null,
    p_comment: opts.comment?.trim() || null,
    p_rose: !!opts.rose,
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

// ---- Treats (partner vouchers) -------------------------------------------
// Gifts are treats bought from Makoma and redeemed at partner spots. Cash is
// never sent between users (Bank of Ghana P2P payment rules).

export async function fetchGiftOffers(): Promise<GiftOffer[]> {
  if (!isBackendConfigured) return MOCK_GIFT_OFFERS;
  const { data, error } = await supabase
    .from('partner_offers')
    .select('id, label, emoji, price_pesewas, partners(name, area)')
    .eq('is_active', true)
    .order('price_pesewas');
  if (error) throw error;
  return (data ?? []).map((o: any) => ({
    id: o.id,
    label: o.label,
    emoji: o.emoji,
    pricePesewas: o.price_pesewas,
    partnerName: o.partners?.name ?? '',
    area: o.partners?.area ?? '',
  }));
}

/** Server-side gift lock status for a match (null if not a participant). */
export async function fetchGiftUnlock(matchId: string): Promise<GiftUnlock | null> {
  const { data, error } = await supabase.rpc('gift_unlock_status', { p_match: matchId });
  if (error) throw error;
  return data as GiftUnlock | null;
}

/**
 * Buys a treat with MoMo. The edge function re-checks the gift lock, takes the
 * price from the partner catalogue, and returns a Paystack checkout URL. Once
 * paid, the webhook issues the recipient a voucher and posts the gift message.
 */
export async function startGift(matchId: string, offerId: string, note?: string) {
  const { data, error } = await supabase.functions.invoke<{ authorizationUrl: string; reference: string }>(
    'gift-initiate',
    { body: { matchId, offerId, note } },
  );
  if (error) throw error;
  return data!;
}

/** Treats the signed-in user has received. Only the recipient can see codes. */
export async function fetchMyVouchers(): Promise<Voucher[]> {
  if (!isBackendConfigured) return MOCK_VOUCHERS;
  const { data, error } = await supabase
    .from('vouchers')
    .select(
      'id, code, status, expires_at, redeemed_at, partner_offers(id, label, emoji, price_pesewas, partners(name, area)), gifts(sender_id)',
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  // TODO: resolve sender first names via a view/RPC once profile visibility for matches is finalised.
  return (data ?? []).map((v: any) => ({
    id: v.id,
    code: v.code,
    status: v.status,
    expiresAt: v.expires_at,
    redeemedAt: v.redeemed_at ?? undefined,
    fromName: 'Your match',
    offer: {
      id: v.partner_offers.id,
      label: v.partner_offers.label,
      emoji: v.partner_offers.emoji,
      pricePesewas: v.partner_offers.price_pesewas,
      partnerName: v.partner_offers.partners?.name ?? '',
      area: v.partner_offers.partners?.area ?? '',
    },
  }));
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
