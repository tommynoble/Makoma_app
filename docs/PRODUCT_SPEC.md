# Makoma: Product Spec

> Intentional dating built around Ghanaian culture: communal, respectful and serious,
> not the Western swipe-and-hookup model.

This spec turns the founding vision into concrete features. Each section lists the
**cultural insight**, the **feature**, and **where it lives in the code**. Visual design
is still to come: every screen currently uses placeholder primitives (`src/components/ui.tsx`,
`src/theme/tokens.ts`) so the designs can be applied without rewriting logic.

---

## 1. Intentionality over casual swiping

**Insight:** Tinder-style apps are seen as unserious "ghost towns". Courtship is tied to
long-term partnership, networking or marriage.

| Feature | Detail | Code |
|---|---|---|
| Intent as the first onboarding question | `Looking for something serious` · `Marriage-oriented` · `Genuine friendship & networking` | `src/constants/intents.ts`, `src/app/(onboarding)/intent.tsx` |
| Intent as the primary Discover filter | Shown on every card; matched server-side | `discover_feed()` in migration, `src/app/(tabs)/discover.tsx` |
| Deliberate Like / Pass | One profile at a time, read top to bottom; no swiping | `discover.tsx` |
| "Capable man / good woman" prompts | Occupation, industry, life goals; at least one ambition or character prompt is **required** | `src/app/(onboarding)/basics.tsx`, `prompts.tsx` |

## 2. Warmth: voice notes and small talk

**Insight:** Text hides warmth, accent and humour. Going straight to the point without
checking on someone is considered cold.

| Feature | Detail | Code |
|---|---|---|
| Voice notes in chat | Hold to record, up to 60s, stored in private `voice-notes` bucket | `src/features/voice/useVoiceRecorder.ts`, `src/app/chat/[matchId].tsx` |
| Voice intro on profile | Up to 30s, any language (Twi, Ga, Ewe, Pidgin…) | `src/app/(onboarding)/voice-intro.tsx` |
| Local prompts | Sunday kenkey, jollof dealbreakers, waakye orders, trotro stories, aunties… | `src/constants/prompts.ts` |
| Like a specific prompt | Likes can attach a prompt and comment, so first messages start from banter | `likes.prompt_id`, `likes.comment` |
| Greeting nudge | Empty chat suggests asking about their day | chat empty state |

## 3. Trust, safety and reputation (anti-scam)

**Insight:** Romance scams and catfishing make people wary. In real life, people are
vouched for by friends, family, church or school.

| Feature | Detail | Code |
|---|---|---|
| Shared ground instead of mutual friends | Same school (UG, KNUST, Achimota…), local language, neighbourhood, church, intent. Shown as "You have in common" and used for ranking | `src/features/discover/sharedGround.ts`, `discover_feed()` |
| Prestige verification | Selfie with a random pose → manual or automated review. Verified users get a **gold card**, rank higher, and can be filtered for | `src/app/(onboarding)/verify.tsx`, `ProfileCard.tsx` |
| Users can't self-verify | Column-level grants block updates to `verification`, `visibility`, etc. | migration, smoke test #7 |
| Phone-number sign-in | SIM registration in Ghana makes throwaway accounts harder | `src/app/(auth)/phone.tsx` |
| Report & block | Reasons include `scam` and `asking_for_money`; blocks hide both sides everywhere | `reports`, `blocks`, `is_blocked_between()` |

## 4. Appreciation through partner treats (never cash)

**Insight:** Gifts and small acts of generosity are a familiar sign of serious interest.

**Constraints (senior dev review):**
- **Bank of Ghana:** moving cash from User A's MoMo wallet to User B's would make Makoma a
  P2P payment/remittance provider, which needs a licence. So **users never send each other money.**
  The sender buys a treat *from Makoma* (an ordinary merchant sale via Paystack) and the recipient
  gets a **voucher (QR + code) redeemable at a partner spot** (juice bar in Osu, café in East Legon…).
  Partners are settled off-platform.
- **Anti-scam:** instant gifting on the first message attracts scammers. The gift icon is
  **locked with a progress indicator** until the conversation is real, and there is **no
  "Request a gift" action anywhere** in the product.

| Feature | Detail | Code |
|---|---|---|
| Partner catalogue | Partners + offers in the DB (Sobolo GH₵10, Kelewele GH₵15, Coffee GH₵30, Smoothie GH₵40, Jollof for two GH₵80). Placeholder partners in seed data | `partners`, `partner_offers`, `supabase/seed.sql` |
| Gift lock | Unlocks after **5 messages with both people having replied**, or **1 voice note**. Locked icon shows a progress bar; tapping explains what's left. Enforced server-side | `gift_unlock_status()`, `src/features/gifts/unlock.ts`, `src/components/GiftButton.tsx`, smoke tests #11–14 |
| Buying a treat | Edge function re-checks the lock, takes the price from the catalogue, opens Paystack (mobile money) | `supabase/functions/gift-initiate` |
| Voucher issued on payment | Webhook verifies the HMAC signature, marks the gift paid once, issues an `MK-XXXX-XXXX` voucher (30-day expiry) and posts a "sent a treat" message. Only the **recipient** can see the code | `issue_voucher_for_gift()`, `paystack-webhook`, smoke tests #15–17 |
| My treats | Recipient's wallet of vouchers with QR codes | `src/app/treats.tsx` |
| Partner redemption | Partner staff scan or type the code; only valid at that partner, once, before expiry | `redeem_voucher()`, `partner_staff`, smoke tests #18–20 |
| Safety copy | Chat header: "Makoma will never ask you for money, and no one should ask you to send gifts" | `src/app/chat/[matchId].tsx` |

**Design notes for the chat UI:**
- Gift icon has two states: **locked** (🔒 + thin progress bar, muted) and **unlocked** (🎁).
- Locked tap → inline hint, e.g. *"Treats unlock after 3 more messages, or one voice note"* /
  *"Treats unlock once they reply"*.
- Treat tray shows the item, partner name and area, and price. Copy frames it as a voucher, not money.
- Gift message bubble: *"☕ Sent a treat: Coffee"*. No amounts shown to the recipient in chat.
- Never design a "request", "ask for" or "wishlist" gift affordance.

## 5. Privacy for professionals

**Insight:** Professional circles are tight, and gossip ("asemsika") keeps doctors,
lawyers and executives off dating apps.

| Feature | Detail | Code |
|---|---|---|
| Incognito mode | Your profile is shown **only to people you've liked**. Enforced in the database (`can_view_profile()`), not the app | migration, smoke tests #1–3 |
| Sachet pricing | Short passes priced like data bundles: Incognito 1 day GH₵5 / 1 week GH₵25, Boost 1h GH₵3, See likes 1 day GH₵4 | `SACHET_PLANS`, `sachet_purchases`, webhook |
| Expiry | Incognito falls back to public visibility when the pass ends | `incognito_until` check |

---

## Tech stack

- **App:** Expo SDK 58 (React Native 0.88), TypeScript, Expo Router (`src/app`).
  Native modules (camera, audio) need a development build (`eas build --profile development`), not Expo Go.
- **Backend:** Supabase: Postgres with row-level security, phone OTP auth, Storage (private buckets), Realtime (chat), Edge Functions (Deno).
- **Payments:** Paystack (GHS, mobile money: MTN MoMo, Telecel Cash, AirtelTigo Money).

## Roadmap

1. **MVP** (this scaffold): auth, onboarding, Discover, matching, text and voice chat, verification submission.
2. **Designs applied:** swap tokens, restyle primitives and screens, photos upload and gallery.
3. **Payments live:** treats and sachet purchases end to end in Paystack test mode, then live; sign first partners in Osu / East Legon / Labone.
4. **Trust ops:** moderation dashboard for verification and reports; automated face-match; partner redemption app/web page (calls `redeem_voucher`).
5. **Growth:** referral/"vouch for a friend", events (Detty December mixers), church/alumni communities.

## Open questions

- **Voucher model sign-off.** Selling treats as a merchant is far lower risk than P2P transfers, but
  prepaid vouchers can still touch e-money / stored-value rules. Confirm with a lawyer, and keep
  vouchers single-use, partner-specific, non-refundable to cash and time-limited (as built).
- **Partner settlement.** How and when partners are paid (weekly invoice of redeemed vouchers?),
  margin per treat, and what happens to expired vouchers' revenue.
- **Gift lock thresholds.** 5 messages / 1 voice note is a starting point; tune with real data.
  (It's one constant in SQL plus `GIFT_UNLOCK_MESSAGES` in the app.)
- **SMS provider** for OTP in Ghana (Twilio, Hubtel, Arkesel) and its deliverability and cost.
- **Data protection.** Ghana Data Protection Act 2012 (Act 843): register with the Data
  Protection Commission; selfie retention policy.
