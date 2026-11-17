import { StyleSheet, Text, View } from 'react-native';
import { INSTITUTIONS, LANGUAGES } from '@/constants/ghana';
import { intentLabel } from '@/constants/intents';
import { promptById } from '@/constants/prompts';
import { colors, radius, spacing, type } from '@/theme/tokens';
import type { DiscoverCard } from '@/types/domain';
import { Chip, VerifiedBadge } from './ui';

const age = (birth: string) => {
  const b = new Date(birth);
  const now = new Date();
  return now.getFullYear() - b.getFullYear() - (now < new Date(now.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0);
};

/**
 * Profile card: intent, ambition and shared ground come before looks.
 * Verified profiles get a distinct treatment so verification reads as a status symbol.
 */
export function ProfileCard({ card }: { card: DiscoverCard }) {
  const { profile: p, shared } = card;
  const verified = p.verification === 'verified';
  const sharedLabels = [
    ...shared.institutions.map((id) => INSTITUTIONS.find((i) => i.id === id)?.label ?? id),
    ...shared.languages.map((id) => `Speaks ${LANGUAGES.find((l) => l.id === id)?.label}`),
    ...(shared.sameNeighborhood ? [`Also in ${p.neighborhood}`] : []),
    ...(shared.sameChurch ? ['Same church'] : []),
  ];

  return (
    <View style={[styles.card, verified && styles.verifiedCard]}>
      <View style={styles.row}>
        <Text style={[type.heading, { color: colors.text }]}>
          {p.firstName}, {age(p.birthDate)}
        </Text>
        {verified ? <VerifiedBadge /> : null}
      </View>
      <Chip label={intentLabel(p.intent)} />
      {p.occupation ? (
        <Text style={[type.body, { color: colors.text }]}>
          {p.occupation}
          {p.industry ? ` · ${p.industry}` : ''}
        </Text>
      ) : null}
      {p.lifeGoals ? <Text style={[type.body, { color: colors.textMuted }]}>{p.lifeGoals}</Text> : null}

      {sharedLabels.length > 0 ? (
        <View style={{ gap: spacing.xs }}>
          <Text style={[type.caption, { color: colors.textMuted }]}>YOU HAVE IN COMMON</Text>
          <View style={styles.wrap}>
            {sharedLabels.map((l) => (
              <Chip key={l} label={l} />
            ))}
          </View>
        </View>
      ) : null}

      {p.prompts.map((pr) => (
        <View key={pr.promptId} style={styles.prompt}>
          <Text style={[type.caption, { color: colors.textMuted }]}>{promptById(pr.promptId)?.text}</Text>
          <Text style={[type.body, { color: colors.text }]}>{pr.answer}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, gap: spacing.sm },
  verifiedCard: { borderWidth: 2, borderColor: colors.verified },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  prompt: { padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.background, gap: 2 },
});
