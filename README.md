# Makoma

Intentional dating, built for Ghana. Intent-first matching, verified profiles, voice notes,
MoMo appreciation gifts and incognito mode for professionals.

See **[docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md)** for the full product vision and how each
feature maps to code.

> **Status:** functional scaffold. Screens use placeholder styling until the designs land.
> All visual tokens live in `src/theme/tokens.ts` and primitives in `src/components/ui.tsx`.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: without it the app runs on mock data
npx expo start
```

Camera and audio are native modules, so use a development build rather than Expo Go:
`npx eas-cli@latest build --profile development` (or `npx expo run:android` locally).

> If `npx expo install` fails with a peer-dependency (ERESOLVE) error on `react-dom`, install
> the SDK-matched version with `npm install <pkg>@<version> --legacy-peer-deps`.

## Project layout

```
src/
  app/                 Expo Router screens
    (auth)/            welcome, phone OTP
    (onboarding)/      intent → basics → prompts → voice intro → selfie verification
    (tabs)/            discover, matches, profile
    chat/[matchId]     text, voice notes, MoMo gifts
    settings/privacy   incognito sachet passes
  components/          UI primitives + ProfileCard (restyle these with the designs)
  constants/           intents, culturally rooted prompts, Ghana data (schools, languages, gifts, pricing)
  features/            data access (api.ts), voice recorder, shared-ground ranking, onboarding state
  lib/supabase.ts      Supabase client
  theme/tokens.ts      placeholder design tokens
  types/domain.ts      domain model
supabase/
  migrations/          schema, RLS, discover/match RPCs, storage policies
  functions/           gift-initiate, paystack-webhook (Deno edge functions)
  tests/               smoke test for matching, incognito and RLS on plain Postgres
```

## Backend

```bash
supabase link --project-ref <ref>
supabase db push
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_...
supabase functions deploy gift-initiate
supabase functions deploy paystack-webhook --no-verify-jwt
```

Enable **Phone** auth in the Supabase dashboard with an SMS provider, and point the
Paystack webhook URL at the `paystack-webhook` function.

## Checks

```bash
npm run typecheck
PGHOST=localhost PGPORT=5432 ./supabase/tests/run_local.sh   # needs a local Postgres
```
