import { useState } from 'react';
import { FlatList, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton, Text } from '@/components';
import { ageOf } from '@/components/profile/sections';
import { useMyProfile } from '@/features/me';
import { mockProfileById } from '@/features/mock-data';
import { CSS_EASE_OUT, durations } from '@/lib/motion';
import { colors, fonts, radius, spacing } from '@/theme';

/**
 * Full-screen photo viewer, opened by tapping a profile's photo.
 * Presented as a native modal (swipe down to close on iOS, back on Android).
 * Horizontal paging; the index updates only when a swipe settles.
 */
export default function Photos() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { profileId, index: start } = useLocalSearchParams<{ profileId: string; index?: string }>();
  // TODO: load from the backend when configured.
  const me = useMyProfile();
  const profile = profileId === 'me' ? me : mockProfileById(profileId);
  const photos = profile?.photos ?? [];
  const [index, setIndex] = useState(Math.min(Number(start ?? 0) || 0, Math.max(photos.length - 1, 0)));

  const onSettle = (e: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  const photoHeight = Math.min(height * 0.68, width * (4 / 3));
  const caption = photos[index]?.caption;

  return (
    <View style={{ flex: 1, backgroundColor: colors.onSurface }}>
      <View style={{ paddingTop: Math.max(insets.top, spacing.md), paddingHorizontal: spacing.margin, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text variant="headlineMd" color="surfaceContainerLowest" accessibilityRole="header">
            {profile ? `${profile.firstName}${profileId === 'me' ? '' : `, ${ageOf(profile.birthDate)}`}` : 'Photos'}
          </Text>
          <Text variant="labelMd" color="surfaceContainerHigh" style={{ fontFamily: fonts.sansMedium }}>
            {photos.length ? `${index + 1} of ${photos.length}` : 'No photos yet'}
          </Text>
        </View>
        <IconButton icon="close" label="Close photos" bg="inverseSurface" color="surfaceContainerLowest" onPress={() => router.back()} />
      </View>

      <FlatList
        data={photos}
        keyExtractor={(p) => p.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={index}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={onSettle}
        onScrollEndDrag={process.env.EXPO_OS === 'web' ? onSettle : undefined}
        renderItem={({ item }) => (
          <View style={{ width, height: photoHeight, paddingHorizontal: spacing.md }}>
            <Image
              source={item.source}
              contentFit="cover"
              transition={200}
              accessibilityLabel={item.caption ?? `Photo of ${profile?.firstName ?? 'this person'}`}
              style={{ flex: 1, borderRadius: radius.lg, borderCurve: 'continuous', backgroundColor: colors.inverseSurface }}
            />
          </View>
        )}
        style={{ flexGrow: 0 }}
      />

      <View style={{ flex: 1, alignItems: 'center', paddingTop: spacing.lg, paddingHorizontal: spacing.xl, gap: spacing.md }}>
        {photos.length > 1 ? (
          <View style={{ flexDirection: 'row', gap: 8 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {photos.map((p, i) => (
              <Animated.View
                key={p.id}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.surfaceContainerLowest,
                  opacity: i === index ? 1 : 0.35,
                  transform: [{ scale: i === index ? 1.25 : 1 }],
                  transitionProperty: ['opacity', 'transform'],
                  transitionDuration: durations.state,
                  transitionTimingFunction: CSS_EASE_OUT,
                }}
              />
            ))}
          </View>
        ) : null}
        {caption ? (
          <Text italic color="surfaceContainerLowest" center style={{ fontSize: 18, lineHeight: 27 }}>
            “{caption}”
          </Text>
        ) : null}
        {process.env.EXPO_OS === 'ios' ? (
          <Text variant="labelSm" color="surfaceContainerHighest" style={{ position: 'absolute', bottom: insets.bottom + spacing.md }}>
            Swipe down to close
          </Text>
        ) : null}
      </View>
    </View>
  );
}
