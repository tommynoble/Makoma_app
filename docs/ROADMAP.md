# Makoma roadmap

The prototype works end to end on demo data (profile, likes, matches, chat, treats, incognito,
all saved on the device). The next steps turn it into a real product, in priority order.

## 1. Connect the backend (Supabase): demo → real
The schema, row-level security and smoke tests already exist in `supabase/`, and the app code is
written (`src/features/backend/`). What's left is configuration: see `docs/SUPABASE_SETUP.md`.
- [ ] Create a Supabase project and add the URL + anon key (`.env.local`, EAS environment)
- [ ] Phone sign-in with a real SMS provider that covers Ghana (Twilio, Hubtel or Arkesel)
- [x] Upload photos and voice notes to Supabase Storage (code ready)
- [x] Discover, likes, matches from the API with a demo fallback (code ready)
- [x] Realtime chat between real accounts (code ready)
- [x] Birthday (18+), gender and "show me" collected in onboarding
- [ ] Run `scripts/connect-supabase.sh` once the project exists

## 2. Safety basics (needed before any launch)
- [ ] Report and block from any profile or chat
- [ ] Unmatch
- [ ] Review queue for selfie verification and reports

## 3. Development build
Expo Go can't do push notifications and limits camera/audio.
- [ ] `eas build --profile development` for Android (free)
- [ ] iOS development build (needs an Apple Developer account, $99/year)

## 4. Payments (Paystack, MoMo)
Edge functions `gift-initiate` and `paystack-webhook` are written.
- [ ] Paystack account and test keys
- [ ] Incognito passes through Paystack
- [ ] Sign one or two real partner spots for treat vouchers (e.g. a café in Osu)

## 5. Push notifications
- [ ] New match, new message, "someone liked your answer"

## 6. Store launch prep
- [ ] App icon and splash screen
- [ ] Privacy policy and terms (dating apps get extra review), 18+ age check
- [ ] Store screenshots and listing copy
- [ ] Submit to Google Play first, then the App Store

**Suggested start:** 1 and 2 together, then a closed test with 10–20 people in Accra.
Payments can wait until people are actually chatting.
