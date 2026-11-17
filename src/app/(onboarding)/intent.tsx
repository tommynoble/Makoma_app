import { router } from 'expo-router';
import { Body, Button, Choice, Gap, Screen, Title } from '@/components/ui';
import { INTENTS } from '@/constants/intents';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';

/** First onboarding question: intent is the main filter in Discover and is shown on every card. */
export default function Intent() {
  const { draft, update } = useOnboarding();
  return (
    <Screen>
      <Title>What are you here for?</Title>
      <Body muted>Be honest. You will only be matched with people who want the same thing.</Body>
      <Gap />
      {INTENTS.map((i) => (
        <Choice key={i.id} label={i.label} description={i.description} selected={draft.intent === i.id} onPress={() => update({ intent: i.id })} />
      ))}
      <Gap />
      <Button label="Continue" disabled={!draft.intent} onPress={() => router.push('/basics')} />
    </Screen>
  );
}
