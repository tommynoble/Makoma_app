import type { Profile, SharedGround } from '@/types/domain';

/**
 * The digital stand-in for "a mutual friend vouched for them": what two
 * people actually share (school, language, area, church, intent).
 */
export function computeSharedGround(me: Profile, them: Profile): SharedGround {
  const norm = (s?: string) => s?.trim().toLowerCase() || undefined;
  return {
    institutions: me.institutionIds.filter((id) => them.institutionIds.includes(id)),
    languages: me.languages.filter((l) => l !== 'en' && them.languages.includes(l)),
    sameNeighborhood: !!norm(me.neighborhood) && norm(me.neighborhood) === norm(them.neighborhood),
    sameChurch: !!norm(me.church) && norm(me.church) === norm(them.church),
    sameIntent: me.intent === them.intent,
  };
}

/** Higher = more in common. Used to rank Discover ahead of pure recency/distance. */
export function sharedGroundScore(s: SharedGround): number {
  return (
    s.institutions.length * 3 +
    s.languages.length * 2 +
    (s.sameNeighborhood ? 2 : 0) +
    (s.sameChurch ? 3 : 0) +
    (s.sameIntent ? 4 : 0)
  );
}
