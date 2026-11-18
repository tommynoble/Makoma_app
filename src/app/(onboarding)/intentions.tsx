import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Eyebrow, Heading, Icon, Screen, Text, Toggle } from '@/components';
import { NEIGHBORHOODS } from '@/constants/ghana';
import { INTENTS } from '@/constants/intents';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { colors, fonts, radius, spacing } from '@/theme';

/** Intent is the main Discover filter and is shown on every profile. */
export default function Intentions() {
  const { draft, update } = useOnboarding();
  const [open, setOpen] = useState(false);

  return (
    <Screen step={2} footer={<Button title="Continue" disabled={!draft.intent} onPress={() => router.push('/about')} />}>
      <Heading title="What brings you here?" />

      <View accessibilityRole="radiogroup" style={{ gap: spacing.md }}>
        {INTENTS.map((i) => {
          const selected = draft.intent === i.id;
          return (
            <Card
              key={i.id}
              rounded="card"
              padding="margin"
              shadow="warm"
              bg={selected ? 'surfaceContainerLow' : 'surfaceContainerLowest'}
              selected={selected}
              accessibilityLabel={`${i.label}. ${i.description}`}
              onPress={() => update({ intent: i.id })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing.md,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? colors.secondary : colors.hairline,
              }}
            >
              <Text variant="labelLg" style={{ flex: 1, fontSize: 16, lineHeight: 22, fontFamily: selected ? fonts.sansBold : fonts.sansSemiBold }}>
                {i.label}
              </Text>
              {selected ? <Icon name="check_circle" size={24} color="secondary" /> : <View style={{ width: 24 }} />}
            </Card>
          );
        })}
      </View>

      <View style={{ gap: spacing.md }}>
        <Eyebrow>Your neighbourhood</Eyebrow>
        <View>
          <Card
            rounded="card"
            padding="margin"
            shadow="warm"
            onPress={() => setOpen((o) => !o)}
            accessibilityLabel={`Neighbourhood: ${draft.city}, ${draft.neighborhood}. Tap to change.`}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.hairline }}
          >
            <Text variant="labelLg" style={{ fontSize: 16 }}>
              {draft.city} • {draft.neighborhood}
            </Text>
            <Icon name="expand_more" size={24} color="tertiary" style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }} />
          </Card>
          {open ? (
            <Card rounded="card" padding="xs" shadow="warm" style={{ marginTop: spacing.xs, gap: 2 }}>
              {NEIGHBORHOODS.map((n) => {
                const active = n.city === draft.city && n.area === draft.neighborhood;
                return (
                  <Pressable
                    key={`${n.city}-${n.area}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => {
                      update({ city: n.city, neighborhood: n.area });
                      setOpen(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: spacing.md,
                      minHeight: 48,
                      borderRadius: radius.xs,
                      backgroundColor: active ? colors.surfaceContainerHigh : colors.transparent,
                    }}
                  >
                    <Text variant="labelLg" style={{ fontFamily: active ? fonts.sansBold : fonts.sansMedium }}>
                      {n.city} • {n.area}
                    </Text>
                    {active ? <Icon name="check" size={20} color="secondary" /> : null}
                  </Pressable>
                );
              })}
            </Card>
          ) : null}
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text variant="labelLg" style={{ fontFamily: fonts.sansBold }}>
            Privacy mode
          </Text>
          <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20 }}>
            Only show your neighbourhood, hide your exact distance.
          </Text>
        </View>
        <Toggle value={draft.hideExactDistance} onChange={(hideExactDistance) => update({ hideExactDistance })} label="Privacy mode: hide exact distance" />
      </View>
    </Screen>
  );
}
