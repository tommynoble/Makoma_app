import { View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Card, Enter, Heading, Icon, IconBadge, Pill, Screen, Text } from '@/components';
import { ageOf } from '@/components/profile/sections';
import { promptById } from '@/constants/prompts';
import { incomingLikes } from '@/features/discover/deck';
import { useSocial } from '@/features/social/social-store';
import { colors, fonts, radius, spacing } from '@/theme';

const WHAT = { photo: 'Liked your photo', voice: 'Liked your voice intro', prompt: 'Liked your answer' } as const;

/** People who liked you, with what they liked and their note. Roses first. */
export default function Likes() {
  const social = useSocial();
  const likes = incomingLikes(social.state).sort((a, b) => Number(!!b.likesYou?.rose) - Number(!!a.likesYou?.rose));

  return (
    <Screen back={false} bottomInset={false}>
      <Heading title="Likes You" subtitle={likes.length ? `${likes.length} ${likes.length === 1 ? 'person is' : 'people are'} waiting. Take your time.` : 'When someone likes a photo or answer, it shows up here with their note.'} />
      {likes.length === 0 ? (
        <Card bg="surfaceContainerLow" rounded="xl" padding="lg" shadow="none" style={{ alignItems: 'center', gap: spacing.md }}>
          <IconBadge icon="favorite" bg="secondaryFixed" color="secondary" size={56} iconSize={28} />
          <Text variant="headlineMd" center>
            No new likes
          </Text>
          <Text color="tertiary" center>
            A complete profile with prompts and a voice intro gets more thoughtful likes.
          </Text>
        </Card>
      ) : (
        <View style={{ gap: spacing.md }}>
          {likes.map((p, i) => (
            <Enter key={p.id} index={i}>
              <Card rounded="card" padding="none" shadow="warm" onPress={() => router.push(`/person/${p.id}`)} accessibilityLabel={`${p.firstName}, ${WHAT[p.likesYou!.liked]}. Open profile.`} style={{ flexDirection: 'row', overflow: 'hidden', borderColor: p.likesYou?.rose ? colors.secondary : colors.hairline, borderWidth: p.likesYou?.rose ? 2 : 1 }}>
                <Image source={p.photos[0]?.source} contentFit="cover" style={{ width: 112, minHeight: 148, backgroundColor: colors.surfaceDim }} />
                <View style={{ flex: 1, padding: spacing.md, gap: spacing.xs }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                    <Text variant="headlineMd" style={{ fontSize: 20 }}>
                      {p.firstName}
                    </Text>
                    <Text variant="labelMd" color="tertiary">
                      {ageOf(p.birthDate)}
                    </Text>
                    {p.verification === 'verified' ? <Icon name="verified" size={16} color="primary" /> : null}
                  </View>
                  {p.likesYou?.rose ? <Pill label="Sent you a rose" icon="eco" iconColor="secondary" color="onSecondaryFixed" bg="secondaryFixed" /> : null}
                  <Text variant="labelMd" color="secondary" style={{ fontFamily: fonts.sansBold }}>
                    {WHAT[p.likesYou!.liked]}
                    {p.likesYou?.promptId ? `: “${promptById(p.likesYou.promptId)?.text}”` : ''}
                  </Text>
                  {p.likesYou?.comment ? (
                    <Text italic numberOfLines={3} style={{ fontSize: 16, lineHeight: 23 }}>
                      “{p.likesYou.comment}”
                    </Text>
                  ) : null}
                </View>
                <View style={{ justifyContent: 'center', paddingRight: spacing.sm }}>
                  <Icon name="chevron_right" size={22} color="tertiary" />
                </View>
              </Card>
            </Enter>
          ))}
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center', padding: spacing.md, borderRadius: radius.card, backgroundColor: colors.surfaceContainerLow }}>
            <Icon name="lock" size={18} color="tertiary" filled={false} />
            <Text variant="labelMd" color="tertiary" style={{ flex: 1, fontFamily: fonts.sansMedium }}>
              Only you can see who liked you. Liking back starts the conversation.
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
}
