import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Field, Icon, IconBadge, IconButton, Pill, Screen, Text } from '@/components';
import { PROMPT_SLOTS, promptById } from '@/constants/prompts';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { alpha, colors, radius, spacing } from '@/theme';

/** Three prompts, one per slot, so every profile shows culture, substance and humour. */
export default function Prompts() {
  const { draft, update } = useOnboarding();
  const [editing, setEditing] = useState<string | null>(PROMPT_SLOTS[0].id);
  const answered = PROMPT_SLOTS.filter((s) => draft.prompts[s.id]?.answer.trim()).length;

  const setSlot = (slotId: string, patch: Partial<{ promptId: string; answer: string }>) => {
    const slot = PROMPT_SLOTS.find((s) => s.id === slotId)!;
    const current = draft.prompts[slotId] ?? { promptId: slot.promptIds[0], answer: '' };
    update({ prompts: { ...draft.prompts, [slotId]: { ...current, ...patch } } });
  };

  return (
    <Screen
      step={5}
      footer={
        <>
          <Button title={`Save & Continue (${answered}/3)`} icon="arrow_forward" disabled={answered < 3} onPress={() => router.push('/voice')} />
          <Text variant="labelSm" color="tertiary" center>
            You can refine or rotate your prompts at any time from your profile.
          </Text>
        </>
      }
    >
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primaryContainer }} />
          <Text variant="labelSm" color="primary" uppercase>
            Your Story
          </Text>
        </View>
        <Text variant="headlineLg" accessibilityRole="header">
          Share your personality.
        </Text>
        <Text color="onSurfaceVariant">Prompts are conversation starters. Speak candidly about what makes your daily life vibrant.</Text>
      </View>

      <View style={{ gap: spacing.md }}>
        {PROMPT_SLOTS.map((slot, index) => {
          const value = draft.prompts[slot.id];
          const promptId = value?.promptId ?? slot.promptIds[0];
          const hasAnswer = !!value?.answer.trim();

          if (editing !== slot.id && !hasAnswer) {
            return (
              <Card
                key={slot.id}
                bg="surfaceContainerLow"
                padding="margin"
                onPress={() => setEditing(slot.id)}
                accessibilityLabel={`Add your ${slot.label} prompt`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
              >
                <IconBadge icon="add" size={44} iconSize={20} bg="surfaceContainerHigh" color="primary" />
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Text variant="labelMd">{slot.label}</Text>
                    <Pill
                      label={`Prompt ${index + 1}`}
                      bg={index === 1 ? alpha(colors.secondaryContainer, 0.4) : 'primaryFixed'}
                      color={index === 1 ? 'onSecondaryContainer' : 'onPrimaryContainer'}
                      style={{ paddingHorizontal: 8, paddingVertical: 2 }}
                    />
                  </View>
                  <Text color="onSurfaceVariant" numberOfLines={1}>
                    e.g., {slot.example}
                  </Text>
                </View>
                <Icon name="chevron_right" size={20} color="outlineVariant" />
              </Card>
            );
          }

          return (
            <Card key={slot.id} padding="margin" style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Text variant="labelSm" color="secondary" uppercase style={{ flex: 1 }}>
                  Prompt {index + 1} of 3 • {slot.label}
                </Text>
                {editing === slot.id ? (
                  hasAnswer ? <IconButton icon="check" label="Done editing" size={32} iconSize={17} bg="primaryFixed" color="onPrimaryContainer" onPress={() => setEditing(null)} /> : null
                ) : (
                  <IconButton icon="edit" label={`Edit ${slot.label} prompt`} size={32} iconSize={17} bg="surfaceContainer" color="onSurfaceVariant" onPress={() => setEditing(slot.id)} />
                )}
              </View>
              <Text variant="headlineMd">“{promptById(promptId)?.text}”</Text>

              {editing === slot.id ? (
                <>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                    {slot.promptIds.map((id) => {
                      const on = id === promptId;
                      return (
                        <Pressable
                          key={id}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: on }}
                          onPress={() => setSlot(slot.id, { promptId: id })}
                          style={{
                            paddingHorizontal: 12,
                            minHeight: 36,
                            justifyContent: 'center',
                            borderRadius: radius.full,
                            backgroundColor: on ? colors.secondaryFixed : colors.surfaceContainerLow,
                            borderWidth: 1,
                            borderColor: on ? colors.secondary : colors.transparent,
                          }}
                        >
                          <Text variant="labelSm" color={on ? 'onSecondaryContainer' : 'tertiary'} numberOfLines={1} style={{ maxWidth: 260 }}>
                            {promptById(id)?.text}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Field
                    serif
                    multiline
                    accessibilityLabel="Your answer"
                    placeholder="Be specific. A real place, a real habit, a real opinion."
                    value={value?.answer ?? ''}
                    onChangeText={(answer) => setSlot(slot.id, { answer })}
                    maxLength={250}
                  />
                </>
              ) : (
                <View style={{ backgroundColor: colors.surfaceContainerLow, borderRadius: radius.md, borderCurve: 'continuous', padding: spacing.md }}>
                  <Text variant="bodyLg" italic style={{ lineHeight: 28 }}>
                    “{value?.answer.trim()}”
                  </Text>
                </View>
              )}
            </Card>
          );
        })}
      </View>

      <Card bg="surfaceContainer" shadow="none" style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <IconBadge icon="tips_and_updates" size={28} iconSize={16} bg="secondary" color="onSecondary" />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="labelMd">A tip</Text>
          <Text color="onSurfaceVariant" style={{ lineHeight: 22 }}>
            Shared humour and childhood staples build immediate warmth. Authenticity always lands better than a polished résumé.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}
