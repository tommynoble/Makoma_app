import type { IntentId } from '@/types/domain';

export interface IntentOption {
  id: IntentId;
  label: string;
  description: string;
}

/** Shown during onboarding and used as the primary Discover filter. */
export const INTENTS: IntentOption[] = [
  {
    id: 'serious',
    label: 'Looking for something serious',
    description: 'A committed relationship with someone intentional.',
  },
  {
    id: 'marriage',
    label: 'Marriage-oriented',
    description: 'Ready to meet someone to build a home and family with.',
  },
  {
    id: 'friendship_networking',
    label: 'Genuine friendship & networking',
    description: 'New people, good vibes and real connections, no pressure.',
  },
];

export const intentLabel = (id: IntentId) => INTENTS.find((i) => i.id === id)?.label ?? id;
