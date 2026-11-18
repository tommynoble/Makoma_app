import { ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { Button, Card, IconBadge, Text } from '@/components';
import { useSocial } from '@/features/social/social-store';
import { haptic } from '@/lib/motion';
import { colors, fonts, maxContentWidth, spacing } from '@/theme';

/** People you've blocked, with the option to unblock. */
export default function Blocked() {
  const social = useSocial();
  const blocked = social.state.blocked;
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.surface }} contentContainerStyle={{ padding: spacing.margin, gap: spacing.md, maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
      {blocked.length === 0 ? (
        <Card bg="surfaceContainerLow" shadow="none" padding="lg" style={{ alignItems: 'center', gap: spacing.md }}>
          <IconBadge icon="block" bg="surfaceContainerHigh" color="tertiary" size={56} iconSize={28} />
          <Text variant="headlineMd" center>
            No one blocked
          </Text>
          <Text color="tertiary" center>
            Block someone from their profile or your chat. They won’t be told.
          </Text>
        </Card>
      ) : (
        blocked.map((id) => {
          const p = social.profile(id);
          return (
            <Card key={id} padding="md" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              {p?.photos[0] ? <Image source={p.photos[0].source} style={{ width: 48, height: 48, borderRadius: 24 }} contentFit="cover" blurRadius={12} /> : <IconBadge icon="person_off" size={48} />}
              <Text variant="labelLg" style={{ flex: 1, fontFamily: fonts.sansBold }}>
                {p?.firstName ?? 'Someone'}
              </Text>
              <Button
                title="Unblock"
                variant="tonal"
                size="md"
                fullWidth={false}
                onPress={() => {
                  haptic.select();
                  social.unblock(id).catch(() => {});
                }}
              />
            </Card>
          );
        })
      )}
      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}
