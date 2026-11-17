import type { DiscoverCard, GiftOffer, Profile, Voucher } from '@/types/domain';
import { computeSharedGround } from './discover/sharedGround';

/** Local stand-in for the signed-in user while the backend isn't configured. */
export const MOCK_ME: Profile = {
  id: 'me',
  firstName: 'Kwame',
  birthDate: '1995-03-12',
  gender: 'man',
  interestedIn: ['woman'],
  intent: 'serious',
  occupation: 'Software engineer',
  industry: 'Tech',
  institutionIds: ['knust', 'presec'],
  neighborhood: 'East Legon',
  city: 'Accra',
  languages: ['en', 'tw'],
  prompts: [],
  photos: [],
  verification: 'verified',
  visibility: 'public',
  createdAt: '2026-01-01T00:00:00Z',
};

const others: Profile[] = [
  {
    id: 'p1',
    firstName: 'Akosua',
    birthDate: '1997-07-02',
    gender: 'woman',
    interestedIn: ['man'],
    intent: 'serious',
    occupation: 'Pharmacist',
    industry: 'Health',
    lifeGoals: 'Open my own community pharmacy in Kumasi.',
    institutionIds: ['knust', 'wesley_girls'],
    neighborhood: 'East Legon',
    city: 'Accra',
    languages: ['en', 'tw', 'fat'],
    prompts: [
      { promptId: 'jollof_dealbreaker', answer: 'Auntie Muni at Osu. I will not be taking questions.' },
      { promptId: 'building_now', answer: 'Savings plan for my pharmacy, and a very serious plant collection.' },
      { promptId: 'green_flag', answer: 'You call your mum back the same day.' },
    ],
    photos: [],
    verification: 'verified',
    visibility: 'public',
    createdAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'p2',
    firstName: 'Esi',
    birthDate: '1993-11-20',
    gender: 'woman',
    interestedIn: ['man'],
    intent: 'marriage',
    occupation: 'Corporate lawyer',
    industry: 'Law',
    institutionIds: ['ug', 'holy_child'],
    city: 'Accra',
    languages: ['en', 'fat', 'ga'],
    prompts: [
      { promptId: 'sunday_kenkey', answer: 'Teshie, after church, with plenty shito.' },
      { promptId: 'family_role', answer: 'The one who organises every funeral and wedding committee.' },
      { promptId: 'five_years', answer: 'Partner at my firm with a full house.' },
    ],
    photos: [],
    verification: 'pending',
    visibility: 'public',
    createdAt: '2026-06-01T00:00:00Z',
  },
];

export const MOCK_CARDS: DiscoverCard[] = others.map((profile) => ({
  profile,
  shared: computeSharedGround(MOCK_ME, profile),
}));

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
