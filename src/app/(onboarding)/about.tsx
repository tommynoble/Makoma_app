import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Chip, Eyebrow, Field, Heading, Screen, Text } from '@/components';
import { INSTITUTIONS } from '@/constants/ghana';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { ageOfBirth } from '@/features/discover/deck';
import { haptic } from '@/lib/motion';
import type { Gender } from '@/types/domain';
import { colors, fonts, radius, spacing } from '@/theme';

const pad = (v: string) => v.padStart(2, '0');

/** "YYYY-MM-DD" if the parts make a real date, else null. */
function toIsoDate(d: string, m: string, y: string) {
  if (!d || !m || y.length !== 4) return null;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (date.getFullYear() !== Number(y) || date.getMonth() !== Number(m) - 1 || date.getDate() !== Number(d)) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Name, birthday, who you are and who you'd like to meet, work, schools. */
export default function About() {
  const { draft, update } = useOnboarding();
  const [y0, m0, d0] = (draft.birthDate ?? '--').split('-');
  const [bd, setBd] = useState({ d: d0 ?? '', m: m0 ?? '', y: y0 ?? '' });
  const iso = toIsoDate(bd.d, bd.m, bd.y);
  const age = iso ? ageOfBirth(iso) : null;
  const dobError = bd.y.length === 4 && !iso ? 'That date doesn’t look right.' : age != null && age < 18 ? 'You need to be 18 or older to use Makoma.' : age != null && age > 100 ? 'Check the year.' : null;
  const setPart = (k: 'd' | 'm' | 'y', v: string) => {
    const next = { ...bd, [k]: v.replace(/\D/g, '') };
    setBd(next);
    const nIso = toIsoDate(next.d, next.m, next.y);
    update({ birthDate: nIso && ageOfBirth(nIso) >= 18 && ageOfBirth(nIso) <= 100 ? nIso : undefined });
  };
  const setInterested = (g: Gender) => update({ interestedIn: draft.interestedIn.includes(g) ? draft.interestedIn.filter((x) => x !== g) : [...draft.interestedIn, g] });
  const ready = !!draft.firstName?.trim() && !!draft.occupation?.trim() && !!draft.birthDate && !!draft.gender && draft.interestedIn.length > 0;
  const toggle = (id: string) => {
    haptic.select();
    update({ institutionIds: draft.institutionIds.includes(id) ? draft.institutionIds.filter((x) => x !== id) : [...draft.institutionIds, id] });
  };

  return (
    <Screen step={3} footer={<Button title="Continue" disabled={!ready} onPress={() => router.push('/selfie')} />}>
      <Heading title="Share your story." />

      <View style={{ gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>First name</Eyebrow>
          <Field accessibilityLabel="First name" placeholder="e.g. Akosua" value={draft.firstName} onChangeText={(firstName) => update({ firstName })} autoCapitalize="words" />
        </View>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>Birthday</Eyebrow>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Field accessibilityLabel="Day of birth" placeholder="DD" value={bd.d} onChangeText={(v) => setPart('d', v)} keyboardType="number-pad" maxLength={2} style={{ textAlign: 'center', width: '100%' }} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Field accessibilityLabel="Month of birth" placeholder="MM" value={bd.m} onChangeText={(v) => setPart('m', v)} keyboardType="number-pad" maxLength={2} style={{ textAlign: 'center', width: '100%' }} />
            </View>
            <View style={{ flex: 1.6, minWidth: 0 }}>
              <Field accessibilityLabel="Year of birth" placeholder="YYYY" value={bd.y} onChangeText={(v) => setPart('y', v)} keyboardType="number-pad" maxLength={4} style={{ textAlign: 'center', width: '100%' }} />
            </View>
          </View>
          <Text variant="labelSm" color={dobError ? 'error' : 'tertiary'} style={{ fontFamily: fonts.sansMedium }} accessibilityLiveRegion="polite">
            {dobError ?? (age != null ? `You’re ${age}. Only your age is shown, never your birthday.` : 'Only your age is shown, never your birthday.')}
          </Text>
        </View>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>I am a</Eyebrow>
          <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Chip label="Man" on={draft.gender === 'man'} onPress={() => update({ gender: 'man' })} />
            <Chip label="Woman" on={draft.gender === 'woman'} onPress={() => update({ gender: 'woman' })} />
          </View>
        </View>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>Show me</Eyebrow>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Chip label="Women" on={draft.interestedIn.includes('woman')} onPress={() => setInterested('woman')} />
            <Chip label="Men" on={draft.interestedIn.includes('man')} onPress={() => setInterested('man')} />
          </View>
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
