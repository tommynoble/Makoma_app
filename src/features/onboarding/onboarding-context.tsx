import { createContext, use, useState, type ReactNode } from 'react';
import type { VoiceClip } from '@/features/voice/use-voice-recorder';
import type { IntentId } from '@/types/domain';

export interface OnboardingDraft {
  phone?: string;
  pledgeAccepted: boolean;
  intent?: IntentId;
  city: string;
  neighborhood: string;
  hideExactDistance: boolean;
  firstName?: string;
  occupation?: string;
  lifeGoals?: string;
  institutionIds: string[];
  /** One answer per prompt slot, keyed by slot id. */
  prompts: Record<string, { promptId: string; answer: string }>;
  voicePromptText?: string;
  voiceIntro?: VoiceClip;
  selfieSubmitted: boolean;
}

const initial: OnboardingDraft = {
  pledgeAccepted: false,
  city: 'Accra',
  neighborhood: 'East Legon',
  hideExactDistance: true,
  institutionIds: [],
  prompts: {},
  selfieSubmitted: false,
};

const Ctx = createContext<{ draft: OnboardingDraft; update: (patch: Partial<OnboardingDraft>) => void } | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(initial);
  return <Ctx value={{ draft, update: (patch) => setDraft((d) => ({ ...d, ...patch })) }}>{children}</Ctx>;
}

export function useOnboarding() {
  const v = use(Ctx);
  if (!v) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return v;
}
