import type { LanguageId, SachetPlan } from '@/types/domain';

export const LANGUAGES: { id: LanguageId; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'tw', label: 'Twi' },
  { id: 'ga', label: 'Ga' },
  { id: 'ee', label: 'Ewe' },
  { id: 'fat', label: 'Fante' },
  { id: 'dag', label: 'Dagbani' },
  { id: 'ha', label: 'Hausa' },
  { id: 'pcm', label: 'Pidgin' },
];

/** Shared institutions stand in for "who vouches for you". Extend from the DB later. */
export const INSTITUTIONS: { id: string; label: string; kind: 'university' | 'shs' }[] = [
  { id: 'ug', label: 'University of Ghana (Legon)', kind: 'university' },
  { id: 'knust', label: 'KNUST', kind: 'university' },
  { id: 'ucc', label: 'University of Cape Coast', kind: 'university' },
  { id: 'ashesi', label: 'Ashesi University', kind: 'university' },
  { id: 'upsa', label: 'UPSA', kind: 'university' },
  { id: 'gimpa', label: 'GIMPA', kind: 'university' },
  { id: 'uds', label: 'University for Development Studies', kind: 'university' },
  { id: 'uew', label: 'University of Education, Winneba', kind: 'university' },
  { id: 'atu', label: 'Accra Technical University', kind: 'university' },
  { id: 'achimota', label: 'Achimota School', kind: 'shs' },
  { id: 'presec', label: 'PRESEC Legon', kind: 'shs' },
  { id: 'wesley_girls', label: "Wesley Girls' High School", kind: 'shs' },
  { id: 'mfantsipim', label: 'Mfantsipim School', kind: 'shs' },
  { id: 'adisadel', label: 'Adisadel College', kind: 'shs' },
  { id: 'holy_child', label: 'Holy Child School', kind: 'shs' },
  { id: 'opoku_ware', label: 'Opoku Ware School', kind: 'shs' },
  { id: 'yaa_asantewaa', label: "Yaa Asantewaa Girls' SHS", kind: 'shs' },
];

/** Neighbourhood options for the location picker. Diaspora bases included. */
export const NEIGHBORHOODS: { city: string; area: string }[] = [
  { city: 'Accra', area: 'East Legon' },
  { city: 'Accra', area: 'Cantonments' },
  { city: 'Accra', area: 'Airport Residential' },
  { city: 'Accra', area: 'Osu' },
  { city: 'Accra', area: 'Labone' },
  { city: 'Accra', area: 'Spintex' },
  { city: 'Tema', area: 'Community 25' },
  { city: 'Kumasi', area: 'Ahodwo' },
  { city: 'Kumasi', area: 'Nhyiaeso' },
  { city: 'Takoradi', area: 'Beach Road' },
];

export const CITIES = ['Accra', 'Kumasi', 'Tema', 'Takoradi', 'Cape Coast', 'Tamale', 'Ho', 'Koforidua'];

export const INDUSTRIES = [
  'Tech',
  'Finance & Banking',
  'Health',
  'Law',
  'Education',
  'Engineering',
  'Oil & Gas',
  'Trade & Business',
  'Creative & Media',
  'Public Service',
  'Agriculture',
  'Hospitality',
  'Student',
  'Other',
];

/** Sachet pricing: pay small for short access, the way people already buy data bundles. */
export const SACHET_PLANS: SachetPlan[] = [
  { id: 'incognito_24h', feature: 'incognito', label: 'Incognito, 1 day', durationHours: 24, pricePesewas: 500 },
  { id: 'incognito_7d', feature: 'incognito', label: 'Incognito, 1 week', durationHours: 168, pricePesewas: 2500 },
  { id: 'boost_1h', feature: 'boost', label: 'Boost, 1 hour', durationHours: 1, pricePesewas: 300 },
  { id: 'see_likes_24h', feature: 'see_likes', label: 'See who likes you, 1 day', durationHours: 24, pricePesewas: 400 },
];

export const formatCedis = (pesewas: number) => `GH₵${(pesewas / 100).toFixed(2)}`;

/** Ghana mobile numbers: 0XX XXX XXXX or +233 XX XXX XXXX. Returns E.164 or null. */
export function normalizeGhanaPhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, '');
  let local: string | null = null;
  if (/^\+233\d{9}$/.test(digits)) local = digits.slice(4);
  else if (/^233\d{9}$/.test(digits)) local = digits.slice(3);
  else if (/^0\d{9}$/.test(digits)) local = digits.slice(1);
  if (!local || !/^[2-5]/.test(local)) return null;
  return `+233${local}`;
}
