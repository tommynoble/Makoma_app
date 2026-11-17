import { createContext, useContext, useState, type ReactNode } from 'react';
import type { IntentId, ProfilePrompt } from '@/types/domain';
import type { VoiceClip } from '@/features/voice/useVoiceRecorder';

export interface OnboardingDraft {
  phone?: string;
  intent?: IntentId;
  firstName?: string;
  occupation?: string;
  industry?: string;
  lifeGoals?: string;
  institutionIds: string[];
  prompts: ProfilePrompt[];
  voiceIntro?: VoiceClip;
}

const Ctx = createContext<{
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
} | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>({ institutionIds: [], prompts: [] });
  return (
    <Ctx.Provider value={{ draft, update: (patch) => setDraft((d) => ({ ...d, ...patch })) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useOnboarding() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return v;
}
