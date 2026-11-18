import { ScrollView, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, IconButton, Pill, Text } from '@/components';
import { HeroPhotoCard, PhotoCard, SharedGroundCard, TextPromptCard, ValuesCard, VoicePromptCard } from '@/components/profile/sections';
import { promptById } from '@/constants/prompts';
import { useMyProfile } from '@/features/me';
import { toCard } from '@/features/mock-data';
import { useSocial } from '@/features/social/social-store';
import { haptic } from '@/lib/motion';
import { colors, maxContentWidth, shadows, spacing } from '@/theme';

/** A person's full profile (from Likes or Matches), with the right actions for where you stand. */
export default function Person() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const social = useSocial();
  const me = useMyProfile();
  const p = social.profile(id);
  if (!p) return null;
  const card = toCard(p, me);
  const match = Object.values(social.state.matches).find((m) => m.profileId === p.id);
  const iLiked = !!social.state.liked[p.id];
  const openPhotos = (index: number) => router.push({ pathname: '/photos', params: { profileId: p.id, index: String(index) } });
  const reply = (params: { kind: 'voice' | 'prompt' | 'photo'; promptId?: string }) => router.push({ pathname: '/reply', params: { profileId: p.id, ...params } });

  const likeBack = async (rose = false) => {
    let matchId: string | null;
    try {
      matchId = await social.like(p.id, { rose });
    } catch {
      return;
    }
    if (matchId) {
      haptic.success();
      router.replace(`/match/${matchId}`);
    } else {
      haptic.light();
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Stack.Screen options={{ title: p.firstName }} />
      <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 120 }}>
        <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', paddingHorizontal: spacing.margin, gap: spacing.lg }}>
          {p.likesYou && !match ? (
            <Card rounded="card" bg="surfaceContainerLow" shadow="none" style={{ gap: spacing.sm }}>
              <Pill label={p.likesYou.rose ? `${p.firstName} sent you a rose` : `${p.firstName} likes you`} icon={p.likesYou.rose ? 'eco' : 'favorite'} iconColor="secondary" color="onSecondaryFixed" bg="secondaryFixed" size="md" />
              {p.likesYou.promptId ? (
                <Text variant="labelMd" color="tertiary">
                  On “{promptById(p.likesYou.promptId)?.text}”
                </Text>
              ) : null}
              {p.likesYou.comment ? (
                <Text italic style={{ fontSize: 18, lineHeight: 27 }}>
                  “{p.likesYou.comment}”
                </Text>
              ) : null}
            </Card>
          ) : null}
          <HeroPhotoCard profile={p} onLike={() => reply({ kind: 'photo' })} onOpenPhotos={() => openPhotos(0)} />
          <SharedGroundCard profile={p} shared={card.shared} />
          {p.voicePrompt ? <VoicePromptCard profile={p} voice={p.voicePrompt} onLike={() => reply({ kind: 'voice' })} /> : null}
          {p.prompts[0] ? <TextPromptCard prompt={p.prompts[0]} onLike={() => reply({ kind: 'prompt', promptId: p.prompts[0].promptId })} /> : null}
          {p.photos[1] ? <PhotoCard photo={p.photos[1]} firstName={p.firstName} onLike={() => reply({ kind: 'photo' })} onOpen={() => openPhotos(1)} /> : null}
          {p.prompts.slice(1).map((pr) => (
            <TextPromptCard key={pr.promptId} prompt={pr} onLike={() => reply({ kind: 'prompt', promptId: pr.promptId })} />
          ))}
          <ValuesCard profile={p} />
        </View>
      </ScrollView>
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, spacing.md), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, paddingHorizontal: spacing.lg }}>
        {match ? (
          <Button title={`Message ${p.firstName}`} iconLeft="forum" onPress={() => router.push(`/chat/${match.id}`)} style={{ flex: 1, maxWidth: 360 }} />
        ) : iLiked ? (
          <Pill label="You liked this profile" icon="favorite" iconColor="primary" color="primary" size="md" style={{ alignSelf: 'center', boxShadow: shadows.md }} />
        ) : (
          <>
            <IconButton
              icon="close"
              label={`Pass on ${p.firstName}`}
              size={56}
              iconSize={28}
              bg="surfaceContainerLowest"
              color="onSurfaceVariant"
              shadow={shadows.xl}
              onPress={() => {
                haptic.light();
                social.pass(p.id).catch(() => {});
                router.back();
              }}
            />
            <Button title={p.likesYou ? 'Like back' : 'Like'} iconLeft="favorite" iconFilled haptics="none" fullWidth={false} onPress={() => likeBack()} />
          </>
        )}
      </View>
    </View>
  );
}
