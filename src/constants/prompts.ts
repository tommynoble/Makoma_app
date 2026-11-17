export type PromptCategory = 'banter' | 'ambition' | 'character' | 'faith_family';

export interface PromptDefinition {
  id: string;
  category: PromptCategory;
  text: string;
  placeholder?: string;
}

/**
 * Culturally rooted icebreakers. Users pick 3 during onboarding. At least one
 * must come from 'ambition' or 'character' so a profile shows more than looks.
 */
export const PROMPTS: PromptDefinition[] = [
  // Banter
  { id: 'sunday_kenkey', category: 'banter', text: 'My favourite spot for Sunday kenkey is…' },
  {
    id: 'jollof_dealbreaker',
    category: 'banter',
    text: "If you don't like jollof from ___, we might not work out.",
  },
  { id: 'waakye_order', category: 'banter', text: 'My non-negotiable waakye order is…' },
  { id: 'chop_bar', category: 'banter', text: 'The chop bar I would take you to on our first date…' },
  { id: 'detty_december', category: 'banter', text: 'My ideal Detty December looks like…' },
  { id: 'trotro_story', category: 'banter', text: 'The wildest thing I have seen in a trotro…' },
  { id: 'aunty_question', category: 'banter', text: 'When my aunties ask "when are you bringing someone home?" I say…' },
  { id: 'banku_vs_fufu', category: 'banter', text: 'Banku or fufu, and I will defend my answer:' },

  // Ambition ("capable man / good woman": show capacity and direction)
  { id: 'building_now', category: 'ambition', text: 'Right now I am building…' },
  { id: 'five_years', category: 'ambition', text: 'In five years, I see myself…' },
  { id: 'proud_of', category: 'ambition', text: 'Something I worked hard for and I am proud of…' },
  { id: 'side_hustle', category: 'ambition', text: 'My side hustle / passion project is…' },

  // Character
  { id: 'friends_say', category: 'character', text: 'My friends say I am the one who…' },
  { id: 'respect', category: 'character', text: 'How I show respect in a relationship…' },
  { id: 'green_flag', category: 'character', text: 'A green flag I look for…' },
  { id: 'love_language', category: 'character', text: 'I feel most appreciated when…' },

  // Faith & family
  { id: 'family_role', category: 'faith_family', text: 'In my family, I am the one who…' },
  { id: 'faith', category: 'faith_family', text: 'Faith plays this role in my life…' },
  { id: 'sunday', category: 'faith_family', text: 'A typical Sunday for me…' },
];

export const PROMPTS_REQUIRED = 3;

export const promptById = (id: string) => PROMPTS.find((p) => p.id === id);
