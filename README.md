# Makoma

Intentional dating, built for Ghana. Intent-first matching, verified profiles, voice notes,
treats redeemable at partner spots (paid with MoMo) and incognito mode for professionals.

See **[docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md)** for the full product vision and how each
feature maps to code.

> **Status:** first working prototype, built from the Stitch designs ("Warm Editorial Trust").
> Runs on demo data until Supabase keys are added. Previews: `docs/prototype-screens-1.png`, `-2.png`.
>
> Design system: tokens in `src/theme/` (copied from Stitch), components in `src/components/`.
> Screens only use components and tokens; never hardcode colours, sizes or fonts in a screen.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: without it the app runs on mock data
npx expo start
```

Open it in **Expo Go** on your phone (scan the QR code) or press `w` for the web preview.
For store builds, camera and audio permissions need a development build:
`npx eas-cli@latest build --profile development` (or `npx expo run:android` locally).

> If `npx expo install` fails with a peer-dependency (ERESOLVE) error on `react-dom`, install
> the SDK-matched version with `npm install <pkg>@<version> --legacy-peer-deps`.

## Project layout

```
src/
  app/                 Expo Router screens
    (auth)/            phone sign-in (SMS code)
    (onboarding)/      pledge → intentions → about → selfie → prompts → voice
    (tabs)/            discover, matches, likes, profile
    reply              like + comment sheet (native form sheet)
    chat/[matchId]     text, voice notes, treats (locked until the chat is real)
    treats             vouchers you have received (QR codes)
    settings/privacy   incognito sachet passes
  components/          design-system kit (Text, Button, Card, Pill, Icon, Screen…) + profile sections
  constants/           intents, culturally rooted prompts, Ghana data (schools, languages, sachet pricing)
  features/            data access (api.ts), voice recorder, shared-ground ranking, onboarding state
  lib/supabase.ts      Supabase client
  theme/               colours, type ramp, spacing, radii, shadows (from Stitch)
  types/domain.ts      domain model
supabase/
  migrations/          schema, RLS, discover/match RPCs, storage policies
  functions/           gift-initiate, paystack-webhook (Deno edge functions)
  tests/               smoke test for matching, incognito and RLS on plain Postgres
```

## Backend

```bash
supabase link --project-ref <ref>
supabase db push --include-seed   # seed = placeholder partners for treats
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

## Motion & interaction

Rules (from Expo's animation guidance) so the app feels premium without getting in the way:

- **Reanimated on the UI thread**, animating only `transform` and `opacity`. Helpers live in `src/lib/motion.ts`.
- **Press feedback** on every tappable surface via `PressableScale` (3% scale, 120ms). `Button`, `IconButton` and tappable `Card`s use it automatically.
- **Selection controls** (`Toggle`, `Checkbox`, `RadioMark`, `Pop`) animate state in 160–180ms; option cards use `accessibilityRole="radio"`.
- **Entrances** use `<Enter>` (CSS keyframes, 300ms, 50ms stagger), on onboarding steps and when content is swapped (next profile, treats unlocking). Tabs never animate.
- **Exits** (toasts, the treat tray) use layout animations `TOAST_IN` / `TOAST_OUT`.
- **Haptics**: one per user action, always alongside a visual change: `haptic.select()` for choices, `light()` for like, pass and send, `medium()` for roses and payments, `success()` for treats unlocking and selfies sent.
- **Reduce Motion** is respected: entrances are skipped and screens crossfade instead of sliding.
- **Photo viewer** (`src/app/photos.tsx`): native modal (swipe down on iOS), paging, opened by tapping a profile photo.
