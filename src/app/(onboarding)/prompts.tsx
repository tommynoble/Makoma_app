import { useState } from 'react';
import { TextInput } from 'react-native';
import { router } from 'expo-router';
import { Body, Button, Choice, Gap, Screen, Title } from '@/components/ui';
import { PROMPTS, PROMPTS_REQUIRED, promptById } from '@/constants/prompts';
import { useOnboarding } from '@/features/onboarding/OnboardingContext';
import { colors, radius, spacing } from '@/theme/tokens';

export default function Prompts() {
  const { draft, update } = useOnboarding();
  const [active, setActive] = useState<string | null>(null);
  const answered = draft.prompts.filter((p) => p.answer.trim());
  const hasSubstance = answered.some((p) => {
    const c = promptById(p.promptId)?.category;
    return c === 'ambition' || c === 'character';
  });

  const setAnswer = (promptId: string, answer: string) => {
    const rest = draft.prompts.filter((p) => p.promptId !== promptId);
    update({ prompts: [...rest, { promptId, answer }] });
  };

  return (
    <Screen>
      <Title>Pick {PROMPTS_REQUIRED} prompts</Title>
      <Body muted>Give people something better than "Hey". Include at least one about your ambition or character.</Body>
      <Gap />
      {PROMPTS.map((p) => {
        const answer = draft.prompts.find((x) => x.promptId === p.id)?.answer ?? '';
        return (
          <Choice key={p.id} label={p.text} description={answer || undefined} selected={!!answer.trim() || active === p.id} onPress={() => setActive(p.id)} />
        );
      })}
      {active ? (
        <TextInput
          autoFocus
          multiline
          style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, minHeight: 80 }}
          placeholder={promptById(active)?.text}
          value={draft.prompts.find((x) => x.promptId === active)?.answer ?? ''}
          onChangeText={(t) => setAnswer(active, t)}
        />
      ) : null}
      <Gap />
      <Button
        label={`Continue (${Math.min(answered.length, PROMPTS_REQUIRED)}/${PROMPTS_REQUIRED})`}
        disabled={answered.length < PROMPTS_REQUIRED || !hasSubstance}
        onPress={() => router.push('/voice-intro')}
      />
    </Screen>
  );
}
