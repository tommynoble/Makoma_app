import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Heading, Icon, IconBadge, RadioMark, Screen, Text, Toggle } from '@/components';
import { NEIGHBORHOODS } from '@/constants/ghana';
import { INTENTS } from '@/constants/intents';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { colors, radius, spacing } from '@/theme';

/** Intent is the main Discover filter and is shown on every profile. */
export default function Intentions() {
  const { draft, update } = useOnboarding();
  const [open, setOpen] = useState(false);

  return (
    <Screen
      step={2}
      footer={
        <>
          <Button title="Continue" icon="arrow_forward" disabled={!draft.intent} onPress={() => router.push('/about')} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs }}>
            <Icon name="lock" size={16} color="tertiary" />
            <Text variant="labelSm" color="tertiary">
              You can change this later in your profile
            </Text>
          </View>
        </>
      }
    >
      <Heading
        eyebrow={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Text variant="labelSm" color="secondary" uppercase>
              Relationship Goals
            </Text>
            <Icon name="favorite" size={14} color="secondary" />
          </View>
        }
        title="What brings you here?"
        subtitle="Be upfront. We only match you with people whose relationship outlook aligns with yours."
      />

      <View accessibilityRole="radiogroup" style={{ gap: spacing.sm }}>
        {INTENTS.map((i) => {
          const selected = draft.intent === i.id;
          return (
            <Card
              key={i.id}
              bg={selected ? 'surfaceContainerHigh' : 'surfaceContainerLowest'}
              selected={selected}
              accessibilityLabel={`${i.label}. ${i.description}`}
              onPress={() => update({ intent: i.id })}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="labelLg" color={selected ? 'onSecondaryContainer' : 'onSurface'}>
                  {i.label}
                </Text>
                <Text color={selected ? 'secondary' : 'tertiary'}>{i.description}</Text>
              </View>
              <RadioMark selected={selected} />
            </Card>
          );
        })}
      </View>

      <View style={{ gap: spacing.md }}>
        <View style={{ gap: spacing.xs }}>
          <Text variant="labelSm" color="tertiary" uppercase>
            Location & Privacy
          </Text>
          <Text variant="headlineMd" accessibilityRole="header">
            Your primary city & neighbourhood
          </Text>
        </View>

        <View>
          <Card
            onPress={() => setOpen((o) => !o)}
            accessibilityLabel={`Current base: ${draft.city}, ${draft.neighborhood}. Tap to change.`}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <IconBadge icon="location_on" size={36} iconSize={20} bg="primaryFixed" color="onPrimaryFixed" />
              <View>
                <Text variant="labelSm" color="tertiary">
                  Current Base
                </Text>
                <Text variant="labelLg">
                  {draft.city} • {draft.neighborhood}
                </Text>
              </View>
            </View>
            <Icon name="expand_more" size={20} color="tertiary" style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }} />
          </Card>
          {open ? (
            <Card rounded="md" padding="xs" shadow="lg" style={{ marginTop: spacing.xs, gap: 2 }}>
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
                      padding: spacing.sm,
                      minHeight: 44,
                      borderRadius: radius.xs,
                      backgroundColor: active ? colors.surfaceContainerLow : colors.transparent,
                    }}
                  >
                    <Text>
                      {n.city} • {n.area}
                    </Text>
                    {active ? <Icon name="check_circle" size={18} color="primary" /> : null}
                  </Pressable>
                );
              })}
            </Card>
          ) : null}
        </View>

        <Card bg="surfaceContainer" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ flex: 1, flexDirection: 'row', gap: spacing.sm }}>
            <Icon name="shield_person" size={22} color="primary" filled style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text variant="labelMd">Only show neighbourhood, hide exact distance</Text>
              <Text color="tertiary">Keeps your privacy while people can still see you are nearby.</Text>
            </View>
          </View>
          <Toggle value={draft.hideExactDistance} onChange={(hideExactDistance) => update({ hideExactDistance })} label="Hide exact distance" />
        </Card>
      </View>
    </Screen>
  );
}
