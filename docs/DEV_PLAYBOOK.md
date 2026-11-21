# Dev playbook: building fast with Expo without wasting time

Lessons from building Makoma. Every rule here comes from a real mistake or a fix that saved hours.
Read it once before touching the code; skim the checklist before every release.

---

## 1. Expo basics

1. **Check the docs for your SDK version, not your memory.** Expo changes every release. Read the
   `expo` major version in `package.json`, then use `https://docs.expo.dev/versions/v<major>.0.0/` and
   `https://docs.expo.dev/llms.txt`. Example: on SDK 58, Android is edge-to-edge, which broke the usual
   keyboard handling (section 5).
2. **Install packages with `npx expo install <pkg>`.** It picks the version that matches the SDK.
   If it fails with an `ERESOLVE` / `react-dom` peer error, install the exact bundled version:
   `node -p "require('expo/bundledNativeModules.json')['<pkg>']"`, then
   `npm install <pkg>@<that version> --legacy-peer-deps`. Never install "latest" of a native package.
3. **Expo Go only has Expo's bundled native modules.** Before adding a library with native code, check
   its docs page says "Expo Go" (e.g. `react-native-keyboard-controller` does). Otherwise you need a
   development build (`eas build --profile development`).
4. **Never edit `ios/` or `android/` by hand.** They're generated. Configure native things in
   `app.json` / config plugins.

## 2. Getting builds onto a phone (EAS Update)

1. We publish with
   `npx eas-cli@latest update --branch preview --environment preview --message "…"`.
   `runtimeVersion` uses the `sdkVersion` policy, so updates reach Expo Go on the same SDK.
2. **There's one permanent link, the `preview` channel:**
   `exp://u.expo.dev/<project-id>?channel-name=preview&runtime-version=exposdk:58.0.0`.
   Don't share per-update links, because people end up testing old builds (this happened several times).
3. **"I still see the old version" is almost always caching.** Close Expo Go fully and open the link,
   wait about 10 s, then close and reopen it once more. Or shake → Reload, or remove the project from
   "Recently opened". To confirm what's live:
   `eas update:list --branch preview --limit 3` and `eas channel:view preview`.
4. **`EXPO_PUBLIC_*` values are baked in when you publish.** They come from the EAS environment
   (`--environment preview`), not from your laptop. Set them with `eas env:create`.

## 3. Design system first, screens second

1. **Tokens in `src/theme/`, components in `src/components/`.** Screens only use components and
   tokens: no hex colours, font names or magic sizes in screens. When the client said "too warm" or
   "change the paragraph font", one token change fixed the whole app.
2. **Copy exact values from the design tool** (we used Superdesign; see `.superdesign/design-system.md`).
   Don't eyeball.
3. **Check contrast with a script, not by eye.** Text needs 4.5:1, controls (switch off, radio
   rings, borders that mark a control) need 3:1. Two things we missed:
   - pale "disabled" buttons failed;
   - the switch's off state failed.
4. **Accessibility roles:** option cards are `radio` with a checked state, not `button`; chips are
   `checkbox`; give icon-only buttons a label.
5. **Icons are a subset font map** (`src/components/icon-glyphs.ts`). New icon names must be added
   there from `expo-symbols/build/android/symbols.json`. Don't silence TypeScript with
   `as IconName`: it hid a missing `home` icon that would have shown as a blank square.

## 4. Motion and haptics

1. Animate only `transform` and `opacity`, about 120–300 ms, and respect Reduce Motion.
2. **Don't use Reanimated `entering` layout animations with delays for screen entrances.** On web
   they made sections jump to `position: absolute` about 2 s after mounting. We use the `<Enter>`
   component (CSS keyframes) for entrances and keep layout animations for exits only
   (`TOAST_IN` / `TOAST_OUT`).
3. **Exit animations need the parent to stay mounted.** Otherwise they never play.
4. **One haptic per user action, always with a visual change:**
   - `select()` for choices;
   - `light()` for like, pass and send;
   - `medium()` for roses and payments;
   - `success()` for matches, saves and unlocks.

   The `haptic` helper does nothing on web.

## 5. Keyboard (test on Android!)

1. **Android is edge-to-edge, so the window no longer resizes for the keyboard.** The old
   `behavior={iOS ? 'padding' : undefined}` hid fields on Android.
2. Use `react-native-keyboard-controller` (in Expo Go), with `KeyboardProvider` at the root:
   - **forms:** `FormScrollView`, which wraps `KeyboardAwareScrollView`;
   - **chat:** its `KeyboardAvoidingView` with `behavior="padding"` and a *measured*
     `keyboardVerticalOffset`;
   - **every form:** `<KeyboardDoneBar />` (Done plus previous/next field).
3. **Hiding the keyboard must be easy:** `keyboardShouldPersistTaps="handled"` (tap outside),
   `keyboardDismissMode="interactive"` (swipe down), and the Done bar. Set
   `tabBarHideOnKeyboard: true` on the tabs.

## 6. React rules that bit us (lint catches them; don't ignore lint)

1. **No `setState` directly in an effect body.** Do it in a callback, a timeout or an event handler.
2. **No impure calls in render** (`Date.now()`, `Math.random()`): move them into a helper outside the
   component, or into an event handler.
3. **Refs:** use `useRef<ComponentRef<typeof View>>(null)`, not `useRef<View>()`.
4. **Context functions must be stable** (`useCallback` / `useMemo`). An unstable `update()` used in an
   effect's dependencies causes an endless loop.
5. **Persisted state:** merge saved data over the initial value (`{ ...initial, ...saved }`), so new
   fields have defaults for existing users.

## 7. Architecture: demo mode first

1. **Every feature works on realistic mock data first**, saved on the device (AsyncStorage via
   `usePersistentState`). The client can test the whole app in Expo Go before any backend exists.
2. **One store/API per domain switches to the real backend when keys exist**
   (`isBackendConfigured`). Screens never know which mode is live (`src/features/social/social-store.tsx`).
3. **Network calls:** give every step a timeout and an error that names the step. Only truly required
   steps may block. Remember progress, so a retry doesn't redo uploads. A save with no timeout left a
   user stuck on "Saving your profile…".
4. **Uploads:** on native read files with `new File(uri).arrayBuffer()` (expo-file-system); on web use
   `fetch(uri).arrayBuffer()`. `src/features/backend/media.ts` already handles both.

## 8. Supabase: security and gotchas

1. **Row-level security on every table, and a test that tries to break every rule**
   (`supabase/tests/smoke_test.sql`, runs on plain Postgres with
   `./supabase/tests/run_local.sh`). The tests caught three real bugs:
   - **Supabase grants functions to `anon` and `authenticated` by default.** `revoke … from public`
     is not enough; revoke from `public, anon, authenticated`. This leaked hidden profiles.
   - **Account deletion failed because of foreign keys** (gifts). Decide `on delete` behaviour for
     every reference to a user: cascade personal data, set payment records to null.
   - **Column-level update grants break `upsert`.** Upsert updates every column it inserts, so select
     first, then `insert` or `update`.
2. **Keys, in plain words:**
   - `sb_publishable_…` (or the anon key): goes in the app, safe.
   - `sb_secret_…`: **never** in the app or chat. Revoke it if it's ever exposed.
   - `sbp_…` access token: full account access, for setup tools only. Give it an expiry and delete
     it after use.
   - Never paste secrets into chat or commit them. `.env.local` is git-ignored.
3. **Sign-in:** email codes need `{{ .Token }}` in the email template; by default Supabase sends a
   link. Supabase's built-in email only reaches members of your Supabase organisation, a few per hour.
   Add custom SMTP (e.g. Resend) before inviting testers. SMS needs a provider.
4. **Apply migrations** with the Supabase CLI (`db push`), or the Management API's
   `/database/query` endpoint when the database port isn't reachable. Record versions in
   `supabase_migrations.schema_migrations`.
5. **Debug "it fails on the phone"** by replaying the exact SQL as the user inside a transaction:
   `begin; set local role authenticated; select set_config('request.jwt.claims', '{"sub":"<uid>","role":"authenticated"}', true); …; rollback;`.
   It gives you the exact error with no side effects.
6. **Multi-statement SQL queries return only the last result.** Run one check per query, or you'll
   misread the database (we did once).

## 9. Testing before every publish

1. `npx tsc --noEmit` and `npx expo lint` must both be clean.
2. **Web export in demo mode:**
   `EXPO_NO_DOTENV=1 EXPO_OFFLINE=1 npx expo export -p web --output-dir <dir>`.
   Without `EXPO_NO_DOTENV=1` the build picks up `.env.local`, and your tests hit the **real**
   backend (this happened).
3. **Playwright click-through of every flow, with screenshots, and actually look at them.** Fail on any
   page error.
   - Use exact selectors (`{ name: 'Man', exact: true }`, because "Man" also matches "Woman").
   - On web, previous stack screens stay mounted, so use `.last()` for duplicated labels.
4. **Web can't test haptics, the real keyboard, the camera or push notifications.** Say so, and test
   those on a phone.

## 10. Working habits

1. **Small commits with clear messages; push to your branch.** Never push to `main` without a PR.
2. **Don't run a formatter (Prettier) on files when the project has no formatter config.** It
   rewrote 7 files and buried a 40-line change in a 1,600-line diff.
3. **Bulk find-and-replace needs word boundaries.** Replacing `surfaceContainerLow` also hit
   `surfaceContainerLowest` and corrupted two screens.
4. **Look before you change anything outside the code** (live database, auth settings, a teammate's
   branch). Read-only checks first.
5. **Report honestly:** what was tested, what wasn't, and what the person should try. "Tests pass"
   when the test server was down is a lie; check the test actually ran.

---

## Pre-release checklist

- [ ] `npx tsc --noEmit` clean
- [ ] `npx expo lint` clean
- [ ] DB smoke tests pass (if `supabase/` changed)
- [ ] Demo-mode web export plus Playwright flows pass, screenshots checked
- [ ] Keyboard checked on a real Android phone for any screen with inputs
- [ ] New colours checked for contrast; new icons added to the glyph map
- [ ] No secrets in the diff (`git diff | grep -iE "sb_secret|sbp_|service_role"`)
- [ ] Committed and pushed to the branch
- [ ] `eas update --branch preview --environment preview` published; confirmed with `eas update:list`
