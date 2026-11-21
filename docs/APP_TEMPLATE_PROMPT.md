# App template prompt

A reusable prompt for starting a new app the way Makoma was built: design tool → design system →
demo mode first → backend behind the same API → automated checks → updates to your phone.

Paste it into a new Claude Code session and fill in the `[brackets]`.

**Tips**
- Paste a Superdesign draft link or screenshots so the new app starts from a look you already like.
- Connect Superdesign, Higgsfield and an Expo token (through the secure prompt) before starting.
- Biggest time saver: ask the new session to copy `src/theme/`, `src/components/`, `src/lib/` and
  `supabase/tests/` from `tommynoble/Makoma_app` as a starting point.

---

```
You are building a new mobile app with me. Follow the same workflow we used for Makoma
(an Expo/React Native dating app built end to end from my phone). Work autonomously:
build, test, publish, then tell me what to try. Don't ask me to do things you can do.

## The app
- Name: [APP NAME]
- One-line pitch: [WHAT IT DOES AND FOR WHOM]
- Market/culture: [COUNTRY / AUDIENCE, local details to use in content]
- Core features: [3–6 BULLETS]
- Rules that must never break: [e.g. "no cash between users", "18+ only"]
- Look and feel: [MOOD, e.g. "editorial, calm, premium"; things to avoid]

## Workflow (in this order)

1. Stack (check current docs first; never trust memory)
   - Expo (latest SDK), Expo Router in src/app, TypeScript, path alias @/* → src/*.
   - Read the `expo` major version in package.json, then fetch
     https://docs.expo.dev/versions/v<major>.0.0/ and https://docs.expo.dev/llms.txt before touching
     any Expo API.
   - Install with `npx expo install` (fall back to `npm install pkg@<bundled version> --legacy-peer-deps`).
   - Reanimated for motion, expo-haptics, react-native-keyboard-controller for keyboards.

2. Design (Superdesign)
   - Write .superdesign/design-system.md: product context, key pages, mood, colour table, type,
     spacing/radius/shadows, components, content rules.
   - Use Superdesign (CLI/plugin; I'll log in) to generate drafts of the key screens. When I pick
     a draft, copy its exact tokens.
   - Colours must pass WCAG AA (4.5:1 text, 3:1 controls). Check every pair with a script.
   - Paragraph text in a sans-serif; serif only for titles and names, if the style uses one.

3. Design system before screens
   - src/theme/: colors.ts, typography.ts, spacing.ts (spacing, radius, shadows, maxContentWidth).
   - src/components/: Text, Button (variants + haptics), IconButton, Card, Pill, Field, Toggle,
     Checkbox, RadioMark, Chip, ListRow, Screen (header, progress, footer, keyboard-aware scroll),
     PressableScale, Enter (entrance animation), Skeleton, keyboard helpers.
   - Screens only use components and tokens: never hardcode colours, sizes or fonts in a screen.
   - Motion: transform/opacity only, ~120–300ms, stagger entrances, respect Reduce Motion.
     One haptic per user action.

4. Demo mode first, backend behind the same API
   - Build every feature on realistic mock data, persisted on the device (AsyncStorage), so the whole
     app works in Expo Go before any backend exists.
   - One store/API per domain that switches automatically to the real backend when env keys are
     present (EXPO_PUBLIC_*). Screens never know which mode is live.
   - Generate realistic demo photos with Higgsfield if connected (match the market).

5. Backend (Supabase, when I'm ready)
   - SQL migrations in supabase/migrations with row-level security on every table; RPCs for complex
     reads; private storage buckets with signed URLs; realtime where needed.
   - Smoke tests in supabase/tests runnable on local Postgres 16 (stub auth/storage); every security
     rule gets a test that tries to break it.
   - Email-code sign-in first (no SMS provider needed), phone later.
   - Never ask me to paste secrets in chat; use the secure credential prompt. Never commit keys.

6. Quality gate before every publish
   - `npx tsc --noEmit` and `npx expo lint` clean.
   - Web export (demo mode: EXPO_NO_DOTENV=1) plus Playwright scripts that click through every flow
     and screenshot it; zero page errors. Look at the screenshots.
   - Keyboard never covers inputs (Android is edge-to-edge); easy to dismiss everywhere.

7. Ship to my phone
   - EAS Update to a `preview` branch/channel; give me one permanent Expo Go link
     (exp://u.expo.dev/<project-id>?channel-name=preview&runtime-version=...).
   - Commit and push to my branch after each round with a clear message.

8. Product must-haves (build them, don't wait to be asked)
   - Safety: report/block, unmatch or leave, scam or abuse nudges where relevant, safety centre.
   - Account: settings, pause, delete account (store requirement), notification preferences,
     draft terms/privacy pages (flag them for lawyer review).
   - Empty states, loading skeletons, error messages with a retry, accessibility labels.

## How to report back
After each round: what I can try on my phone (step by step), what you tested, what you couldn't test,
and the single next step you recommend. Plain language, short.

Start by asking me only what you can't infer, then begin with the design system file.
```
