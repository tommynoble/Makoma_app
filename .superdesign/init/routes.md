# Routes (Expo Router, file-based)

Layouts: root Stack in `src/app/_layout.tsx`; tabs group `(tabs)`; groups `(auth)`, `(onboarding)` have no layout of their own.

| URL | File | Summary |
|---|---|---|
| `/phone` | `src/app/(auth)/phone.tsx` | Phone sign-in (+233, SMS code) |
| `/about` | `src/app/(onboarding)/about.tsx` | Onboarding 3/6: name, occupation, goals, schools (no Stitch design yet) |
| `/intentions` | `src/app/(onboarding)/intentions.tsx` | Onboarding 2/6: intent + neighbourhood + hide-distance toggle |
| `/pledge` | `src/app/(onboarding)/pledge.tsx` | Onboarding 1/6: community pledge |
| `/prompts` | `src/app/(onboarding)/prompts.tsx` | Onboarding 5/6: three prompt slots |
| `/selfie` | `src/app/(onboarding)/selfie.tsx` | Onboarding 4/6: live selfie verification with random pose |
| `/voice` | `src/app/(onboarding)/voice.tsx` | Onboarding 6/6: 20s voice intro recorder |
| `/discover` | `src/app/(tabs)/discover.tsx` | Tab: one profile at a time, editorial cards, pass / rose / like |
| `/likes` | `src/app/(tabs)/likes.tsx` | Tab: likes you (placeholder empty state) |
| `/matches` | `src/app/(tabs)/matches.tsx` | Tab: conversations list (placeholder) |
| `/profile` | `src/app/(tabs)/profile.tsx` | Tab: my profile + links (placeholder) |
| `/chat/[matchId]` | `src/app/chat/[matchId].tsx` | Chat: text, voice notes, treat unlock banner, treat tray |
| `/` | `src/app/index.tsx` | Redirect to /phone |
| `/reply` | `src/app/reply.tsx` | Sheet: like a specific item with note / voice reply / rose |
| `/settings/privacy` | `src/app/settings/privacy.tsx` | Incognito sachet passes |
| `/treats` | `src/app/treats.tsx` | My treats: voucher QR codes |
