import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Enter, Icon, IconBadge, RadioMark, Text, Toggle } from '@/components';
import { formatCedis, SACHET_PLANS } from '@/constants/ghana';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { useSocial } from '@/features/social/social-store';
import { haptic } from '@/lib/motion';
import { colors, fonts, maxContentWidth, radius, spacing } from '@/theme';

const until = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

/**
 * Discreet visibility for professionals: in Incognito your profile is shown
 * only to people you've liked first. Sold as short "sachet" passes.
 */
export default function Privacy() {
  const social = useSocial();
  const { draft, update } = useOnboarding();
  const [plan, setPlan] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const plans = SACHET_PLANS.filter((p) => p.feature === 'incognito');
  const activeUntil = social.state.incognitoUntil && new Date(social.state.incognitoUntil) > new Date() ? social.state.incognitoUntil : null;
  const chosen = plans.find((p) => p.id === plan);

  const buy = () => {
    if (!chosen) return;
    haptic.medium();
    setBusy(true);
    // TODO: Paystack MoMo checkout; the webhook turns incognito on server-side.
    setTimeout(() => {
      social.buyIncognito(chosen.durationHours);
      haptic.success();
      setBusy(false);
      setPlan(null);
    }, 900);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.surface }} contentContainerStyle={{ padding: spacing.margin, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.section, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
        <IconBadge icon="visibility_off" bg="primaryFixed" color="onPrimaryContainer" />
        <View style={{ flex: 1, gap: spacing.sm }}>
          <Text variant="headlineLg" accessibilityRole="header">
            Incognito mode
          </Text>
          <Text color="tertiary">Only people you like will see your profile. No colleagues, no gossip.</Text>
        </View>
      </View>

      {activeUntil ? (
        <Enter key="active" variant="fade">
          <Card bg="primary" rounded="card" padding="lg" shadow="primaryGlow" style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Icon name="verified_user" size={22} color="primaryFixed" />
              <Text variant="labelLg" color="onPrimary" style={{ fontFamily: fonts.sansBold }}>
                Incognito is on
              </Text>
            </View>
            <Text color="onPrimary">You’re hidden from Discover until {until(activeUntil)}. People you like can still see you.</Text>
            <Button title="Turn off now" variant="tonal" size="md" onPress={() => { haptic.select(); social.endIncognito(); }} />
          </Card>
        </Enter>
      ) : (
        <Enter key="plans" variant="fade" style={{ gap: spacing.md }}>
          <View accessibilityRole="radiogroup" style={{ gap: spacing.md }}>
            {plans.map((p) => (
              <Card
                key={p.id}
                bg={plan === p.id ? 'surfaceContainerLow' : 'surfaceContainerLowest'}
                accessibilityRole="radio"
                selected={plan === p.id}
                onPress={() => {
                  if (plan !== p.id) haptic.select();
                  setPlan(p.id);
                }}
                accessibilityLabel={`${p.label}, ${formatCedis(p.pricePesewas)}`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: plan === p.id ? 2 : 1, borderColor: plan === p.id ? colors.secondary : colors.hairline }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="labelLg" style={{ fontFamily: fonts.sansBold }}>
                    {p.label}
                  </Text>
                  <Text color="tertiary">{formatCedis(p.pricePesewas)} · one-off, no subscription</Text>
                </View>
                <RadioMark selected={plan === p.id} />
              </Card>
            ))}
          </View>
          <Button title={busy ? 'Confirming payment…' : chosen ? `Pay ${formatCedis(chosen.pricePesewas)} with MoMo` : 'Choose a pass'} haptics="none" disabled={!chosen || busy} onPress={buy} />
          <Text variant="labelSm" color="tertiary" center style={{ fontFamily: fonts.sansMedium }}>
            Demo mode: no money is charged.
          </Text>
        </Enter>
      )}

      <View style={{ gap: spacing.md }}>
        <Text variant="labelSm" color="tertiary" uppercase>
          Always free
        </Text>
        <Card rounded="card" padding="margin" style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text variant="labelLg" style={{ fontFamily: fonts.sansBold }}>
                Hide exact distance
              </Text>
              <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium }}>
                Show only your neighbourhood ({draft.neighborhood})
              </Text>
            </View>
            <Toggle value={draft.hideExactDistance} onChange={(hideExactDistance) => update({ hideExactDistance })} label="Hide exact distance" />
          </View>
        </Card>
        <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surfaceContainerLow }}>
          <Icon name="shield" size={18} color="tertiary" />
          <Text variant="labelMd" color="tertiary" style={{ flex: 1, fontFamily: fonts.sansMedium }}>
            Your phone number is never shown. Screenshots of chats are discouraged and reports are reviewed by people, not bots.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
