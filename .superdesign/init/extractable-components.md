# Extractable components

## Layout

## TopBar (Screen header)
- Source: `src/components/screen.tsx`
- Category: layout
- Description: Top bar with back arrow, serif "Makoma" wordmark, optional "Step N of 6" and segmented progress bar
- Extractable props: step (number, default: none), showBack (boolean, default: true)
- Hardcoded: wordmark text, arrow_back icon, colors, header shadow

## BottomTabBar
- Source: `src/app/(tabs)/_layout.tsx`
- Category: layout
- Description: Four tabs (Discover, Matches, Likes, Profile), filled teal icon when active
- Extractable props: activeItem (string, default: "discover")
- Hardcoded: labels, Material Symbols names (local_fire_department, forum, favorite, person)

## ChatComposer
- Source: `src/app/chat/[matchId].tsx`
- Category: layout
- Description: Gift button (locked/unlocked), rounded message field, mic/send button
- Extractable props: treatsUnlocked (boolean, default: false)
- Hardcoded: icons, placeholder text

## Basic

## Button
- Source: `src/components/button.tsx`
- Category: basic
- Description: Pill button, variants primary (soft teal), strong (deep teal), warm (terracotta), tonal; sizes md 48 / lg 56
- Extractable props: variant (string, default: "primary"), disabled (boolean, default: false)
- Hardcoded: label, trailing arrow icon

## Card
- Source: `src/components/surface.tsx`
- Category: basic
- Description: Rounded surface (white or warm tint) with soft shadow
- Extractable props: selected (boolean, default: false)
- Hardcoded: children

## Pill
- Source: `src/components/surface.tsx`
- Category: basic
- Description: Rounded chip for eyebrows, identity tags and status badges, optional dot or icon
- Extractable props: none
- Hardcoded: label, icon, colours

## ProgressSegments
- Source: `src/components/surface.tsx`
- Category: basic
- Description: Thin segmented onboarding progress (6 segments, teal fill)
- Extractable props: current (number, default: 1)
- Hardcoded: total 6

## TreatUnlockBanner
- Source: `src/components/gift-button.tsx`
- Category: basic
- Description: Lock badge + "Treat tray unlocking · 2 of 3 voice notes exchanged" + 3 progress dots; mint when unlocked
- Extractable props: voiceNotes (number, default: 2), unlocked (boolean, default: false)
- Hardcoded: copy, icons

## VoiceNoteBubble / Waveform
- Source: `src/components/waveform.tsx`, `src/app/chat/[matchId].tsx`
- Category: basic
- Description: Play button + variable-height bars + duration
- Extractable props: mine (boolean, default: false)
- Hardcoded: bar heights, colours

## ProfileSections (HeroPhotoCard, SharedGroundCard, VoicePromptCard, TextPromptCard, PhotoCard, ValuesCard)
- Source: `src/components/profile/sections.tsx`
- Category: basic
- Description: The editorial Discover profile blocks, each likeable item has a heart
- Extractable props: verified (boolean, default: true)
- Hardcoded: layout, icons
