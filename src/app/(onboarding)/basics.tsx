import { TextInput } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Choice, Gap, Screen, Title } from '@/components/ui';
import { INDUSTRIES, INSTITUTIONS } from '@/constants/ghana';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';
import { colors, radius, spacing } from '@/theme/tokens';

/** Ambition and background: what you do, where you are going, and the schools that connect you to others. */
export default function Basics() {
  const { draft, update } = useOnboarding();
  const input = { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md };
  const toggleInstitution = (id: string) =>
    update({
      institutionIds: draft.institutionIds.includes(id)
        ? draft.institutionIds.filter((x) => x !== id)
        : [...draft.institutionIds, id],
    });

  return (
    <Screen>
      <Title>About you</Title>
      <TextInput style={input} placeholder="First name" value={draft.firstName} onChangeText={(firstName) => update({ firstName })} />
      <TextInput style={input} placeholder="What do you do?" value={draft.occupation} onChangeText={(occupation) => update({ occupation })} />
      <TextInput
        style={[input, { minHeight: 80 }]}
        multiline
        placeholder="Your goals for the next few years"
        value={draft.lifeGoals}
        onChangeText={(lifeGoals) => update({ lifeGoals })}
      />
      <Gap size={8} />
      <Body muted>Industry</Body>
      {INDUSTRIES.map((ind) => (
        <Choice key={ind} label={ind} selected={draft.industry === ind} onPress={() => update({ industry: ind })} />
      ))}
      <Gap size={8} />
      <Body muted>Schools you attended (helps you find people with shared roots)</Body>
      {INSTITUTIONS.map((i) => (
        <Choice key={i.id} label={i.label} selected={draft.institutionIds.includes(i.id)} onPress={() => toggleInstitution(i.id)} />
      ))}
      <Gap />
      <Button label="Continue" disabled={!draft.firstName} onPress={() => router.push('/prompts')} />
    </Screen>
  );
}
