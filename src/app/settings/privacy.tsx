import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, IconBadge, RadioMark, Text } from '@/components';
import { formatCedis, SACHET_PLANS } from '@/constants/ghana';
import { colors, maxContentWidth, spacing } from '@/theme';

/**
 * Discreet visibility for professionals: in Incognito your profile is shown
 * only to people you've liked first. Sold as short "sachet" passes.
 */
export default function Privacy() {
  const [plan, setPlan] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const plans = SACHET_PLANS.filter((p) => p.feature === 'incognito');
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.surface }} contentContainerStyle={{ padding: spacing.margin, gap: spacing.lg, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
        <IconBadge icon="visibility_off" bg="primaryFixed" color="onPrimaryContainer" />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Text variant="headlineLg" accessibilityRole="header">
            Incognito mode
          </Text>
          <Text color="tertiary">Only people you like will see your profile. No colleagues, no gossip.</Text>
        </View>
      </View>
      <View accessibilityRole="radiogroup" style={{ gap: spacing.sm }}>
        {plans.map((p) => (
          <Card key={p.id} bg={plan === p.id ? 'surfaceContainerHigh' : 'surfaceContainerLowest'} selected={plan === p.id} onPress={() => setPlan(p.id)} accessibilityLabel={`${p.label}, ${formatCedis(p.pricePesewas)}`} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text variant="labelLg">{p.label}</Text>
              <Text color="tertiary">{formatCedis(p.pricePesewas)}</Text>
            </View>
            <RadioMark selected={plan === p.id} />
          </Card>
        ))}
      </View>
      {/* TODO: purchase via Paystack (MoMo), then the webhook turns incognito on. */}
      <Button title="Buy with MoMo" disabled={!plan} onPress={() => setNotice('Payments are not connected yet in this prototype.')} />
      {notice ? (
        <Text variant="labelMd" color="tertiary" center>
          {notice}
        </Text>
      ) : null}
    </ScrollView>
  );
}
