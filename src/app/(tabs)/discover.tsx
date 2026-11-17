import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Body, Button, Choice, Gap, Screen } from '@/components/ui';
import { ProfileCard } from '@/components/ProfileCard';
import { INTENTS } from '@/constants/intents';
import { fetchDiscover, likeProfile, passProfile } from '@/features/api';
import type { DiscoverCard, DiscoverFilters, IntentId } from '@/types/domain';

const DEFAULT_FILTERS: DiscoverFilters = {
  intents: ['serious', 'marriage'],
  minAge: 22,
  maxAge: 40,
  verifiedOnly: false,
  languages: [],
  institutionIds: [],
};

/** One profile at a time, read top to bottom, with deliberate Like / Pass buttons instead of swiping. */
export default function Discover() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [cards, setCards] = useState<DiscoverCard[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscover(filters).then(setCards).catch((e) => setError(String(e.message ?? e)));
  }, [filters]);

  const toggleIntent = (id: IntentId) =>
    setFilters((f) => ({
      ...f,
      intents: f.intents.includes(id) ? f.intents.filter((x) => x !== id) : [...f.intents, id],
    }));

  const current = cards[0];
  const next = () => setCards((c) => c.slice(1));

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        {INTENTS.map((i) => (
          <Choice key={i.id} label={i.label} selected={filters.intents.includes(i.id)} onPress={() => toggleIntent(i.id)} />
        ))}
        <Choice
          label="Verified only"
          selected={filters.verifiedOnly}
          onPress={() => setFilters((f) => ({ ...f, verifiedOnly: !f.verifiedOnly }))}
        />
      </View>
      <Gap />
      {error ? <Body muted>{error}</Body> : null}
      {current ? (
        <>
          <ProfileCard card={current} />
          <Gap />
          <Button label="Like" onPress={() => likeProfile(current.profile.id).finally(next)} />
          <Button label="Pass" variant="secondary" onPress={() => passProfile(current.profile.id).finally(next)} />
        </>
      ) : (
        <Body muted>No one new right now. Try widening your filters.</Body>
      )}
    </Screen>
  );
}
