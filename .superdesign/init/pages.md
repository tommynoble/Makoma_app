# Pages: dependency trees

## /discover (Tab: one profile at a time, editorial cards, pass / rose / like)
Entry: src/app/(tabs)/discover.tsx
Dependencies:
- src/components/index.ts
  - src/components/button.tsx
    - src/theme/index.ts
      - src/theme/colors.ts
      - src/theme/spacing.ts
      - src/theme/typography.ts
    - src/components/icon.tsx
      - src/components/icon-glyphs.ts
    - src/components/text.tsx
  - src/components/controls.tsx
  - src/components/screen.tsx
    - src/components/surface.tsx
  - src/components/waveform.tsx
- src/components/profile/sections.tsx
  - src/constants/ghana.ts
    - src/types/domain.ts
  - src/constants/intents.ts
  - src/constants/prompts.ts
- src/features/api.ts
  - src/lib/supabase.ts
  - src/features/mock-data.ts
    - src/features/discover/shared-ground.ts

## /chat/[matchId] (Chat: text, voice notes, treat unlock banner, treat tray)
Entry: src/app/chat/[matchId].tsx
Dependencies:
- src/components/index.ts
  - src/components/button.tsx
    - src/theme/index.ts
      - src/theme/colors.ts
      - src/theme/spacing.ts
      - src/theme/typography.ts
    - src/components/icon.tsx
      - src/components/icon-glyphs.ts
    - src/components/text.tsx
  - src/components/controls.tsx
  - src/components/screen.tsx
    - src/components/surface.tsx
  - src/components/waveform.tsx
- src/components/gift-button.tsx
  - src/features/gifts/unlock.ts
    - src/types/domain.ts
- src/constants/ghana.ts
- src/features/api.ts
  - src/lib/supabase.ts
  - src/features/mock-data.ts
    - src/features/discover/shared-ground.ts
- src/features/voice/use-voice-recorder.ts

## /reply (Sheet: like a specific item with note / voice reply / rose)
Entry: src/app/reply.tsx
Dependencies:
- src/components/index.ts
  - src/components/button.tsx
    - src/theme/index.ts
      - src/theme/colors.ts
      - src/theme/spacing.ts
      - src/theme/typography.ts
    - src/components/icon.tsx
      - src/components/icon-glyphs.ts
    - src/components/text.tsx
  - src/components/controls.tsx
  - src/components/screen.tsx
    - src/components/surface.tsx
  - src/components/waveform.tsx
- src/components/profile/sections.tsx
  - src/constants/ghana.ts
    - src/types/domain.ts
  - src/constants/intents.ts
  - src/constants/prompts.ts
- src/features/api.ts
  - src/lib/supabase.ts
  - src/features/mock-data.ts
    - src/features/discover/shared-ground.ts
- src/features/voice/use-voice-recorder.ts

## /voice (Onboarding 6/6: 20s voice intro recorder)
Entry: src/app/(onboarding)/voice.tsx
Dependencies:
- src/components/index.ts
  - src/components/button.tsx
    - src/theme/index.ts
      - src/theme/colors.ts
      - src/theme/spacing.ts
      - src/theme/typography.ts
    - src/components/icon.tsx
      - src/components/icon-glyphs.ts
    - src/components/text.tsx
  - src/components/controls.tsx
  - src/components/screen.tsx
    - src/components/surface.tsx
  - src/components/waveform.tsx
- src/features/onboarding/onboarding-context.tsx
  - src/features/voice/use-voice-recorder.ts
  - src/types/domain.ts

## /prompts (Onboarding 5/6: three prompt slots)
Entry: src/app/(onboarding)/prompts.tsx
Dependencies:
- src/components/index.ts
  - src/components/button.tsx
    - src/theme/index.ts
      - src/theme/colors.ts
      - src/theme/spacing.ts
      - src/theme/typography.ts
    - src/components/icon.tsx
      - src/components/icon-glyphs.ts
    - src/components/text.tsx
  - src/components/controls.tsx
  - src/components/screen.tsx
    - src/components/surface.tsx
  - src/components/waveform.tsx
- src/constants/prompts.ts
- src/features/onboarding/onboarding-context.tsx
  - src/features/voice/use-voice-recorder.ts
  - src/types/domain.ts

## /selfie (Onboarding 4/6: live selfie verification with random pose)
Entry: src/app/(onboarding)/selfie.tsx
Dependencies:
- src/components/index.ts
  - src/components/button.tsx
    - src/theme/index.ts
      - src/theme/colors.ts
      - src/theme/spacing.ts
      - src/theme/typography.ts
    - src/components/icon.tsx
      - src/components/icon-glyphs.ts
    - src/components/text.tsx
  - src/components/controls.tsx
  - src/components/screen.tsx
    - src/components/surface.tsx
  - src/components/waveform.tsx
- src/features/api.ts
  - src/lib/supabase.ts
  - src/types/domain.ts
  - src/features/mock-data.ts
    - src/features/discover/shared-ground.ts
- src/features/onboarding/onboarding-context.tsx
  - src/features/voice/use-voice-recorder.ts

## /intentions (Onboarding 2/6: intent + neighbourhood + hide-distance toggle)
Entry: src/app/(onboarding)/intentions.tsx
Dependencies:
- src/components/index.ts
  - src/components/button.tsx
    - src/theme/index.ts
      - src/theme/colors.ts
      - src/theme/spacing.ts
      - src/theme/typography.ts
    - src/components/icon.tsx
      - src/components/icon-glyphs.ts
    - src/components/text.tsx
  - src/components/controls.tsx
  - src/components/screen.tsx
    - src/components/surface.tsx
  - src/components/waveform.tsx
- src/constants/ghana.ts
  - src/types/domain.ts
- src/constants/intents.ts
- src/features/onboarding/onboarding-context.tsx
  - src/features/voice/use-voice-recorder.ts

## /pledge (Onboarding 1/6: community pledge)
Entry: src/app/(onboarding)/pledge.tsx
Dependencies:
- src/components/index.ts
  - src/components/button.tsx
    - src/theme/index.ts
      - src/theme/colors.ts
      - src/theme/spacing.ts
      - src/theme/typography.ts
    - src/components/icon.tsx
      - src/components/icon-glyphs.ts
    - src/components/text.tsx
  - src/components/controls.tsx
  - src/components/screen.tsx
    - src/components/surface.tsx
  - src/components/waveform.tsx
- src/features/onboarding/onboarding-context.tsx
  - src/features/voice/use-voice-recorder.ts
  - src/types/domain.ts

## /phone (Phone sign-in (+233, SMS code))
Entry: src/app/(auth)/phone.tsx
Dependencies:
- src/components/index.ts
  - src/components/button.tsx
    - src/theme/index.ts
      - src/theme/colors.ts
      - src/theme/spacing.ts
      - src/theme/typography.ts
    - src/components/icon.tsx
      - src/components/icon-glyphs.ts
    - src/components/text.tsx
  - src/components/controls.tsx
  - src/components/screen.tsx
    - src/components/surface.tsx
  - src/components/waveform.tsx
- src/constants/ghana.ts
  - src/types/domain.ts
- src/features/onboarding/onboarding-context.tsx
  - src/features/voice/use-voice-recorder.ts
- src/lib/supabase.ts

## /treats (My treats: voucher QR codes)
Entry: src/app/treats.tsx
Dependencies:
- src/components/index.ts
  - src/components/button.tsx
    - src/theme/index.ts
      - src/theme/colors.ts
      - src/theme/spacing.ts
      - src/theme/typography.ts
    - src/components/icon.tsx
      - src/components/icon-glyphs.ts
    - src/components/text.tsx
  - src/components/controls.tsx
  - src/components/screen.tsx
    - src/components/surface.tsx
  - src/components/waveform.tsx
- src/constants/ghana.ts
  - src/types/domain.ts
- src/features/api.ts
  - src/lib/supabase.ts
  - src/features/mock-data.ts
    - src/features/discover/shared-ground.ts

