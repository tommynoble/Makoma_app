// Supabase Edge Function (Deno): buy a partner treat for a match, paid with MoMo via Paystack.
// The sender pays Makoma (a normal merchant sale); the recipient later receives a
// voucher redeemable at the partner. No money ever moves between users' wallets.
// Secrets: PAYSTACK_SECRET_KEY (set with `supabase secrets set`).
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'unauthorized' }, 401);

  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
  });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const { data: userData } = await userClient.auth.getUser();
  const user = userData.user;
  if (!user) return json({ error: 'unauthorized' }, 401);

  const { matchId, offerId, note } = await req.json();

  // Price comes from the partner catalogue, never from the client.
  const { data: offer } = await admin
    .from('partner_offers')
    .select('id, price_pesewas, is_active')
    .eq('id', offerId)
    .single();
  if (!offer?.is_active) return json({ error: 'unknown treat' }, 400);
  const amount = offer.price_pesewas;

  // Anti-scam gift lock, enforced server-side (the UI lock is only a hint).
  const { data: unlock } = await userClient.rpc('gift_unlock_status', { p_match: matchId });
  if (!unlock?.unlocked) return json({ error: 'gifts_locked', unlock }, 403);

  // RLS on `matches` ensures the caller is a participant.
  const { data: match } = await userClient
    .from('matches')
    .select('id, user_a, user_b, unmatched_at')
    .eq('id', matchId)
    .single();
  if (!match || match.unmatched_at) return json({ error: 'match not found' }, 404);
  const recipientId = match.user_a === user.id ? match.user_b : match.user_a;

  const reference = `gift_${crypto.randomUUID()}`;
  const { data: gift, error: giftErr } = await admin
    .from('gifts')
    .insert({
      match_id: matchId,
      sender_id: user.id,
      recipient_id: recipientId,
      offer_id: offerId,
      amount_pesewas: amount,
      note,
      paystack_reference: reference,
    })
    .select('id')
    .single();
  if (giftErr) return json({ error: giftErr.message }, 500);

  // Paystack requires an email; phone-auth users may not have one.
  const email = user.email || `${user.id}@users.makoma.invalid`;

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount, // pesewas
      currency: 'GHS',
      reference,
      channels: ['mobile_money'],
      metadata: { kind: 'gift', gift_id: gift.id, match_id: matchId },
    }),
  });
  const body = await res.json();
  if (!res.ok || !body.status) {
    await admin.from('gifts').update({ status: 'failed' }).eq('id', gift.id);
    return json({ error: body.message ?? 'paystack error' }, 502);
  }

  return json({ authorizationUrl: body.data.authorization_url, reference });
});

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
