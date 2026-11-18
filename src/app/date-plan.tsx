import { useState } from 'react';
import { ScrollView, Share, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Eyebrow, Field, Icon, Text, type IconName } from '@/components';
import { useSocial } from '@/features/social/social-store';
import { haptic } from '@/lib/motion';
import { colors, fonts, maxContentWidth, spacing } from '@/theme';

export const DATE_TIPS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'restaurant', title: 'Meet somewhere public', body: 'A busy café, restaurant or mall. Not a home, hotel room or somewhere isolated.' },
  { icon: 'directions_walk', title: 'Get there and back yourself', body: 'Take your own car, Uber or Bolt. Don’t share your home address yet.' },
  { icon: 'shield_person', title: 'Tell someone you trust', body: 'Share where you’re going, who with, and when you’ll check in.' },
  { icon: 'local_cafe', title: 'Watch your drink', body: 'Order it yourself and keep it in sight. Leave if something feels off.' },
  { icon: 'lock', title: 'Never send money', body: 'No MoMo, no “transport money”, no emergencies. Real matches don’t ask.' },
];

/**
 * Plan a first date safely: where, when, and a trusted contact. Sharing opens
 * the phone's share sheet (WhatsApp, SMS…) with a ready-made message.
 */
export default function DatePlanScreen() {
  const insets = useSafeAreaInsets();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const social = useSocial();
  const person = social.profile(social.state.matches[matchId]?.profileId);
  const saved = social.state.datePlans[matchId];
  const [place, setPlace] = useState(saved?.place ?? '');
  const [when, setWhen] = useState(saved?.when ?? '');
  const [contactName, setContactName] = useState(saved?.contactName ?? '');
  const [contactPhone, setContactPhone] = useState(saved?.contactPhone ?? '');
  const ready = place.trim() && when.trim() && contactName.trim();
  const name = person?.firstName ?? 'my match';

  const share = async () => {
    const plan = { place: place.trim(), when: when.trim(), contactName: contactName.trim(), contactPhone: contactPhone.trim() };
    const message =
      `Hi ${plan.contactName}, I’m going on a date and wanted someone to know.\n\n` +
      `Who: ${name}${person?.neighborhood ? ` (${person.neighborhood})` : ''}, from Makoma\n` +
      `Where: ${plan.place}\nWhen: ${plan.when}\n\n` +
      `I’ll text you when I get there and when I’m home. If you don’t hear from me, please call me.`;
    try {
      const res = await Share.share({ message });
      if (res.action === Share.dismissedAction) return;
      haptic.success();
      social.saveDatePlan(matchId, { ...plan, sharedAt: new Date().toISOString() });
      router.back();
    } catch {
      social.saveDatePlan(matchId, plan);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: spacing.margin, paddingTop: spacing.lg, gap: spacing.section, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
        <View style={{ gap: spacing.sm }}>
          <Text variant="headlineXl" accessibilityRole="header">
            Meeting {name}?
          </Text>
          <Text color="tertiary">Tell someone you trust where you’ll be. It takes ten seconds and it’s what everyone should do.</Text>
        </View>
        {saved?.sharedAt ? (
          <Card bg="primaryFixed" shadow="none" style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
            <Icon name="task_alt" size={20} color="primary" />
            <Text variant="labelMd" color="onPrimaryFixed" style={{ flex: 1, fontFamily: fonts.sansSemiBold }}>
              Shared with {saved.contactName}. You can update and share again.
            </Text>
          </Card>
        ) : null}
        <View style={{ gap: spacing.lg }}>
          <View style={{ gap: spacing.sm }}>
            <Eyebrow>Where</Eyebrow>
            <Field accessibilityLabel="Where" placeholder="e.g. Coffee shop at Accra Mall" value={place} onChangeText={setPlace} />
          </View>
          <View style={{ gap: spacing.sm }}>
            <Eyebrow>When</Eyebrow>
            <Field accessibilityLabel="When" placeholder="e.g. Saturday, 4pm" value={when} onChangeText={setWhen} />
          </View>
          <View style={{ gap: spacing.sm }}>
            <Eyebrow>Trusted contact</Eyebrow>
            <Field accessibilityLabel="Contact name" placeholder="Their name, e.g. Ama" value={contactName} onChangeText={setContactName} autoCapitalize="words" />
            <Field accessibilityLabel="Contact phone (optional)" placeholder="Phone (optional)" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />
          </View>
        </View>
        <View style={{ gap: spacing.md }}>
          <Eyebrow>First-date tips</Eyebrow>
          {DATE_TIPS.map((t) => (
            <View key={t.title} style={{ flexDirection: 'row', gap: spacing.md }}>
              <Icon name={t.icon} size={22} color="secondary" filled={false} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="labelLg" style={{ fontFamily: fonts.sansBold }}>
                  {t.title}
                </Text>
                <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium }}>
                  {t.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.margin, paddingTop: spacing.sm, paddingBottom: Math.max(insets.bottom, spacing.md), borderTopWidth: 1, borderTopColor: colors.hairline }}>
        <Button title={`Share with ${contactName.trim() || 'your contact'}`} icon="share" disabled={!ready} onPress={share} />
      </View>
    </View>
  );
}
