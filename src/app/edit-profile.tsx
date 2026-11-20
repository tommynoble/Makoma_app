import { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip, Eyebrow, Field, FormScrollView, Icon, IconButton, KeyboardDoneBar, PressableScale, Text } from '@/components';
import { CITIES, INSTITUTIONS, LANGUAGES, NEIGHBORHOODS } from '@/constants/ghana';
import { INTENTS } from '@/constants/intents';
import { MOCK_ME } from '@/features/mock-data';
import { useResolvedSources } from '@/features/backend/media';
import { useSaveProfile } from '@/features/backend/use-save-profile';
import { useOnboarding, type OnboardingDraft } from '@/features/onboarding/onboarding-context';
import { isBackendConfigured } from '@/lib/supabase';
import { haptic } from '@/lib/motion';
import { colors, fonts, maxContentWidth, radius, spacing } from '@/theme';
import type { LanguageId } from '@/types/domain';

const MAX_PHOTOS = 6;
const DRINKS = [
  { id: 'never', label: 'Never' },
  { id: 'socially', label: 'Socially' },
  { id: 'regularly', label: 'Regularly' },
] as const;

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Eyebrow>{title}</Eyebrow>
      {children}
      {hint ? (
        <Text variant="labelSm" color="tertiary" style={{ fontFamily: fonts.sansMedium }}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Edit everything on your profile. Changes are kept locally until Save. */
export default function EditProfile() {
  const insets = useSafeAreaInsets();
  const { draft } = useOnboarding();
  const saveProfile = useSaveProfile();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<OnboardingDraft>(() => ({ ...draft, photos: draft.photos.length || isBackendConfigured ? draft.photos : MOCK_ME.photos.map((p) => p.source) }));
  const [error, setError] = useState<string | null>(null);
  const shown = useResolvedSources(form.photos);
  const set = (patch: Partial<OnboardingDraft>) => setForm((f) => ({ ...f, ...patch }));

  const addPhotos = async () => {
    setError(null);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return setError('Allow photo access in Settings to add pictures.');
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - form.photos.length,
      quality: 0.8,
    });
    if (res.canceled) return;
    haptic.light();
    set({ photos: [...form.photos, ...res.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS) });
  };

  const removePhoto = (i: number) => {
    haptic.select();
    set({ photos: form.photos.filter((_, j) => j !== i) });
  };
  const makeMain = (i: number) => {
    if (i === 0) return;
    haptic.select();
    const next = [...form.photos];
    const [p] = next.splice(i, 1);
    set({ photos: [p, ...next] });
  };

  const save = async () => {
    if (!form.firstName?.trim()) return setError('Add your first name.');
    if (form.photos.length < 2) return setError('Add at least 2 photos so people can see the real you.');
    setError(null);
    setSaving(true);
    try {
      await saveProfile({ ...form, firstName: form.firstName.trim(), occupation: form.occupation?.trim(), church: form.church?.trim(), heritage: form.heritage?.trim() });
    } catch (e: any) {
      setSaving(false);
      return setError(e?.message ?? 'Couldn’t save. Check your connection and try again.');
    }
    setSaving(false);
    haptic.success();
    if (router.canGoBack()) router.back();
    else router.replace('/profile');
  };

  const hoods = NEIGHBORHOODS.filter((n) => n.city === form.city);
  const tile = { width: '31.5%', aspectRatio: 3 / 4, borderRadius: radius.card, overflow: 'hidden', borderCurve: 'continuous' } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <FormScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.margin, paddingTop: spacing.lg, gap: spacing.section, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}
      >
        <Section title={`Photos · ${form.photos.length}/${MAX_PHOTOS}`} hint="Tap a photo to make it your main one. Clear, recent photos of you, no filters.">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '2.75%', rowGap: spacing.sm }}>
            {form.photos.map((src, i) => (
              <View key={`${src}-${i}`} style={tile}>
                <PressableScale scaleTo={0.97} onPress={() => makeMain(i)} accessibilityRole="button" accessibilityLabel={i === 0 ? 'Main photo' : `Photo ${i + 1}. Make main photo`} containerStyle={{ flex: 1 }} style={{ flex: 1 }}>
                  <Image source={shown[i]} contentFit="cover" style={{ flex: 1, backgroundColor: colors.surfaceDim }} />
                </PressableScale>
                {i === 0 ? (
                  <View pointerEvents="none" style={{ position: 'absolute', left: 6, bottom: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.primary }}>
                    <Text variant="labelSm" color="onPrimary">
                      Main
                    </Text>
                  </View>
                ) : null}
                <IconButton icon="close" label={`Remove photo ${i + 1}`} size={28} iconSize={16} bg="surfaceContainerLowest" color="onSurface" onPress={() => removePhoto(i)} style={{ position: 'absolute', top: 6, right: 6 }} />
              </View>
            ))}
            {form.photos.length < MAX_PHOTOS ? (
              <PressableScale scaleTo={0.97} onPress={addPhotos} accessibilityRole="button" accessibilityLabel="Add photos" containerStyle={tile} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: radius.card, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.control, backgroundColor: colors.surfaceContainerLow }}>
                <Icon name="add_circle" size={28} color="secondary" />
                <Text variant="labelSm" color="secondary">
                  Add
                </Text>
              </PressableScale>
            ) : null}
          </View>
        </Section>

        <Section title="First name">
          <Field accessibilityLabel="First name" value={form.firstName} onChangeText={(firstName) => set({ firstName })} autoCapitalize="words" placeholder="e.g. Akosua" maxLength={30} />
        </Section>
        <Section title="Work">
          <Field accessibilityLabel="What do you do?" value={form.occupation} onChangeText={(occupation) => set({ occupation })} placeholder="e.g. Brand Strategist" maxLength={60} />
        </Section>
        <Section title="Life goals" hint={`${(form.lifeGoals ?? '').length}/300`}>
          <Field multiline accessibilityLabel="Life goals" value={form.lifeGoals} onChangeText={(lifeGoals) => set({ lifeGoals })} placeholder="My long-term goals are…" maxLength={300} />
        </Section>

        <Section title="Looking for">
          <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {INTENTS.map((it) => (
              <Chip key={it.id} label={it.label} on={form.intent === it.id} onPress={() => set({ intent: it.id })} />
            ))}
          </View>
        </Section>

        <Section title="City">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {CITIES.map((c) => (
              <Chip key={c} label={c} on={form.city === c} onPress={() => set({ city: c, neighborhood: NEIGHBORHOODS.find((n) => n.city === c)?.area ?? c })} />
            ))}
          </View>
        </Section>
        <Section title="Neighbourhood" hint="Only your neighbourhood is shown, never your exact location.">
          {hoods.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {hoods.map((n) => (
                <Chip key={n.area} label={n.area} on={form.neighborhood === n.area} onPress={() => set({ neighborhood: n.area })} />
              ))}
            </View>
          ) : (
            <Field accessibilityLabel="Neighbourhood" value={form.neighborhood} onChangeText={(neighborhood) => set({ neighborhood })} placeholder="e.g. Community 25" />
          )}
        </Section>

        <Section title="Languages you speak">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {LANGUAGES.map((l) => (
              <Chip key={l.id} label={l.label} on={form.languages.includes(l.id)} onPress={() => set({ languages: toggle<LanguageId>(form.languages, l.id) })} />
            ))}
          </View>
        </Section>

        <Section title="Schools" hint="Alumni show up as shared ground on Discover.">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {INSTITUTIONS.map((s) => (
              <Chip key={s.id} label={s.label} on={form.institutionIds.includes(s.id)} onPress={() => set({ institutionIds: toggle(form.institutionIds, s.id) })} />
            ))}
          </View>
        </Section>

        <Section title="Church or faith community (optional)">
          <Field accessibilityLabel="Church" value={form.church} onChangeText={(church) => set({ church })} placeholder="e.g. Christ the King, Ridge Church" />
        </Section>
        <Section title="Drinks">
          <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {DRINKS.map((d) => (
              <Chip key={d.id} label={d.label} on={form.drinks === d.id} onPress={() => set({ drinks: form.drinks === d.id ? undefined : d.id })} />
            ))}
          </View>
        </Section>
        <Section title="Roots (optional)">
          <Field accessibilityLabel="Hometown and family roots" value={form.heritage} onChangeText={(heritage) => set({ heritage })} placeholder="e.g. Kumasi • Accra" />
        </Section>
      </FormScrollView>
      <View style={{ paddingHorizontal: spacing.margin, paddingTop: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md), gap: spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.hairline }}>
        {error ? (
          <Text variant="labelMd" color="error" center accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
        <Button title={saving ? 'Saving…' : 'Save changes'} haptics="none" disabled={saving} onPress={save} />
      </View>
      <KeyboardDoneBar />
    </View>
  );
}
