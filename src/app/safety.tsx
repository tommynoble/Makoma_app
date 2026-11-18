import { Linking, ScrollView, View } from 'react-native';
import { Card, Eyebrow, Icon, IconBadge, PressableScale, Text, type IconName } from '@/components';
import { haptic } from '@/lib/motion';
import { colors, fonts, maxContentWidth, spacing } from '@/theme';
import { DATE_TIPS } from './date-plan';

const EMERGENCY = [
  { label: 'Police', number: '191' },
  { label: 'Police (toll-free)', number: '18555' },
  { label: 'Ambulance', number: '193' },
];

const SCAMS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'warning', title: '“Send me MoMo, it’s an emergency”', body: 'Hospital bills, school fees, transport, a stuck parcel. Real matches don’t ask for money. Ever.' },
  { icon: 'warning', title: '“Let’s move to WhatsApp”', body: 'Within minutes, before you’ve spoken. Scammers leave Makoma so our safety checks can’t see them.' },
  { icon: 'warning', title: 'Investments, crypto, forex', body: '“I’ll teach you how I made my money.” Romance and investment scams go together.' },
  { icon: 'warning', title: 'Too perfect, too fast', body: 'Love declared in days, a reason they can never voice note or video call. Ask for a voice note: we built them for this.' },
  { icon: 'warning', title: 'Abroad and can’t meet', body: 'Always “travelling for work” or “stationed overseas”, with a reason to need money soon.' },
];

/** Safety centre: emergency numbers, scam patterns and first-date advice. */
export default function Safety() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.surface }} contentContainerStyle={{ padding: spacing.margin, paddingBottom: spacing.xl, gap: spacing.section, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
      <View style={{ gap: spacing.sm }}>
        <Text variant="headlineXl" accessibilityRole="header">
          Your safety comes first.
        </Text>
        <Text color="tertiary">Makoma will never ask you for money or your PIN, and nobody you meet here should either.</Text>
      </View>

      <View style={{ gap: spacing.md }}>
        <Eyebrow>In danger right now?</Eyebrow>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {EMERGENCY.map((e) => (
            <PressableScale
              key={e.number}
              onPress={() => {
                haptic.medium();
                Linking.openURL(`tel:${e.number}`).catch(() => {});
              }}
              accessibilityRole="button"
              accessibilityLabel={`Call ${e.label}, ${e.number}`}
              containerStyle={{ flex: 1 }}
              style={{ alignItems: 'center', gap: 4, paddingVertical: spacing.md, borderRadius: 16, backgroundColor: colors.secondary }}
            >
              <Icon name="call" size={22} color="onSecondary" />
              <Text style={{ fontFamily: fonts.sansBold, fontSize: 20, color: colors.onSecondary }}>{e.number}</Text>
              <Text variant="labelSm" color="onSecondary" center>
                {e.label}
              </Text>
            </PressableScale>
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.md }}>
        <Eyebrow>Scams to recognise</Eyebrow>
        {SCAMS.map((s) => (
          <Card key={s.title} padding="md" style={{ flexDirection: 'row', gap: spacing.md }}>
            <IconBadge icon={s.icon} size={36} iconSize={18} bg="secondaryFixed" color="secondary" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="labelLg" style={{ fontFamily: fonts.sansBold }}>
                {s.title}
              </Text>
              <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium }}>
                {s.body}
              </Text>
            </View>
          </Card>
        ))}
      </View>

      <View style={{ gap: spacing.md }}>
        <Eyebrow>Before a first date</Eyebrow>
        {DATE_TIPS.map((t) => (
          <View key={t.title} style={{ flexDirection: 'row', gap: spacing.md }}>
            <Icon name={t.icon} size={22} color="primary" filled={false} />
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

      <Card bg="surfaceContainerLow" shadow="none" style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Icon name="flag" size={20} color="secondary" />
        <Text variant="labelMd" style={{ flex: 1, fontFamily: fonts.sansMedium }}>
          See something wrong? Open the chat, tap ⋯ and choose “Report or block”. It’s confidential.
        </Text>
      </Card>
    </ScrollView>
  );
}
