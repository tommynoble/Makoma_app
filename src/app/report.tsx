import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Eyebrow, Field, Icon, RadioMark, Text, Toggle } from '@/components';
import { useSocial } from '@/features/social/social-store';
import { haptic } from '@/lib/motion';
import { colors, fonts, radius, spacing } from '@/theme';

/** Report reasons, in the order people most often need them. */
export const REPORT_REASONS = [
  { id: 'money', label: 'Asked for money, MoMo or gifts', body: 'Including “emergencies”, school fees, transport or investments.' },
  { id: 'fake', label: 'Fake profile or photos', body: 'Not the person in the photos, or pretending to be someone else.' },
  { id: 'harassment', label: 'Harassment or threats', body: 'Insults, pressure, unwanted sexual messages or threats.' },
  { id: 'underage', label: 'Might be under 18', body: 'We review these first.' },
  { id: 'offline', label: 'Something happened on a date', body: 'Tell us what happened. We take this seriously.' },
  { id: 'spam', label: 'Spam or selling something', body: 'Links, promotions, or moving you to another app quickly.' },
  { id: 'other', label: 'Something else', body: 'Anything that made you feel unsafe or uncomfortable.' },
] as const;

/**
 * Report and/or block someone. Presented as a sheet from chat or a profile.
 * Blocking is on by default: the person disappears everywhere, immediately.
 * They are never told who reported them.
 */
export default function Report() {
  const insets = useSafeAreaInsets();
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  const social = useSocial();
  const person = social.profile(profileId);
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const name = person?.firstName ?? 'this person';

  const submit = async () => {
    if (!reason || !profileId) return;
    setBusy(true);
    setError(null);
    try {
      const label = REPORT_REASONS.find((r) => r.id === reason)!.label;
      if (alsoBlock) await social.block(profileId, { reason: label, details: details.trim() || undefined });
      else await social.report(profileId, label, details.trim() || undefined);
      haptic.success();
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? 'Couldn’t send your report. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    if (alsoBlock && done) router.dismissTo('/matches');
    else router.back();
  };

  if (done) {
    return (
      <View style={{ flex: 1, padding: spacing.lg, paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm, gap: spacing.lg, justifyContent: 'center', backgroundColor: colors.surface }}>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryFixed }}>
            <Icon name="task_alt" size={32} color="primary" />
          </View>
          <Text variant="headlineLg" center accessibilityRole="header">
            Thank you for telling us
          </Text>
          <Text color="tertiary" center>
            {alsoBlock ? `${name} is blocked and can’t see or contact you. ` : ''}Our team reviews every report, usually within 24 hours. {name} won’t know it was you.
          </Text>
        </View>
        {reason === 'offline' || reason === 'harassment' ? (
          <Card bg="surfaceContainerLow" shadow="none" style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Icon name="call" size={20} color="secondary" />
            <Text variant="labelMd" style={{ flex: 1, fontFamily: fonts.sansMedium }}>
              If you’re in danger, call the Ghana Police on 191 or 18555 now.
            </Text>
          </Card>
        ) : null}
        <Button title="Done" onPress={close} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="headlineLg" accessibilityRole="header">
            Report {name}
          </Text>
          <Text color="tertiary">Your report is confidential. What happened?</Text>
        </View>
        <View accessibilityRole="radiogroup" style={{ gap: spacing.sm }}>
          {REPORT_REASONS.map((r) => {
            const on = reason === r.id;
            return (
              <Card
                key={r.id}
                accessibilityRole="radio"
                selected={on}
                accessibilityLabel={r.label}
                onPress={() => {
                  if (!on) haptic.select();
                  setReason(r.id);
                }}
                padding="md"
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: on ? 2 : 1, borderColor: on ? colors.secondary : colors.hairline }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="labelLg" style={{ fontFamily: fonts.sansBold }}>
                    {r.label}
                  </Text>
                  <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium }}>
                    {r.body}
                  </Text>
                </View>
                <RadioMark selected={on} />
              </Card>
            );
          })}
        </View>
        <View style={{ gap: spacing.sm }}>
          <Eyebrow>Details (optional)</Eyebrow>
          <Field multiline accessibilityLabel="Details" placeholder="Anything that helps us understand" value={details} onChangeText={setDetails} maxLength={1000} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: colors.hairline }}>
          <View style={{ flex: 1 }}>
            <Text variant="labelLg" style={{ fontFamily: fonts.sansBold }}>
              Also block {name}
            </Text>
            <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium }}>
              Ends the match. They can’t see or message you.
            </Text>
          </View>
          <Toggle value={alsoBlock} onChange={setAlsoBlock} label={`Also block ${name}`} />
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: Math.max(insets.bottom, spacing.md), gap: spacing.sm }}>
        {error ? (
          <Text variant="labelMd" color="error" center>
            {error}
          </Text>
        ) : null}
        <Button title={busy ? 'Sending…' : alsoBlock ? 'Report and block' : 'Send report'} variant="warm" haptics="none" disabled={!reason || busy} onPress={submit} />
      </View>
    </View>
  );
}
