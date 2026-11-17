import { View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Card, Heading, Icon, Pill, Screen, Text, Waveform } from '@/components';
import { ageOf } from '@/components/profile/sections';
import { MOCK_CARDS } from '@/features/mock-data';
import { colors, spacing } from '@/theme';

// TODO: load matches and last messages from the `matches` table. Demo data for now.
export default function Matches() {
  const akosua = MOCK_CARDS[0].profile;
  return (
    <Screen back={false} bottomInset={false}>
      <Heading title="Conversations" subtitle="Notes, voice exchanges & intentions" />
      <Pill label="1 conversation" dot="primary" color="primary" uppercase />
      <Card rounded="xl" shadow="md" padding="margin" onPress={() => router.push('/chat/demo')} accessibilityLabel={`Open conversation with ${akosua.firstName}`} style={{ flexDirection: 'row', gap: spacing.md }}>
        <View>
          <Image source={akosua.photos[0]?.source} style={{ width: 56, height: 56, borderRadius: 28 }} contentFit="cover" />
          <View style={{ position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.secondary, borderWidth: 2, borderColor: colors.surfaceContainerLowest }} />
        </View>
        <View style={{ flex: 1, gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="headlineMd">{akosua.firstName}</Text>
              <Text variant="labelMd" color="tertiary">
                {ageOf(akosua.birthDate)}
              </Text>
              <Icon name="verified" size={16} color="primary" />
            </View>
            <Text variant="labelSm" color="secondary">
              2m ago
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceContainerLow, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Icon name="play_arrow" size={20} color="secondary" filled />
            <Waveform seed="d3" count={16} height={22} />
            <Text variant="labelSm" color="secondary">
              0:19
            </Text>
          </View>
          <Text italic color="onSurfaceVariant" numberOfLines={2}>
            “Are you genuinely telling me East Legon has better kelewele than Osu? Be serious!”
          </Text>
        </View>
      </Card>
    </Screen>
  );
}
