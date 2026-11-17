import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, IconButton, Pill, Text, Wordmark } from '@/components';
import { HeroPhotoCard, PhotoCard, SharedGroundCard, TextPromptCard, ValuesCard, VoicePromptCard } from '@/components/profile/sections';
import { fetchDiscover, likeProfile, passProfile } from '@/features/api';
import { MOCK_ME } from '@/features/mock-data';
import { colors, maxContentWidth, shadows, spacing } from '@/theme';
import type { DiscoverCard, DiscoverFilters } from '@/types/domain';

const FILTERS: DiscoverFilters = { intents: ['marriage', 'serious', 'friendship_networking'], minAge: 21, maxAge: 45, verifiedOnly: false, languages: [], institutionIds: [] };

type Load = 'loading' | 'ready' | 'error';

/**
 * One profile at a time, read top to bottom like an editorial page. No
 * swiping: you like a specific photo or answer, pass, or send a rose.
 */
export default function Discover() {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [cards, setCards] = useState<DiscoverCard[]>([]);
  const [load, setLoad] = useState<Load>('loading');
  const [toast, setToast] = useState<string | null>(null);

  const refresh = () => {
    setLoad('loading');
    fetchDiscover(FILTERS)
      .then((c) => {
        setCards(c);
        setLoad('ready');
      })
      .catch(() => setLoad('error'));
  };
  useEffect(refresh, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const current = cards[0];
  const next = (message: string) => {
    setToast(message);
    setCards((c) => c.slice(1));
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const reply = (params: { kind: 'voice' | 'prompt' | 'photo'; promptId?: string }) =>
    current && router.push({ pathname: '/reply', params: { profileId: current.profile.id, ...params } });

  const onPass = () => {
    if (!current) return;
    passProfile(current.profile.id).catch(() => {});
    next(`Passed on ${current.profile.firstName}`);
  };
  const onLike = (rose = false) => {
    if (!current) return;
    likeProfile(current.profile.id, { rose }).catch(() => {});
    next(rose ? `Rose sent to ${current.profile.firstName}. They will see it first.` : `You liked ${current.profile.firstName}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ paddingTop: insets.top, backgroundColor: colors.surface, boxShadow: shadows.header, zIndex: 2 }}>
        <View style={{ height: 64, paddingHorizontal: spacing.margin, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
          <Wordmark />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <IconButton icon="tune" label="Filter preferences" iconSize={24} onPress={() => setToast('Filters are coming soon')} />
            <Image source={MOCK_ME.photos[0]?.source} style={{ width: 32, height: 32, borderRadius: 16 }} contentFit="cover" accessibilityLabel="Your profile" />
          </View>
        </View>
      </View>

      {load === 'loading' ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text color="tertiary">Finding people who want what you want…</Text>
        </View>
      ) : load === 'error' ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl }}>
          <Text variant="headlineMd" center>
            We couldn’t load profiles.
          </Text>
          <Text color="tertiary" center>
            Check your connection and try again.
          </Text>
          <Button title="Try again" icon="refresh" fullWidth={false} onPress={refresh} />
        </View>
      ) : !current ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl }}>
          <Icon name="spa" size={40} color="primaryContainer" />
          <Text variant="headlineMd" center>
            You’re all caught up.
          </Text>
          <Text color="tertiary" center>
            New people join every day. Take your time with the conversations you have.
          </Text>
          <Button title="Start over" variant="tonal" size="md" fullWidth={false} onPress={refresh} />
        </View>
      ) : (
        <>
          <ScrollView ref={scroll} contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 112 }}>
            <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', paddingHorizontal: spacing.margin, gap: spacing.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 }}>
                  <Icon name="location_on" size={18} color="primary" />
                  <Text variant="labelMd" numberOfLines={1}>
                    {current.profile.city} • {current.profile.neighborhood}
                  </Text>
                  {!current.profile.hideExactDistance && current.distanceKm != null ? (
                    <Text variant="labelSm" color="tertiary">
                      ({Math.round(current.distanceKm)} km)
                    </Text>
                  ) : null}
                </View>
                <Pill label={`${cards.length} to meet`} dot="primary" color="primary" uppercase />
              </View>

              <HeroPhotoCard profile={current.profile} onLike={() => reply({ kind: 'photo' })} />
              <SharedGroundCard profile={current.profile} shared={current.shared} />
              {current.profile.voicePrompt ? <VoicePromptCard profile={current.profile} voice={current.profile.voicePrompt} onLike={() => reply({ kind: 'voice' })} /> : null}
              {current.profile.prompts[0] ? <TextPromptCard prompt={current.profile.prompts[0]} onLike={() => reply({ kind: 'prompt', promptId: current.profile.prompts[0].promptId })} /> : null}
              {current.profile.photos[1] ? <PhotoCard photo={current.profile.photos[1]} firstName={current.profile.firstName} onLike={() => reply({ kind: 'photo' })} /> : null}
              {current.profile.prompts.slice(1).map((p) => (
                <TextPromptCard key={p.promptId} prompt={p} onLike={() => reply({ kind: 'prompt', promptId: p.promptId })} />
              ))}
              <ValuesCard profile={current.profile} />
            </View>
          </ScrollView>

          <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
            <IconButton icon="close" label={`Pass on ${current.profile.firstName}`} size={56} iconSize={28} bg="surfaceBright" color="onSurfaceVariant" shadow={shadows.xl} onPress={onPass} />
            <Button title="Send Rose" variant="warm" size="md" iconLeft="eco" fullWidth={false} onPress={() => onLike(true)} />
            <IconButton icon="favorite" label={`Like ${current.profile.firstName}`} filled size={56} iconSize={28} bg="primary" color="onPrimary" shadow={shadows.xl} onPress={() => onLike()} />
          </View>
        </>
      )}

      {toast ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 76, left: 0, right: 0, alignItems: 'center', zIndex: 3 }}>
          <View accessibilityLiveRegion="polite" style={{ backgroundColor: colors.inverseSurface, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, boxShadow: shadows.xl, maxWidth: '86%' }}>
            <Text variant="labelMd" color="inverseOnSurface" center>
              {toast}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
