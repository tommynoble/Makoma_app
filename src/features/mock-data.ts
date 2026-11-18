import type { DiscoverCard, GiftOffer, IncomingLike, Profile, Voucher } from '@/types/domain';
import { computeSharedGround } from './discover/shared-ground';

/**
 * Demo data used while the backend isn't configured. All photos are
 * AI-generated placeholders (Stitch / Higgsfield), not real people.
 */
export const MOCK_ME: Profile = {
  id: 'me',
  firstName: 'Kwame',
  birthDate: '1997-03-12',
  gender: 'man',
  interestedIn: ['woman'],
  intent: 'marriage',
  occupation: 'Tech entrepreneur',
  industry: 'Tech',
  institutionIds: ['knust', 'presec'],
  neighborhood: 'East Legon',
  city: 'Accra',
  languages: ['en', 'tw'],
  church: 'Methodist',
  prompts: [],
  photos: [
    { id: 'me1', source: require('../../assets/mock/kwame.jpg'), position: 0 },
    { id: 'me2', source: require('../../assets/mock/kwame-2.jpg'), caption: 'Sunday football with the boys', position: 1 },
  ],
  verification: 'verified',
  visibility: 'public',
  createdAt: '2026-01-01T00:00:00Z',
};

export interface DemoProfile extends Profile {
  /** Set when this person has already liked the user. */
  likesYou?: IncomingLike;
  /** Canned replies used by the demo chat. */
  replies: string[];
}

export const MOCK_PROFILES: DemoProfile[] = [
  {
    id: 'akosua',
    firstName: 'Akosua',
    birthDate: '1998-07-02',
    gender: 'woman',
    interestedIn: ['man'],
    intent: 'marriage',
    occupation: 'Brand Strategist',
    headline: 'Brand Strategist • Global story architect',
    industry: 'Creative & Media',
    church: 'Methodist',
    drinks: 'socially',
    heritage: 'Kumasi • Accra',
    institutionIds: ['knust', 'wesley_girls'],
    neighborhood: 'East Legon',
    city: 'Accra',
    hideExactDistance: true,
    languages: ['tw', 'en'],
    voicePrompt: {
      promptText: 'How I spend my ideal Sunday afternoon…',
      durationMs: 18_000,
      transcript: 'Start with family lunch in Cantonments, then fresh palm wine and chilled music by the ocean with my closest circle…',
    },
    prompts: [
      { promptId: 'sunday_spot', answer: 'Osu for fresh kenkey and hot fried fish with extra black shito, and grilled tilapia from Auntie Muni’s lane.' },
      { promptId: 'standard', answer: 'I finish what I start, and I call my mother back the same day.' },
      { promptId: 'hot_take', answer: 'Waakye is a breakfast food and I will not be taking questions.' },
    ],
    photos: [
      { id: 'a1', source: require('../../assets/mock/akosua.jpg'), position: 0 },
      { id: 'a2', source: require('../../assets/mock/osu-terrace.jpg'), caption: 'Laughter therapy with the girls on an Osu terrace', position: 1 },
    ],
    verification: 'verified',
    visibility: 'public',
    createdAt: '2026-05-01T00:00:00Z',
    likesYou: { at: '2026-11-10T18:20:00Z', liked: 'voice', comment: 'Your voice note made me laugh. Which kenkey spot is yours?' },
    replies: [
      'Haha okay, I hear you. But you still owe me a proper kelewele tour.',
      'That’s sweet. How was work today?',
      'Send me a voice note, I want to hear how you say that 😄',
      'Saturday works for me. Somewhere in Osu?',
    ],
  },
  {
    id: 'nana',
    firstName: 'Nana Ama',
    birthDate: '1998-02-14',
    gender: 'woman',
    interestedIn: ['man'],
    intent: 'serious',
    occupation: 'Product Strategist',
    headline: 'Product Strategist • Accra & London',
    industry: 'Tech',
    church: 'Anglican',
    drinks: 'socially',
    heritage: 'Akuapem • London',
    institutionIds: ['ashesi', 'achimota'],
    neighborhood: 'East Legon',
    city: 'Accra',
    hideExactDistance: true,
    languages: ['en', 'tw'],
    voicePrompt: {
      promptText: 'What home means after years abroad…',
      durationMs: 16_000,
      transcript: 'London taught me hustle, Accra taught me how to rest. Home is wherever the jollof is honest…',
    },
    prompts: [
      { promptId: 'detty_december', answer: 'Two weddings, one beach day in Ada, and absolutely no work emails.' },
      { promptId: 'five_years', answer: 'Running product at a fintech that makes MoMo savings feel effortless.' },
      { promptId: 'jollof_dealbreaker', answer: 'If you think Nigerian jollof wins, we can still be friends. Just friends.' },
    ],
    photos: [
      { id: 'n1', source: require('../../assets/mock/nana-1.jpg'), position: 0 },
      { id: 'n2', source: require('../../assets/mock/nana-2.jpg'), caption: 'Autumn in London, missing the sun', position: 1 },
    ],
    verification: 'verified',
    visibility: 'public',
    createdAt: '2026-08-01T00:00:00Z',
    likesYou: { at: '2026-11-17T09:12:00Z', liked: 'prompt', promptId: 'five_years', comment: 'A fellow builder! What are you working on?', rose: true },
    replies: ['Ah nice! I love that.', 'Tell me more, I’m curious.', 'Haha, you’re funny. When are you free this week?'],
  },
  {
    id: 'efia',
    firstName: 'Efia',
    birthDate: '1999-11-20',
    gender: 'woman',
    interestedIn: ['man'],
    intent: 'serious',
    occupation: 'Creative Director',
    headline: 'Creative Director • Building a studio in Osu',
    industry: 'Creative & Media',
    drinks: 'never',
    heritage: 'Cape Coast',
    institutionIds: ['ug', 'holy_child'],
    neighborhood: 'Osu',
    city: 'Accra',
    languages: ['fat', 'en', 'tw'],
    voicePrompt: {
      promptText: 'The sound of home, for me, is…',
      durationMs: 14_000,
      transcript: 'Highlife on a Saturday morning while my dad pretends he is not dancing…',
    },
    prompts: [
      { promptId: 'chop_bar', answer: 'A tiny spot in Labone that does the best red-red in Accra. You carry the plantain.' },
      { promptId: 'building_now', answer: 'A small design studio, and a savings plan my mother finally approves of.' },
      { promptId: 'banku_vs_fufu', answer: 'Banku. With okro. On a Friday. This is not up for debate.' },
    ],
    photos: [
      { id: 'e1', source: require('../../assets/mock/efia.jpg'), position: 0 },
      { id: 'e2', source: require('../../assets/mock/efia-2.jpg'), caption: 'Mood boards and too much coffee at the studio', position: 1 },
    ],
    verification: 'verified',
    visibility: 'public',
    createdAt: '2026-06-01T00:00:00Z',
    likesYou: { at: '2026-11-16T20:45:00Z', liked: 'photo', comment: 'Okay, that football photo… do you actually score?' },
    replies: ['Haha, prove it then!', 'I love that. What else do you do for fun?', 'Labone this weekend? I’ll bring the plantain.'],
  },
  {
    id: 'abena',
    firstName: 'Abena',
    birthDate: '1996-04-09',
    gender: 'woman',
    interestedIn: ['man'],
    intent: 'marriage',
    occupation: 'Paediatric Doctor',
    headline: 'Paediatric Doctor • Korle Bu',
    industry: 'Health',
    church: 'Catholic',
    drinks: 'never',
    heritage: 'Ho • Accra',
    institutionIds: ['ug', 'wesley_girls'],
    neighborhood: 'Cantonments',
    city: 'Accra',
    hideExactDistance: true,
    languages: ['ee', 'en', 'tw'],
    voicePrompt: {
      promptText: 'After a long shift, I recharge by…',
      durationMs: 19_000,
      transcript: 'A walk on Labadi beach at sunset, my mother’s light soup, and one episode of something silly…',
    },
    prompts: [
      { promptId: 'sunday_kenkey', answer: 'Teshie, after Mass, with plenty of shito. My little brother always finishes mine.' },
      { promptId: 'respect', answer: 'Showing up when you said you would. Small promises are big promises.' },
      { promptId: 'aunty_question', answer: '“Soon, Auntie.” And then I quickly offer to serve the food.' },
    ],
    photos: [
      { id: 'b1', source: require('../../assets/mock/abena-1.jpg'), position: 0 },
      { id: 'b2', source: require('../../assets/mock/abena-2.jpg'), caption: 'Labadi at sunset, my reset button', position: 1 },
    ],
    verification: 'verified',
    visibility: 'public',
    createdAt: '2026-07-01T00:00:00Z',
    replies: ['Thank you! That’s kind.', 'Haha, I like your energy.', 'I’m off on Sunday if you want to grab kenkey.'],
  },
  {
    id: 'adjoa',
    firstName: 'Adjoa',
    birthDate: '1999-09-01',
    gender: 'woman',
    interestedIn: ['man'],
    intent: 'serious',
    occupation: 'Architect',
    headline: 'Architect • Designing homes that breathe',
    industry: 'Engineering',
    drinks: 'socially',
    heritage: 'Tema • Kumasi',
    institutionIds: ['knust', 'yaa_asantewaa'],
    neighborhood: 'Community 25',
    city: 'Tema',
    languages: ['tw', 'en', 'ga'],
    voicePrompt: {
      promptText: 'A building in Ghana I wish I designed…',
      durationMs: 15_000,
      transcript: 'The National Theatre. It looks like it is about to fly, and it makes everyone look up…',
    },
    prompts: [
      { promptId: 'waakye_order', answer: 'Waakye, gari, wele, boiled egg, small spaghetti. And yes, extra shito.' },
      { promptId: 'proud_of', answer: 'My first house design is now a real home for a family in Tema.' },
      { promptId: 'trotro_story', answer: 'A mate who sang every stop like it was a gospel concert. 10/10.' },
    ],
    photos: [
      { id: 'd1', source: require('../../assets/mock/adjoa-1.jpg'), position: 0 },
      { id: 'd2', source: require('../../assets/mock/adjoa-2.jpg'), caption: 'Deadline week, still smiling', position: 1 },
    ],
    verification: 'pending',
    visibility: 'public',
    createdAt: '2026-09-01T00:00:00Z',
    replies: ['Haha, KNUST represent!', 'What kind of buildings do you love?', 'Tema is not that far, you know 😄'],
  },
  {
    id: 'esi',
    firstName: 'Esi',
    birthDate: '1995-01-22',
    gender: 'woman',
    interestedIn: ['man'],
    intent: 'marriage',
    occupation: 'Corporate Lawyer',
    headline: 'Corporate Lawyer • Labone',
    industry: 'Law',
    church: 'Presbyterian',
    drinks: 'socially',
    heritage: 'Elmina • Accra',
    institutionIds: ['ug', 'holy_child'],
    neighborhood: 'Labone',
    city: 'Accra',
    languages: ['fat', 'en', 'ga'],
    voicePrompt: {
      promptText: 'The best advice my grandmother gave me…',
      durationMs: 17_000,
      transcript: '“Never shout to be heard. Speak clearly, and let your work be loud.” I still live by it…',
    },
    prompts: [
      { promptId: 'family_role', answer: 'The one who organises every funeral and wedding committee. Spreadsheets included.' },
      { promptId: 'green_flag', answer: 'You remember the small things I mention in passing.' },
      { promptId: 'banku_vs_fufu', answer: 'Fufu with light soup. Banku people are welcome, but they sit at the back.' },
    ],
    photos: [
      { id: 's1', source: require('../../assets/mock/esi-1.jpg'), position: 0 },
      { id: 's2', source: require('../../assets/mock/esi-2.jpg'), caption: 'Sunday brunch is sacred', position: 1 },
    ],
    verification: 'verified',
    visibility: 'public',
    createdAt: '2026-04-01T00:00:00Z',
    replies: ['Thank you, that’s thoughtful.', 'Haha, you have to defend that properly.', 'I’d like that. Brunch on Sunday?'],
  },
];

export const mockProfileById = (id: string) => MOCK_PROFILES.find((p) => p.id === id);

export const toCard = (profile: Profile, me: Profile = MOCK_ME): DiscoverCard => ({ profile, shared: computeSharedGround(me, profile) });

/** Kept for the API fallback (src/features/api.ts). */
export const MOCK_CARDS: DiscoverCard[] = MOCK_PROFILES.map((p) => toCard(p));

/** Placeholder partners (fictional names); mirrors supabase/seed.sql. */
export const MOCK_GIFT_OFFERS: GiftOffer[] = [
  { id: 'sobolo', partnerName: 'Partner Juice Bar', area: 'Osu', label: 'Sobolo', emoji: '🥤', pricePesewas: 1000 },
  { id: 'kelewele', partnerName: 'Partner Chop Bar', area: 'Labone', label: 'Kelewele', emoji: '🍌', pricePesewas: 1500 },
  { id: 'coffee', partnerName: 'Partner Café', area: 'East Legon', label: 'Coffee', emoji: '☕', pricePesewas: 3000 },
  { id: 'smoothie', partnerName: 'Partner Juice Bar', area: 'Osu', label: 'Smoothie', emoji: '🍹', pricePesewas: 4000 },
  { id: 'jollof_2', partnerName: 'Partner Chop Bar', area: 'Labone', label: 'Jollof for two', emoji: '🍛', pricePesewas: 8000 },
];

export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    code: 'MK-7KQ2-XP4D',
    offer: MOCK_GIFT_OFFERS[2],
    fromName: 'Akosua',
    status: 'issued',
    expiresAt: '2026-12-17T00:00:00Z',
  },
];
