import type { OnboardingDraft } from './onboarding-context';

export interface CompletionItem {
  id: 'basics' | 'selfie' | 'voice' | 'prompts';
  label: string;
  hint: string;
  weight: number;
  done: boolean;
  /** Where the user goes to finish this item. */
  href?: '/selfie' | '/voice' | '/edit-prompts';
  /** For prompts: how many of the 3 are answered. */
  progress?: { done: number; total: number };
}

/**
 * Profile completion. Onboarding only collects the essentials; prompts, the
 * voice intro and verification can be finished later from the profile.
 * Weights add up to 100.
 */
export function profileCompletion(d: OnboardingDraft): { percent: number; items: CompletionItem[] } {
  const answered = Object.values(d.prompts).filter((p) => p.answer.trim()).length;
  const items: CompletionItem[] = [
    { id: 'basics', label: 'Basics & intentions', hint: 'Name, work and what you are here for', weight: 30, done: !!(d.firstName?.trim() && d.intent) },
    { id: 'prompts', label: 'Answer 3 prompts', hint: 'Give people something better than “Hey”', weight: 30, done: answered >= 3, href: '/edit-prompts', progress: { done: answered, total: 3 } },
    { id: 'voice', label: 'Record a voice intro', hint: 'Let them hear your warmth (20 seconds)', weight: 20, done: !!d.voiceIntro, href: '/voice' },
    { id: 'selfie', label: 'Get selfie verified', hint: 'Verified profiles are shown first', weight: 20, done: d.selfieSubmitted, href: '/selfie' },
  ];
  const percent = items.reduce((sum, i) => sum + (i.done ? i.weight : i.progress ? (i.weight * i.progress.done) / i.progress.total : 0), 0);
  return { percent: Math.round(percent), items };
}
