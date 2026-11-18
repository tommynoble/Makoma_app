# Makoma design system: "Warm Editorial Trust"

## Product context
Makoma is an intentional dating app for Ghana and the Ghanaian diaspora. It rejects the Western
swipe-and-hookup model: intent comes before looks, respect and reputation matter, and trust is
earned through verification and shared ground (same school, language, neighbourhood, church).

Jobs to be done:
- "Help me meet someone who wants the same thing I want (marriage, something serious, or genuine friendship)."
- "Let me judge character and ambition, not just photos."
- "Let me hear someone's warmth (voice notes, local languages: Twi, Ga, Ewe, Fante, Pidgin) before I commit."
- "Keep me safe from scammers and keep my privacy from colleagues."

## Key pages
1. Phone sign-in (+233, SMS code)
2. Onboarding (5 short steps, progress bar + one big title per step): Community Pledge, Intentions & Location,
   About You (work, goals, schools), Selfie Verification (skippable), Voice Intro (skippable). The 3 prompts
   (Food & Culture, Values & Ambition, Playful Debate) are done later from the Profile, which shows a
   completion percentage.
3. Discover: ONE profile at a time, read top to bottom like an editorial page. NO swiping. Each photo
   and answer has its own heart that opens a reply sheet. Floating bar: Pass, Send Rose, Like.
4. Reply sheet: like a specific item with a written note (250 chars), a 20s voice reply, or a rose
5. Conversations list, Chat (text + voice notes + treats), Likes You, My Profile
6. Treats: gifts are vouchers redeemable at partner spots (juice bar in Osu, café in East Legon), paid
   with MoMo. Never cash between users. Treats unlock only after 3 voice notes are exchanged by both
   people. There is NEVER a "request a gift" control.
7. My treats (voucher QR codes), Incognito (short "sachet" passes: 1 day GH₵5, 1 week GH₵25)

## Mood
A high-production literary journal or personal archive: unbleached parchment, terracotta earth,
calm coastal teal. Reassuring, culturally proud, intimate and secure. Spacious, patient pacing.
Avoid: neon, gamification, purple/pink gradients, generic dating-app chrome, confetti, emoji used as icons.

## Colour (light mode only, "Bold Editorial Intent" v4; all text pairs pass WCAG AA)
| Role | Hex |
|---|---|
| Canvas (warm sand; white cards stand out 1.2:1) | `#F3E9E1` |
| Card | `#FFFFFF` (1px hairline `rgba(10,8,5,.06)`) |
| Tint panel on canvas / selected bg | `#FFF7F2` |
| Pills / chips on white cards | `#F2E3D8` |
| Unselected controls (switch off, radio ring) | `#7A6E66` (3:1+) |
| Text (espresso) | `#0A0805` |
| Muted text | `#3D3530` |
| Placeholder | `#6E6560` |
| Deep teal (headings accents, icons, strong actions) | `#1A4A47` |
| Button teal (default CTA, white text 5.8:1) | `#2D6F6C` |
| Terracotta (selection, voice, warm actions, white text 6.3:1) | `#A83B2A` |
| Terracotta tint | `#FFB3A0` |
| Soft terracotta (decoration only, never text) | `#E8664F` |
| Mint highlight | `#7FE9E0` |
| Disabled button | `#FBEBE1` fill, `#6E6560` text |

## Typography
- **Fraunces** (serif) for titles, names, prompts and answers. Screen titles 32/38 semibold, tracking -0.02em.
- **Plus Jakarta Sans** for interface: buttons bold, labels semibold, eyebrows 11px bold uppercase tracking 0.1em in muted.

## Spacing, shape, depth
- Screen margin 20px; spacing scale 4 / 8 / 16 / 24 / 36. Generous vertical gaps between cards (24px).
- Radius: 12 (onboarding/v4 cards), 16 (inputs), 32 (editorial Discover cards), pill for buttons and chips.
- Card shadow (v4): `0 8px 30px rgba(10,8,5,.12)`.
- Shadows are soft and warm-tinted: `0 1px 2px rgba(44,36,30,.05)` for cards,
  `0 4px 6px -1px rgba(44,36,30,.08)` raised, `0 8px 20px -4px rgba(40,104,101,.35)` strong teal CTA.
- Header: surface with a hairline shadow `0 1px 8px rgba(0,0,0,.04)`. Bottom tab bar: surface with `0 -4px 20px rgba(44,36,30,.05)`.

## Components
- **Primary button**: full-width pill, 56px tall, soft teal `#6BA8A4`, white Label LG text, trailing arrow icon.
  Strong variant deep teal `#286865` with teal glow. Warm variant terracotta `#8E4C40` (e.g. "Send Rose"). Tonal: `#F5E5DC`.
- **Cards**: white or `#FFF1E8`, radius 32, padding 16–24, soft shadow, no borders.
- **Selectable card** (intents, plans): selected = `#F5E5DC` fill + terracotta round check; unselected = white + empty `#EFE0D6` circle.
- **Pills/chips**: rounded, `#F5E5DC` or tints, optional leading icon in teal or terracotta.
- **Icon badge**: 40–48px circle/rounded square in a tint with a Material Symbol.
- **Segmented progress**: 4px pill dashes, teal `#6BA8A4` done, `#EFE0D6` remaining.
- **Voice note**: pill/card with round play button (terracotta), variable-height bars (teal played, `#BFC8C7` rest), duration.
- **Verified badge**: shield-check icon in teal on a near-white pill, "Selfie Verified".
- **Treat lock banner**: lock badge + "Treat tray unlocking · 2 of 3 voice notes exchanged" + three dots; mint when unlocked.
- Icons: Material Symbols Outlined (filled for active/selected). Tab icons: local_fire_department, forum, favorite, person.

## Content rules
- App name is always **Makoma** (serif wordmark in deep teal). Never "Duafe" or anything else.
- Realistic Ghanaian content: Accra neighbourhoods (East Legon, Osu, Cantonments, Labone), Kumasi, kenkey,
  shito, kelewele, jollof, waakye, trotro, Detty December, Methodist/church life, KNUST/UG/Achimota.
- No invented statistics ("3x more replies"). No "request a gift" anywhere.
- Mobile, 390px wide.
