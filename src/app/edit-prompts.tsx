import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Eyebrow, Field, FormScrollView, Icon, IconButton, KeyboardDoneBar, Text } from '@/components';
import { PROMPT_SLOTS, promptById } from '@/constants/prompts';
import { useSaveProfile } from '@/features/backend/use-save-profile';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { haptic } from '@/lib/motion';
import { colors, fonts, maxContentWidth, radius, spacing } from '@/theme';

/**
 * Three prompts, one per slot (culture, substance, humour). Done from the
 * profile after onboarding, so sign-up stays short.
 */
export default function EditPrompts() {
  const insets = useSafeAreaInsets();
  const { draft, update } = useOnboarding();
  const saveProfile = useSaveProfile();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const done = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      await saveProfile();
    } catch (e: any) {
      setSaving(false);
      return setSaveError(e?.message ?? 'Couldn’t save. Check your connection and try again.');
    }
    setSaving(false);
    haptic.success();
    router.back();
  };
  const firstOpen = PROMPT_SLOTS.find((s) => !draft.prompts[s.id]?.answer.trim())?.id ?? null;
  const [editing, setEditing] = useState<string | null>(firstOpen);
  const answered = PROMPT_SLOTS.filter((s) => draft.prompts[s.id]?.answer.trim()).length;

  const setSlot = (slotId: string, patch: Partial<{ promptId: string; answer: string }>) => {
    const slot = PROMPT_SLOTS.find((s) => s.id === slotId)!;
    const current = draft.prompts[slotId] ?? { promptId: slot.promptIds[0], answer: '' };
    update({ prompts: { ...draft.prompts, [slotId]: { ...current, ...patch } } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <FormScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.section, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}
      >
        <View style={{ gap: spacing.sm }}>
          <Text variant="headlineXl" accessibilityRole="header">
            Share your personality.
          </Text>
          <Text color="tertiary">Prompts are conversation starters. Be specific: a real place, a real habit, a real opinion.</Text>
        </View>

        <View style={{ gap: spacing.md }}>
          {PROMPT_SLOTS.map((slot) => {
            const value = draft.prompts[slot.id];
            const promptId = value?.promptId ?? slot.promptIds[0];
            const hasAnswer = !!value?.answer.trim();

            if (editing !== slot.id && !hasAnswer) {
              return (
                <Pressable
                  key={slot.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Add your ${slot.label} prompt`}
                  onPress={() => setEditing(slot.id)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    padding: spacing.lg,
                    borderRadius: radius.card,
                    borderWidth: 2,
                    borderStyle: 'dashed',
                    borderColor: colors.outlineVariant,
                    backgroundColor: colors.surfaceContainerLowest,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <Eyebrow>{slot.label}</Eyebrow>
                    <Text variant="headlineMd" style={{ fontSize: 18, lineHeight: 26 }}>
                      {slot.example}
                    </Text>
                  </View>
                  <Icon name="add_circle" size={30} color="primary" filled={false} />
                </Pressable>
              );
            }

            return (
              <Card key={slot.id} rounded="card" padding="lg" shadow="warm" style={{ gap: spacing.md, borderWidth: 1, borderColor: colors.hairline }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Eyebrow color="secondary">{slot.label}</Eyebrow>
                  {editing === slot.id ? (
                    hasAnswer ? <IconButton icon="check" label="Done editing" size={36} iconSize={20} bg="primary" color="onPrimary" onPress={() => setEditing(null)} /> : null
                  ) : (
                    <IconButton icon="edit" label={`Edit ${slot.label} prompt`} size={36} iconSize={18} bg="surfaceContainerHigh" onPress={() => setEditing(slot.id)} />
                  )}
                </View>
                <Text variant="headlineMd" style={{ fontSize: 20, lineHeight: 28 }}>
                  {promptById(promptId)?.text}
                </Text>

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
                            onPress={() => {
                              if (!on) haptic.select();
                              setSlot(slot.id, { promptId: id });
                            }}
                            style={{ paddingHorizontal: spacing.md, minHeight: 40, justifyContent: 'center', borderRadius: radius.full, backgroundColor: on ? colors.secondary : colors.surfaceContainerHigh }}
                          >
                            <Text variant="labelMd" color={on ? 'onSecondary' : 'onSurface'} numberOfLines={1} style={{ maxWidth: 280, fontFamily: fonts.sansSemiBold }}>
                              {promptById(id)?.text}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Field serif multiline accessibilityLabel="Your answer" placeholder="Type your answer…" value={value?.answer ?? ''} onChangeText={(answer) => setSlot(slot.id, { answer })} maxLength={250} />
                  </>
                ) : (
                  <View style={{ backgroundColor: colors.surfaceContainerHigh, borderRadius: radius.card, padding: spacing.md }}>
                    <Text italic style={{ fontSize: 17, lineHeight: 26 }}>
                      “{value?.answer.trim()}”
                    </Text>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </FormScrollView>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md), maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
        {saveError ? (
          <Text variant="labelMd" color="error" center style={{ marginBottom: spacing.sm }}>
            {saveError}
          </Text>
        ) : null}
        <Button title={saving ? 'Saving…' : answered === 3 ? 'Save prompts' : `Save (${answered}/3 answered)`} haptics="none" disabled={saving} onPress={done} />
      </View>
      <KeyboardDoneBar />
    </View>
  );
}
