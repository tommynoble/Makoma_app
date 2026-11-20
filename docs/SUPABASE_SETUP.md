# Connecting Makoma to Supabase

The app runs on demo data until two public values are set. Once they are, it
uses Supabase for sign-in, profiles, photos, likes, matches and live chat.
No code changes are needed: everything below is configuration.

## What's already built

| Area | Where |
|---|---|
| Tables, privacy rules (RLS), matching, treat lock, vouchers | `supabase/migrations/0001_init.sql` |
| Likes You, matches list, restore-my-profile APIs | `supabase/migrations/0002_app_api.sql` |
| Partner spots for treats (placeholders) | `supabase/seed.sql` |
| Paystack payments (treats) | `supabase/functions/` |
| Tests (27 checks, run on plain Postgres) | `supabase/tests/` |
| App: phone sign-in, profile save/restore, photo + voice uploads | `src/features/backend/` |
| App: deck, likes, matches, realtime chat (demo ↔ live switch) | `src/features/social/social-store.tsx` |

How the app behaves when connected:
- **Sign in** sends a real SMS code (Supabase Auth, phone provider).
- **Finishing onboarding** creates the profile on the server and uploads photos and the voice intro.
  A selfie taken during onboarding is filed for review at the same moment.
- **Signing in on a new phone** restores the profile and skips onboarding.
- **Edit profile / prompts** save to the server (only new photos are uploaded).
- **Discover, Likes You, Conversations** load from the server; chat updates live.
- Photos and voice notes live in **private** storage buckets and are shown through short-lived links.

## 1. In the Supabase dashboard (you)

1. **Create the project**: supabase.com → New project → name `makoma`, region **West EU (London)**
   (closest to Ghana). Save the database password somewhere safe.
2. **Sign-in**: the app signs in with a **6-digit email code** for now (no setup: Email is on by
   default, and the setup script switches the email to a code). Note: Supabase's built-in email only
   delivers to members of your Supabase organization and a few emails per hour. Before inviting
   testers, add custom SMTP (e.g. Resend, free tier) under Authentication → Emails → SMTP.
   - **SMS later**: Authentication → Sign In / Providers → **Phone** with an SMS provider (Twilio is
     built in; Arkesel/Hubtel are cheaper in Ghana via a hook), then set `EXPO_PUBLIC_SIGN_IN_METHOD=phone`.
3. **Copy**: Project Settings → API → **Project URL** and the **anon public** key.
   Never share the `service_role` key.
4. **Access token** (for the setup script): Account → Access Tokens → generate one.

## 2. Run the setup (Claude or a developer)

```bash
SUPABASE_ACCESS_TOKEN=sbp_... EXPO_TOKEN=... ./scripts/connect-supabase.sh <project-ref> <anon-key>
```

This links the project, applies the migrations and seed, writes `.env.local`, and stores the
two public values in EAS so phone builds and `eas update` use them. Then publish:

```bash
npx eas-cli@latest update --branch preview --environment preview --message "Connect Supabase"
```

## 3. Later

- **Payments**: `supabase secrets set PAYSTACK_SECRET_KEY=sk_test_...`, deploy
  `gift-initiate` and `paystack-webhook --no-verify-jwt`, and point Paystack's webhook at it.
- **Incognito passes** are still simulated on the device; they will be sold through Paystack and
  set `profiles.incognito_until` from the webhook.
- **Moderation**: selfie reviews and reports are in `verification_requests` and `reports`
  (Table editor works for a first pass).

## Checks

```bash
npm run typecheck
PGHOST=localhost ./supabase/tests/run_local.sh   # needs a local Postgres 16
```
