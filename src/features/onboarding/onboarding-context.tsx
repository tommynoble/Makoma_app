import { createContext, use, type ReactNode } from 'react';
import type { VoiceClip } from '@/features/voice/use-voice-recorder';
import { usePersistentState } from '@/lib/persist';
import type { Gender, IntentId, LanguageId } from '@/types/domain';

/** The signed-in user's own profile (demo: saved on the device). */
export interface OnboardingDraft {
  phone?: string;
  onboarded: boolean;
  pledgeAccepted: boolean;
  intent?: IntentId;
  city: string;
  neighborhood: string;
  hideExactDistance: boolean;
  firstName?: string;
  /** YYYY-MM-DD. Must be 18+. */
  birthDate?: string;
  gender?: Gender;
  interestedIn: Gender[];
  occupation?: string;
  lifeGoals?: string;
  institutionIds: string[];
  languages: LanguageId[];
  church?: string;
  drinks?: 'never' | 'socially' | 'regularly';
  heritage?: string;
  /** Photos the user added (local URIs). Empty = demo photos. */
  photos: (string | number)[];
  /** One answer per prompt slot, keyed by slot id. */
  prompts: Record<string, { promptId: string; answer: string }>;
  voicePromptText?: string;
  voiceIntro?: VoiceClip;
  selfieSubmitted: boolean;
  /** Selfie taken during onboarding, sent once the account exists on the server. */
  pendingSelfie?: { uri: string; pose: string };
  /** Backend bookkeeping: what is already uploaded, so saves only send changes. */
  remote?: { photoPaths: Record<string, string>; voiceUri?: string; voicePath?: string; created?: boolean };
}

export const ME_KEY = 'makoma.me.v1';

const initial: OnboardingDraft = {
  onboarded: false,
  pledgeAccepted: false,
  city: 'Accra',
  neighborhood: 'East Legon',
  hideExactDistance: true,
  institutionIds: [],
  languages: ['en'],
  interestedIn: [],
  photos: [],
  prompts: {},
  selfieSubmitted: false,
};

const Ctx = createContext<{ draft: OnboardingDraft; update: (patch: Partial<OnboardingDraft>) => void; reset: () => void; hydrated: boolean } | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft, hydrated] = usePersistentState(ME_KEY, initial);
  return (
    <Ctx value={{ draft, hydrated, update: (patch) => setDraft((d) => ({ ...d, ...patch })), reset: () => setDraft(initial) }}>{children}</Ctx>
  );
}

export function useOnboarding() {
  const v = use(Ctx);
  if (!v) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return v;
}
