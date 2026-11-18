import { View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Enter, Icon, Text } from '@/components';
import { INSTITUTIONS, LANGUAGES } from '@/constants/ghana';
import { computeSharedGround } from '@/features/discover/shared-ground';
import { useMyProfile } from '@/features/me';
import { useSocial } from '@/features/social/social-store';
import { colors, fonts, maxContentWidth, shadows, spacing } from '@/theme';

/** The match moment: rare and earned, so it gets the delight budget. */
export default function MatchMoment() {
  const insets = useSafeAreaInsets();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const social = useSocial();
  const me = useMyProfile();
  const match = social.state.matches[matchId];
  const them = social.profile(match?.profileId);

  if (!them) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}>
        <Button title="Back" variant="tonal" fullWidth={false} onPress={() => router.back()} />
      </View>
    );
  }

  const shared = computeSharedGround(me, them);
  const common = [
    ...shared.institutions.map((id) => INSTITUTIONS.find((i) => i.id === id)?.label ?? id),
    ...shared.languages.map((id) => `${LANGUAGES.find((l) => l.id === id)?.label}`),
    ...(shared.sameNeighborhood ? [them.neighborhood!] : []),
  ].slice(0, 3);

  const photo = (source: string | number | undefined, tilt: string, ring: string) => (
    <View style={{ width: 132, height: 168, borderRadius: 24, borderWidth: 4, borderColor: ring, overflow: 'hidden', transform: [{ rotate: tilt }], boxShadow: shadows.xl, backgroundColor: colors.inverseSurface }}>
      <Image source={source} contentFit="cover" style={{ flex: 1 }} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary, paddingTop: insets.top + spacing.xl, paddingBottom: Math.max(insets.bottom, spacing.lg), paddingHorizontal: spacing.lg }}>
      <View style={{ flex: 1, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Enter index={0}>{photo(me.photos[0]?.source, '-6deg', colors.surfaceContainerLowest)}</Enter>
          <Enter index={2} style={{ marginLeft: -28, marginTop: 36 }}>
            {photo(them.photos[0]?.source, '7deg', colors.primaryFixed)}
          </Enter>
        </View>
        <Enter index={3} style={{ alignItems: 'center', gap: spacing.sm }}>
          <Icon name="favorite" size={28} color="primaryFixed" />
          <Text variant="headlineXl" color="onPrimary" center accessibilityRole="header" style={{ fontSize: 38, lineHeight: 44 }}>
            It’s a match
          </Text>
          <Text color="primaryFixedDim" center style={{ maxWidth: 300 }}>
            You and {them.firstName} both want something {them.intent === 'marriage' ? 'that lasts' : 'real'}. Start with warmth.
          </Text>
        </Enter>
        {common.length ? (
          <Enter index={4} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' }}>
            {common.map((c) => (
              <View key={c} style={{ paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)' }}>
                <Text variant="labelMd" color="onPrimary" style={{ fontFamily: fonts.sansSemiBold }}>
                  {c}
                </Text>
              </View>
            ))}
          </Enter>
        ) : null}
      </View>
      <Enter index={5} style={{ gap: spacing.sm, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
        <Button title="Send a voice note" iconLeft="mic" variant="tonal" haptics="light" onPress={() => router.replace(`/chat/${matchId}`)} />
        <Button title="Keep exploring" variant="strong" haptics="none" onPress={() => router.back()} style={{ backgroundColor: 'transparent' }} />
      </Enter>
    </View>
  );
}
