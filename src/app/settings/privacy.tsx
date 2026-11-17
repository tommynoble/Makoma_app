import { useState } from 'react';
import { Body, Button, Choice, Gap, Screen, Title } from '@/components/ui';
import { formatCedis, SACHET_PLANS } from '@/constants/ghana';

/**
 * Discreet visibility for professionals worried about being seen on a dating
 * app. Incognito: your profile is only shown to people you've liked first.
 * Sold as short "sachet" passes (1 day / 1 week).
 */
export default function Privacy() {
  const [plan, setPlan] = useState<string | null>(null);
  const plans = SACHET_PLANS.filter((p) => p.feature === 'incognito');
  return (
    <Screen>
      <Title>Incognito mode</Title>
      <Body muted>
        Only people you like will see your profile. No colleagues, no gossip. Your discretion is protected.
      </Body>
      <Gap />
      {plans.map((p) => (
        <Choice key={p.id} label={p.label} description={formatCedis(p.pricePesewas)} selected={plan === p.id} onPress={() => setPlan(p.id)} />
      ))}
      <Gap />
      {/* TODO: purchase via Paystack (MoMo), then setVisibility('incognito') once the webhook confirms. */}
      <Button label="Buy with MoMo" disabled={!plan} />
    </Screen>
  );
}
