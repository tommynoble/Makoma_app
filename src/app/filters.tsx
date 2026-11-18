import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Eyebrow, Text, Toggle } from '@/components';
import { LANGUAGES } from '@/constants/ghana';
import { INTENTS } from '@/constants/intents';
import { matchesFilters } from '@/features/discover/deck';
import { MOCK_PROFILES } from '@/features/mock-data';
import { DEFAULT_FILTERS, useSocial } from '@/features/social/social-store';
import { haptic } from '@/lib/motion';
import { colors, fonts, maxContentWidth, spacing } from '@/theme';
import type { DiscoverFilters, IntentId, LanguageId } from '@/types/domain';

const MIN_AGE = 18;
const MAX_AGE = 60;

function Stepper({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  const set = (v: number) => {
    const next = Math.max(min, Math.min(max, v));
    if (next !== value) haptic.select();
    onChange(next);
  };
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: spacing.sm }} accessibilityRole="adjustable" accessibilityLabel={`${label} ${value}`} accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]} onAccessibilityAction={(e) => set(value + (e.nativeEvent.actionName === 'increment' ? 1 : -1))}>
      <Eyebrow>{label}</Eyebrow>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${label}`} onPress={() => set(value - 1)} hitSlop={6} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.sansBold, fontSize: 20, color: colors.onSurface }}>−</Text>
        </Pressable>
        <Text style={{ fontFamily: fonts.sansBold, fontSize: 26, color: colors.onSurface, minWidth: 40, textAlign: 'center', fontVariant: ['tabular-nums'] }}>{value}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Increase ${label}`} onPress={() => set(value + 1)} hitSlop={6} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.sansBold, fontSize: 20, color: colors.onSurface }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Discover filters, presented as a sheet. Shows a live count of who matches. */
export default function Filters() {
  const insets = useSafeAreaInsets();
  const social = useSocial();
  const [f, setF] = useState<DiscoverFilters>(social.state.filters);
  const count = useMemo(() => MOCK_PROFILES.filter((p) => matchesFilters(p, f)).length, [f]);

  const toggleIntent = (id: IntentId) => setF((x) => ({ ...x, intents: x.intents.includes(id) ? x.intents.filter((i) => i !== id) : [...x.intents, id] }));
  const toggleLang = (id: LanguageId) => setF((x) => ({ ...x, languages: x.languages.includes(id) ? x.languages.filter((l) => l !== id) : [...x.languages, id] }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.section, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="headlineXl" accessibilityRole="header">
            Filters
          </Text>
          <Pressable accessibilityRole="button" hitSlop={10} onPress={() => setF(DEFAULT_FILTERS)}>
            <Text variant="labelLg" color="primary" style={{ fontFamily: fonts.sansBold }}>
              Reset
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: spacing.md }}>
          <Eyebrow>Looking for</Eyebrow>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {INTENTS.map((i) => (
              <Chip key={i.id} label={i.label} on={f.intents.includes(i.id)} onPress={() => toggleIntent(i.id)} />
            ))}
          </View>
        </View>

        <Card rounded="card" padding="lg" shadow="warm" style={{ flexDirection: 'row', gap: spacing.md }}>
          <Stepper label="Min age" value={f.minAge} min={MIN_AGE} max={f.maxAge} onChange={(minAge) => setF((x) => ({ ...x, minAge }))} />
          <View style={{ width: 1, backgroundColor: colors.hairline }} />
          <Stepper label="Max age" value={f.maxAge} min={f.minAge} max={MAX_AGE} onChange={(maxAge) => setF((x) => ({ ...x, maxAge }))} />
        </Card>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text variant="labelLg" style={{ fontFamily: fonts.sansBold }}>
              Verified only
            </Text>
            <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium, fontSize: 14 }}>
              Only show people who passed selfie verification.
            </Text>
          </View>
          <Toggle value={f.verifiedOnly} onChange={(verifiedOnly) => setF((x) => ({ ...x, verifiedOnly }))} label="Verified only" />
        </View>

        <View style={{ gap: spacing.md }}>
          <Eyebrow>Speaks (any of)</Eyebrow>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {LANGUAGES.map((l) => (
              <Chip key={l.id} label={l.label} on={f.languages.includes(l.id)} onPress={() => toggleLang(l.id)} />
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md), gap: spacing.sm, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
        <Button
          title={count === 0 ? 'No one matches yet' : `Show ${count} ${count === 1 ? 'person' : 'people'}`}
          disabled={f.intents.length === 0}
          onPress={() => {
            social.setFilters(f);
            router.back();
          }}
        />
      </View>
    </View>
  );
}
