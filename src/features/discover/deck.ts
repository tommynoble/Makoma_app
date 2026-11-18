import { MOCK_PROFILES, type DemoProfile } from '@/features/mock-data';
import type { DiscoverFilters } from '@/types/domain';
import type { SocialState } from '@/features/social/social-store';

export const ageOfBirth = (birth: string) => {
  const b = new Date(birth);
  const now = new Date();
  return now.getFullYear() - b.getFullYear() - (now < new Date(now.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0);
};

export function matchesFilters(p: DemoProfile, f: DiscoverFilters) {
  const age = ageOfBirth(p.birthDate);
  return (
    f.intents.includes(p.intent) &&
    age >= f.minAge &&
    age <= f.maxAge &&
    (!f.verifiedOnly || p.verification === 'verified') &&
    (f.languages.length === 0 || f.languages.some((l) => p.languages.includes(l)))
  );
}

/** Profiles still to meet: not liked, passed or matched, and within the filters. Demo only. */
export function buildDeck(s: SocialState): DemoProfile[] {
  const matched = new Set(Object.values(s.matches).map((m) => m.profileId));
  const blocked = new Set(s.blocked ?? []);
  return MOCK_PROFILES.filter((p) => !s.liked[p.id] && !s.passed.includes(p.id) && !matched.has(p.id) && !blocked.has(p.id) && matchesFilters(p, s.filters));
}

/** People who liked the user and are still waiting for an answer. */
export function incomingLikes(s: SocialState): DemoProfile[] {
  const blocked = new Set(s.blocked ?? []);
  return MOCK_PROFILES.filter((p) => p.likesYou && !s.liked[p.id] && !s.passed.includes(p.id) && !blocked.has(p.id)).sort((a, b) => (b.likesYou!.at > a.likesYou!.at ? 1 : -1));
}
