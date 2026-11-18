import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Eyebrow, Field, Heading, Screen, Text } from '@/components';
import { INSTITUTIONS } from '@/constants/ghana';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { colors, fonts, radius, spacing } from '@/theme';

/** Work, direction and schools (shared roots). */
export default function About() {
  const { draft, update } = useOnboarding();
  const toggle = (id: string) =>
    update({ institutionIds: draft.institutionIds.includes(id) ? draft.institutionIds.filter((x) => x !== id) : [...draft.institutionIds, id] });

  return (
    <Screen step={3} footer={<Button title="Continue" disabled={!draft.firstName?.trim() || !draft.occupation?.trim()} onPress={() => router.push('/selfie')} />}>
      <Heading title="Share your story." />

      <View style={{ gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>First name</Eyebrow>
          <Field accessibilityLabel="First name" placeholder="e.g. Akosua" value={draft.firstName} onChangeText={(firstName) => update({ firstName })} autoCapitalize="words" />
        </View>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>What do you do?</Eyebrow>
          <Field accessibilityLabel="What do you do?" placeholder="e.g. Brand Strategist" value={draft.occupation} onChangeText={(occupation) => update({ occupation })} />
        </View>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>Where are you headed? (optional)</Eyebrow>
          <Field multiline accessibilityLabel="Your goals" placeholder="My long-term goals are…" value={draft.lifeGoals} onChangeText={(lifeGoals) => update({ lifeGoals })} maxLength={300} />
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <Eyebrow>Shared roots (schools, optional)</Eyebrow>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {INSTITUTIONS.map((i) => {
            const on = draft.institutionIds.includes(i.id);
            return (
              <Pressable
                key={i.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => toggle(i.id)}
                style={{ minHeight: 40, paddingHorizontal: spacing.md, justifyContent: 'center', borderRadius: radius.full, backgroundColor: on ? colors.secondary : colors.surfaceContainerHigh }}
              >
                <Text variant="labelMd" color={on ? 'onSecondary' : 'onSurface'} style={{ fontFamily: fonts.sansSemiBold }}>
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
