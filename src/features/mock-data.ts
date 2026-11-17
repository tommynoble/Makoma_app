import type { DiscoverCard, GiftOffer, Profile, Voucher } from '@/types/domain';
import { computeSharedGround } from './discover/shared-ground';

/**
 * Demo data used while the backend isn't configured. Photos are AI-generated
 * placeholders from the Stitch design project, not real people.
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
  photos: [{ id: 'me1', source: require('../../assets/mock/kwame.jpg'), position: 0 }],
  verification: 'verified',
  visibility: 'public',
  createdAt: '2026-01-01T00:00:00Z',
};

const others: Profile[] = [
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
    photos: [{ id: 'e1', source: require('../../assets/mock/efia.jpg'), position: 0 }],
    verification: 'verified',
    visibility: 'public',
    createdAt: '2026-06-01T00:00:00Z',
  },
];

export const MOCK_CARDS: DiscoverCard[] = others.map((profile) => ({
  profile,
  shared: computeSharedGround(MOCK_ME, profile),
}));

export const mockProfileById = (id: string) => others.find((p) => p.id === id);

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
