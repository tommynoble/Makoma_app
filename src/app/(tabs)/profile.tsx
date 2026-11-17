import { View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Card, Icon, IconBadge, Pill, Screen, Text, type IconName } from '@/components';
import { ageOf } from '@/components/profile/sections';
import { intentLabel } from '@/constants/intents';
import { MOCK_ME } from '@/features/mock-data';
import { spacing } from '@/theme';

const LINKS: { icon: IconName; title: string; body: string; href: '/treats' | '/settings/privacy' }[] = [
  { icon: 'redeem', title: 'My treats', body: 'Vouchers you have received', href: '/treats' },
  { icon: 'visibility_off', title: 'Privacy & Incognito', body: 'Control who can see you', href: '/settings/privacy' },
];

// TODO: needs the Stitch profile design code; editing is not built yet.
export default function MyProfile() {
  const me = MOCK_ME;
  return (
    <Screen back={false} bottomInset={false}>
      <View style={{ alignItems: 'center', gap: spacing.md }}>
        <Image source={me.photos[0]?.source} style={{ width: 112, height: 112, borderRadius: 56 }} contentFit="cover" accessibilityLabel="Your photo" />
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Text variant="headlineXl" accessibilityRole="header">
            {me.firstName}, {ageOf(me.birthDate)}
          </Text>
          <Text color="tertiary">
            {me.occupation} • {me.neighborhood}, {me.city}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' }}>
          {me.verification === 'verified' ? <Pill label="Selfie Verified" icon="verified_user" color="primary" size="md" /> : null}
          <Pill label={intentLabel(me.intent)} icon="favorite" iconColor="secondary" color="onSecondaryFixed" bg="secondaryFixed" size="md" />
        </View>
      </View>
      <View style={{ gap: spacing.sm }}>
        {LINKS.map((l) => (
          <Card key={l.href} onPress={() => router.push(l.href)} accessibilityLabel={l.title} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <IconBadge icon={l.icon} size={40} iconSize={20} bg="surfaceContainerHigh" color="primary" />
            <View style={{ flex: 1 }}>
              <Text variant="labelLg">{l.title}</Text>
              <Text color="tertiary">{l.body}</Text>
            </View>
            <Icon name="chevron_right" size={20} color="outlineVariant" />
          </Card>
        ))}
      </View>
    </Screen>
  );
}
