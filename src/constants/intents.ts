import type { IntentId } from '@/types/domain';

export interface IntentOption {
  id: IntentId;
  label: string;
  description: string;
}

/** Shown during onboarding and used as the primary Discover filter. */
export const INTENTS: IntentOption[] = [
  {
    id: 'marriage',
    label: 'Marriage-Oriented',
    description: 'Looking to build a lifelong home & family',
  },
  {
    id: 'serious',
    label: 'Serious Relationship',
    description: 'Dating with long-term partnership in mind',
  },
  {
    id: 'friendship_networking',
    label: 'Genuine Friendship & Networking',
    description: 'Connecting with like-minded people, no pressure',
  },
];

export const intentLabel = (id: IntentId) => INTENTS.find((i) => i.id === id)?.label ?? id;
