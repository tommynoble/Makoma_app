import { View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Button, Card, Checkbox, Heading, Icon, Screen, Text, type IconName } from '@/components';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { colors, radius, spacing } from '@/theme';

const RULES: { icon: IconName; title: string; body: string }[] = [
  { icon: 'person', title: 'Show up authentically', body: 'Real photos, real voice, truthful profile.' },
  { icon: 'handshake', title: 'Lead with respect', body: 'Warmth and honesty. If it isn’t working, say so kindly.' },
  { icon: 'lock', title: 'Protect the community', body: 'Never ask anyone for money or gifts.' },
];

export default function Pledge() {
  const { draft, update } = useOnboarding();
  return (
    <Screen step={1} footer={<Button title="I Agree & Continue" disabled={!draft.pledgeAccepted} onPress={() => router.push('/intentions')} />}>
      <Heading title={'Built for real\nintentions.'} />

      <View style={{ aspectRatio: 4 / 3, borderRadius: radius.card, borderCurve: 'continuous', overflow: 'hidden', backgroundColor: colors.surfaceContainer }}>
        <Image source={require('../../../assets/mock/osu-terrace.jpg')} contentFit="cover" style={{ flex: 1 }} accessibilityLabel="Friends laughing together at a café in Osu" />
      </View>

      <View style={{ gap: spacing.md }}>
        {RULES.map((r) => (
          <Card key={r.title} rounded="card" padding="margin" shadow="warm" style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
            <Icon name={r.icon} size={24} color="primary" filled={false} style={{ marginTop: 2 }} />
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text variant="labelLg" style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>
                {r.title}
              </Text>
              <Text variant="labelMd" color="tertiary" style={{ fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, lineHeight: 20 }}>
                {r.body}
              </Text>
            </View>
          </Card>
        ))}
      </View>

      <Checkbox value={draft.pledgeAccepted} onChange={(pledgeAccepted) => update({ pledgeAccepted })} label="I hold myself accountable to these values and will protect the Makoma community." />
    </Screen>
  );
}
