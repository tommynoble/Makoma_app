import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Field, Heading, Icon, Pill, Screen, Text } from '@/components';
import { INSTITUTIONS } from '@/constants/ghana';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { colors, radius, spacing } from '@/theme';

/**
 * Ambition and roots: what you do, where you are going, and the schools that
 * connect you to others. NOTE: no Stitch design exists for this step yet; it
 * is assembled from the same kit so it matches the rest of onboarding.
 */
export default function About() {
  const { draft, update } = useOnboarding();
  const toggle = (id: string) =>
    update({
      institutionIds: draft.institutionIds.includes(id) ? draft.institutionIds.filter((x) => x !== id) : [...draft.institutionIds, id],
    });

  return (
    <Screen
      step={3}
      footer={<Button title="Continue" icon="arrow_forward" disabled={!draft.firstName?.trim() || !draft.occupation?.trim()} onPress={() => router.push('/selfie')} />}
    >
      <Heading
        eyebrow={<Pill label="About You" dot="primaryContainer" color="tertiary" uppercase />}
        title="Tell us who you are."
        subtitle="Your work and direction matter here as much as your photos."
      />

      <View style={{ gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="labelMd">First name</Text>
          <Field accessibilityLabel="First name" placeholder="e.g. Kwame" value={draft.firstName} onChangeText={(firstName) => update({ firstName })} autoCapitalize="words" />
        </View>
        <View style={{ gap: spacing.sm }}>
          <Text variant="labelMd">What do you do?</Text>
          <Field accessibilityLabel="Occupation" placeholder="e.g. Pharmacist, Software engineer" value={draft.occupation} onChangeText={(occupation) => update({ occupation })} />
        </View>
        <View style={{ gap: spacing.sm }}>
          <Text variant="labelMd">Where are you headed?</Text>
          <Field
            serif
            multiline
            accessibilityLabel="Your goals"
            placeholder="A line or two about what you are building towards."
            value={draft.lifeGoals}
            onChangeText={(lifeGoals) => update({ lifeGoals })}
            maxLength={300}
          />
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="labelSm" color="tertiary" uppercase>
            Shared Roots
          </Text>
          <Text variant="headlineMd" accessibilityRole="header">
            Schools you attended
          </Text>
          <Text color="tertiary">We show people what you have in common. Optional.</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {INSTITUTIONS.map((i) => {
            const on = draft.institutionIds.includes(i.id);
            return (
              <Pressable
                key={i.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => toggle(i.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  minHeight: 40,
                  paddingHorizontal: 14,
                  borderRadius: radius.full,
                  backgroundColor: on ? colors.secondaryFixed : colors.surfaceContainerLowest,
                  borderWidth: 1,
                  borderColor: on ? colors.secondary : colors.surfaceContainerHighest,
                }}
              >
                {on ? <Icon name="check" size={16} color="secondary" /> : null}
                <Text variant="labelMd" color={on ? 'onSecondaryContainer' : 'onSurface'}>
                  {i.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}
