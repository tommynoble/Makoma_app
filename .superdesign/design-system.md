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
2. Onboarding (6 steps, segmented progress bar): Community Pledge, Intentions & Location, About You
   (work, goals, schools), Selfie Verification (random pose), Cultural Prompts (3 slots: Food & Culture,
   Values & Ambition, Playful Debate), Voice Intro (20s)
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

## Colour (light mode only)
| Role | Hex |
|---|---|
| Canvas / surface | `#FFF8F5` |
| Card (lowest) | `#FFFFFF` |
| Card tint (low) | `#FFF1E8` |
| Container | `#FBEBE1` |
| Container high (chips, selected cards) | `#F5E5DC` |
| Container highest (inactive tracks) | `#EFE0D6` |
| Text (espresso) | `#221A14` |
| Text variant | `#3F4948` |
| Muted text | `#635D56` |
| Placeholder / quiet | `#A49C93` |
| Outline variant | `#BFC8C7` |
| Primary (deep teal: strong CTA, active icons, trust) | `#286865` |
| Primary container (soft teal: default CTA fill) | `#6BA8A4` |
| Primary fixed (mint highlight) | `#AFEEE9` |
| Secondary (terracotta: warm actions, selection, voice) | `#8E4C40` |
| Secondary container | `#FDA99A` |
| Secondary fixed (terracotta tint) | `#FFDAD4` |
| Error | `#BA1A1A` |
| Sheet scrim | `rgba(44,36,30,0.58)` |

## Typography
- **Newsreader** (serif) for identity, headlines, prompts and people's answers. Italic for quoted answers.
  - Headline XL 30/38 regular, -0.01em · Headline LG 24/32 medium · Headline MD 22/28 medium
  - Body LG 20/30 · Body MD 16/24
- **Plus Jakarta Sans** for all interface utility: buttons, labels, chips, metadata.
  - Label LG 15/20 semibold · Label MD 13/18 semibold · Label SM 11/14 bold
  - Eyebrows: Label SM, UPPERCASE, wide tracking (~0.1em), often with a small coloured dot.

## Spacing, shape, depth
- Screen margin 20px; spacing scale 4 / 8 / 16 / 24 / 36. Generous vertical gaps between cards (24px).
- Radius: 6 (tiny tags), 16 (inputs, small cards), 32 (cards), 48 (hero cards), pill for buttons and chips.
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
