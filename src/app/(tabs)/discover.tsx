import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Enter, Icon, IconButton, Pill, PressableScale, Skeleton, Text, Wordmark } from '@/components';
import { HeroPhotoCard, PhotoCard, SharedGroundCard, TextPromptCard, ValuesCard, VoicePromptCard } from '@/components/profile/sections';
import { useMyProfile } from '@/features/me';
import { toCard } from '@/features/mock-data';
import { profileCompletion } from '@/features/onboarding/completion';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { INSTITUTIONS, LANGUAGES } from '@/constants/ghana';
import { computeSharedGround, sharedGroundScore } from '@/features/discover/shared-ground';
import { DEFAULT_FILTERS, useSocial } from '@/features/social/social-store';
import type { SharedGround } from '@/types/domain';
import { haptic, TOAST_IN, TOAST_OUT } from '@/lib/motion';
import { alpha, colors, maxContentWidth, shadows, spacing } from '@/theme';

/**
 * One profile at a time, read top to bottom like an editorial page. No
 * swiping: like a specific photo or answer, pass, or send a rose.
 */
function sharedReason(s: SharedGround) {
  const bits: string[] = [];
  const school = s.institutions[0] ? INSTITUTIONS.find((i) => i.id === s.institutions[0])?.label : undefined;
  if (school) bits.push(`you both went to ${school}`);
  const lang = s.languages[0] ? LANGUAGES.find((l) => l.id === s.languages[0])?.label : undefined;
  if (lang) bits.push(`you both speak ${lang}`);
  if (s.sameChurch) bits.push('you share a church');
  if (s.sameNeighborhood) bits.push('you live in the same area');
  if (!bits.length && s.sameIntent) bits.push('you want the same thing');
  const text = bits.slice(0, 2).join(' and ');
  return text.charAt(0).toUpperCase() + text.slice(1) + '.';
}

export default function Discover() {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const social = useSocial();
  const me = useMyProfile();
  const { draft } = useOnboarding();
  const [toast, setToast] = useState<string | null>(null);
  const [warming, setWarming] = useState(true);

  // A short skeleton on first open (the real backend will take a moment).
  useEffect(() => {
    const t = setTimeout(() => setWarming(false), 450);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Server ranks the live deck; the demo deck is ranked here by shared ground.
  const deck = social.live ? social.deck : [...social.deck].sort((a, b) => sharedGroundScore(computeSharedGround(me, b)) - sharedGroundScore(computeSharedGround(me, a)));
  const current = deck[0] ? toCard(deck[0], me) : undefined;
  // Strong shared ground (beyond just the same intent) earns a "Today's pick" note.
  const topPick = current && sharedGroundScore(current.shared) >= 6 ? sharedReason(current.shared) : null;
  const completion = profileCompletion({ ...draft, firstName: me.firstName, intent: me.intent }).percent;
  const filtersOn = JSON.stringify(social.state.filters) !== JSON.stringify(DEFAULT_FILTERS);

  const reply = (params: { kind: 'voice' | 'prompt' | 'photo'; promptId?: string }) =>
    current && router.push({ pathname: '/reply', params: { profileId: current.profile.id, ...params } });
  const openPhotos = (index: number) => current && router.push({ pathname: '/photos', params: { profileId: current.profile.id, index: String(index) } });

  const advance = (message?: string) => {
    if (message) setToast(message);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };
  const onPass = () => {
    if (!current) return;
    haptic.light();
    social.pass(current.profile.id).catch(() => setToast('Couldn’t save that. Check your connection.'));
    advance(`Passed on ${current.profile.firstName}`);
  };
  const onLike = async (rose = false) => {
    if (!current) return;
    const name = current.profile.firstName;
    let matchId: string | null;
    try {
      matchId = await social.like(current.profile.id, { rose });
    } catch {
      return setToast('Couldn’t send that like. Check your connection.');
    }
    if (matchId) haptic.success();
    else if (rose) haptic.medium();
    else haptic.light();
    if (matchId) {
      advance();
      router.push(`/match/${matchId}`);
    } else advance(rose ? `Rose sent to ${name}. They’ll see it first.` : `You liked ${name}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ paddingTop: insets.top, backgroundColor: colors.surface, boxShadow: shadows.header, zIndex: 2 }}>
        <View style={{ height: 64, paddingHorizontal: spacing.margin, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', maxWidth: maxContentWidth, width: '100%', alignSelf: 'center' }}>
          <Wordmark />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View>
              <IconButton icon="tune" label={filtersOn ? 'Filters (on)' : 'Filters'} iconSize={24} onPress={() => router.push('/filters')} />
              {filtersOn ? <View style={{ position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.secondary, borderWidth: 1.5, borderColor: colors.surface }} /> : null}
            </View>
            <PressableScale scaleTo={0.92} onPress={() => router.push('/profile')} accessibilityRole="button" accessibilityLabel="Your profile">
              <Image source={me.photos[0]?.source} style={{ width: 34, height: 34, borderRadius: 17 }} contentFit="cover" />
            </PressableScale>
          </View>
        </View>
      </View>

      {warming || (social.loading && !current) ? (
        <View accessibilityLabel="Loading profiles" style={{ flex: 1, paddingTop: spacing.md, paddingHorizontal: spacing.margin, gap: spacing.lg, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}>
          <Skeleton height={20} width="45%" />
          <Skeleton height={440} rounded="xl" />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Skeleton height={34} width={120} rounded="full" />
            <Skeleton height={34} width={150} rounded="full" />
          </View>
        </View>
      ) : !current ? (
        <Enter style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl }}>
          <Icon name="spa" size={44} color="primaryContainer" />
          <Text variant="headlineMd" center>
            {filtersOn ? 'No one matches these filters yet.' : 'You’re all caught up.'}
          </Text>
          <Text color="tertiary" center>
            {filtersOn ? 'Try widening your age range or languages.' : 'New people join every day. Take your time with the conversations you have.'}
          </Text>
          {filtersOn ? <Button title="Adjust filters" fullWidth={false} onPress={() => router.push('/filters')} /> : <Button title="Go to matches" variant="tonal" fullWidth={false} onPress={() => router.push('/matches')} />}
        </Enter>
      ) : (
        <>
          <ScrollView ref={scroll} contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 112 }}>
            <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', paddingHorizontal: spacing.margin, gap: spacing.lg }}>
              {completion < 100 ? (
                <Card
                  rounded="card"
                  padding="md"
                  shadow="none"
                  bg="surfaceContainerLow"
                  onPress={() => router.push('/profile')}
                  accessibilityLabel={`Your profile is ${completion} percent complete. Finish it.`}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
                >
                  <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15, color: colors.primary }}>{completion}%</Text>
                  <Text variant="labelMd" style={{ flex: 1, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                    Your profile is {completion}% complete. Add prompts and a voice intro.
                  </Text>
                  <Icon name="chevron_right" size={20} color="tertiary" />
                </Card>
              ) : null}
              {social.state.paused ? (
                <Card rounded="card" padding="md" shadow="none" bg="secondaryFixed" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <Icon name="pause_circle" size={22} color="secondary" />
                  <Text variant="labelMd" color="onSecondaryFixed" style={{ flex: 1, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                    Your profile is paused. You can browse, but no one new can see you.
                  </Text>
                  <Button title="Unpause" size="md" variant="tonal" fullWidth={false} onPress={() => social.setPaused(false).catch(() => {})} />
                </Card>
              ) : null}
              {topPick ? (
                <Enter key={`pick-${current.profile.id}`} variant="fade">
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: 16, backgroundColor: colors.primary }}>
                    <Icon name="auto_awesome" size={20} color="primaryFixed" />
                    <View style={{ flex: 1 }}>
                      <Text variant="labelSm" color="primaryFixed" uppercase>
                        Today’s pick for you
                      </Text>
                      <Text variant="labelMd" color="onPrimary" style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                        {topPick}
                      </Text>
                    </View>
                  </View>
                </Enter>
              ) : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 }}>
                  <Icon name="location_on" size={18} color="primary" />
                  <Text variant="labelMd" numberOfLines={1}>
                    {current.profile.city} • {current.profile.neighborhood}
                  </Text>
                </View>
                <Pill label={`${deck.length} to meet`} dot="primary" color="primary" bg={alpha(colors.primaryContainer, 0.2)} uppercase />
              </View>

              <Enter key={current.profile.id} variant="fade" style={{ gap: spacing.lg }}>
                <HeroPhotoCard profile={current.profile} onLike={() => reply({ kind: 'photo' })} onOpenPhotos={() => openPhotos(0)} />
                <SharedGroundCard profile={current.profile} shared={current.shared} />
                {current.profile.voicePrompt ? <VoicePromptCard profile={current.profile} voice={current.profile.voicePrompt} onLike={() => reply({ kind: 'voice' })} /> : null}
                {current.profile.prompts[0] ? <TextPromptCard prompt={current.profile.prompts[0]} onLike={() => reply({ kind: 'prompt', promptId: current.profile.prompts[0].promptId })} /> : null}
                {current.profile.photos[1] ? (
                  <PhotoCard photo={current.profile.photos[1]} firstName={current.profile.firstName} onLike={() => reply({ kind: 'photo' })} onOpen={() => openPhotos(1)} />
                ) : null}
                {current.profile.prompts.slice(1).map((p) => (
                  <TextPromptCard key={p.promptId} prompt={p} onLike={() => reply({ kind: 'prompt', promptId: p.promptId })} />
                ))}
                <ValuesCard profile={current.profile} />
              </Enter>
            </View>
          </ScrollView>

          <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
            <IconButton icon="close" label={`Pass on ${current.profile.firstName}`} size={56} iconSize={28} bg="surfaceContainerLowest" color="onSurfaceVariant" shadow={shadows.xl} onPress={onPass} />
            <Button title="Send Rose" variant="warm" size="md" iconLeft="eco" fullWidth={false} haptics="none" onPress={() => onLike(true)} />
            <IconButton icon="favorite" label={`Like ${current.profile.firstName}`} filled size={56} iconSize={28} bg="primary" color="onPrimary" shadow={shadows.xl} onPress={() => onLike()} />
          </View>
        </>
      )}

      <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 76, left: 0, right: 0, alignItems: 'center', zIndex: 3 }}>
        {toast ? (
          <Animated.View key={toast} entering={TOAST_IN} exiting={TOAST_OUT} accessibilityLiveRegion="polite" style={{ backgroundColor: colors.inverseSurface, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, boxShadow: shadows.xl, maxWidth: '86%' }}>
            <Text variant="labelMd" color="inverseOnSurface" center>
              {toast}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}
