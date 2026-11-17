// Supabase Edge Function (Deno): Paystack webhook.
// Deploy with `--no-verify-jwt` (Paystack doesn't send a Supabase JWT); requests
// are authenticated by the x-paystack-signature HMAC instead.
import { createClient } from 'npm:@supabase/supabase-js@2';

const SACHET_HOURS: Record<string, number> = {
  incognito_24h: 24,
  incognito_7d: 168,
  boost_1h: 1,
  see_likes_24h: 24,
};

Deno.serve(async (req) => {
  const raw = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';
  if (!(await validSignature(raw, signature))) return new Response('bad signature', { status: 401 });

  const event = JSON.parse(raw);
  if (event.event !== 'charge.success') return new Response('ignored');

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const reference: string = event.data.reference;
  const amount: number = event.data.amount;

  if (reference.startsWith('gift_')) {
    // Only flip pending -> paid once (webhooks can be retried).
    const { data: gift } = await admin
      .from('gifts')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('paystack_reference', reference)
      .eq('status', 'pending')
      .eq('amount_pesewas', amount)
      .select('id, match_id, sender_id')
      .maybeSingle();
    if (gift) {
      await admin.from('messages').insert({
        match_id: gift.match_id,
        sender_id: gift.sender_id,
        kind: 'gift',
        gift_id: gift.id,
      });
      // TODO: pay the recipient out to their MoMo wallet (Paystack Transfers),
      // or credit an in-app balance. See docs/PRODUCT_SPEC.md "Open questions".
    }
  } else if (reference.startsWith('sachet_')) {
    const { data: purchase } = await admin
      .from('sachet_purchases')
      .select('id, profile_id, plan_id, status, amount_pesewas')
      .eq('paystack_reference', reference)
      .maybeSingle();
    if (purchase && purchase.status === 'pending' && purchase.amount_pesewas === amount) {
      const now = new Date();
      const ends = new Date(now.getTime() + (SACHET_HOURS[purchase.plan_id] ?? 0) * 3600_000);
      await admin
        .from('sachet_purchases')
        .update({ status: 'paid', starts_at: now.toISOString(), ends_at: ends.toISOString() })
        .eq('id', purchase.id);
      if (purchase.plan_id.startsWith('incognito')) {
        await admin
          .from('profiles')
          .update({ visibility: 'incognito', incognito_until: ends.toISOString() })
          .eq('id', purchase.profile_id);
      } else if (purchase.plan_id.startsWith('boost')) {
        await admin.from('profiles').update({ boost_until: ends.toISOString() }).eq('id', purchase.profile_id);
      }
    }
  }

  return new Response('ok');
});

async function validSignature(raw: string, signature: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(Deno.env.get('PAYSTACK_SECRET_KEY')!),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
