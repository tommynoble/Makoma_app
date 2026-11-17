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

## 4. MoMo appreciation (micro-gifts)

**Insight:** Gifts and small acts of generosity are a familiar sign of serious interest.

| Feature | Detail | Code |
|---|---|---|
| Gift tray in chat | Sobolo GH₵10 · Kelewele GH₵15 · Coffee GH₵30 · Smoothie GH₵40 · Jollof date GH₵80 | `GIFT_OPTIONS` in `src/constants/ghana.ts` |
| Paystack MoMo checkout | Edge function sets the price server-side, creates a pending gift, opens Paystack (mobile money only) | `supabase/functions/gift-initiate` |
| Gift message on payment | Webhook verifies the HMAC signature, marks paid once, posts a `gift` message. Clients cannot forge gift messages | `supabase/functions/paystack-webhook`, smoke test #8 |

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
3. **Payments live:** gifts and sachet purchases end to end in Paystack test mode, then live.
4. **Trust ops:** moderation dashboard for verification and reports; automated face-match.
5. **Growth:** referral/"vouch for a friend", events (Detty December mixers), church/alumni communities.

## Open questions

- **Gift payouts.** Paying recipients out to their own MoMo wallet may count as
  money transmission under Bank of Ghana rules. Options: Paystack Transfers to a verified
  recipient, an in-app credit balance redeemable with partner vendors (coffee shops, chop
  bars), or gifts as non-cash tokens. **Get legal advice before launch.**
- **Scam risk from gifting.** "Asking for money" is a classic scam pattern. Consider
  capping gift size, allowing gifts only after N days or N messages, and never allowing requests for gifts.
- **SMS provider** for OTP in Ghana (Twilio, Hubtel, Arkesel) and its deliverability and cost.
- **Data protection.** Ghana Data Protection Act 2012 (Act 843): register with the Data
  Protection Commission; selfie retention policy.
