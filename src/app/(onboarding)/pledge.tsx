import { View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Button, Card, Checkbox, Heading, Icon, IconBadge, Pill, Screen, Text, type IconName } from '@/components';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { alpha, colors, radius, spacing, type ColorName } from '@/theme';

const RULES: { icon: IconName; bg: ColorName; color: ColorName; filled?: boolean; title: string; body: string; tag?: string }[] = [
  {
    icon: 'photo_camera_front',
    bg: 'secondaryFixed',
    color: 'onSecondaryFixed',
    title: 'Show up authentically',
    tag: 'Essential',
    body: 'Real photos, live voice notes, and truthful profiles. We value the beauty of who you actually are.',
  },
  {
    icon: 'handshake',
    bg: 'surfaceContainerHighest',
    color: 'secondary',
    title: 'Lead with respect',
    body: 'Warmth, courtesy, and transparent intentions in every conversation. If it isn’t working, say so kindly.',
  },
  {
    icon: 'shield_lock',
    bg: 'primaryFixed',
    color: 'onPrimaryContainer',
    filled: true,
    title: 'Protect the community',
    body: 'Strict confidentiality and zero tolerance for solicitation, bad faith, or harassment. Never ask anyone for money or gifts.',
  },
];

export default function Pledge() {
  const { draft, update } = useOnboarding();
  return (
    <Screen
      step={1}
      footer={
        <>
          <Button title="I Agree & Continue" icon="arrow_forward" disabled={!draft.pledgeAccepted} onPress={() => router.push('/intentions')} />
          <Text variant="labelSm" color="tertiary" center>
            Takes about 2 minutes to set up your profile
          </Text>
        </>
      }
    >
      <Heading
        eyebrow={<Pill label="Our Pledge" dot="primaryContainer" color="tertiary" uppercase />}
        title="Built for real intentions."
        subtitle="A respectful space for genuine connections across Ghana and the diaspora."
      />

      <View style={{ height: 176, borderRadius: radius.md, borderCurve: 'continuous', overflow: 'hidden', backgroundColor: colors.surfaceContainer }}>
        <Image source={require('../../../assets/mock/osu-terrace.jpg')} contentFit="cover" style={{ flex: 1 }} accessibilityLabel="Friends laughing together at a café in Osu" />
        <LinearGradient
          colors={[colors.transparent, alpha(colors.inverseSurface, 0.2), alpha(colors.inverseSurface, 0.8)]}
          style={{ position: 'absolute', inset: 0, justifyContent: 'flex-end', padding: spacing.md }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Icon name="verified_user" size={20} color="primaryFixed" filled />
            <Text variant="labelMd" color="inverseOnSurface">
              Selfie-verified profiles stand out with a shield
            </Text>
          </View>
        </LinearGradient>
      </View>

      <View style={{ gap: spacing.md }}>
        {RULES.map((r) => (
          <Card key={r.title} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
            <IconBadge icon={r.icon} bg={r.bg} color={r.color} rounded="md" filled={r.filled} />
            <View style={{ flex: 1, gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text variant="labelLg">{r.title}</Text>
                {r.tag ? <Pill label={r.tag} bg="surfaceContainer" color="tertiary" style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.xs }} /> : null}
              </View>
              <Text color="tertiary">
                {r.body}
              </Text>
            </View>
          </Card>
        ))}
      </View>

      <Card bg="surfaceContainerLow" shadow="none" padding="margin" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Checkbox value={draft.pledgeAccepted} onChange={(pledgeAccepted) => update({ pledgeAccepted })} label="I hold myself accountable to these values" />
        <Icon name="favorite" size={20} color="primary" />
      </Card>
    </Screen>
  );
}
