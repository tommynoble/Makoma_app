import { ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Card, Enter, Heading, Icon, IconBadge, PressableScale, Screen, Text } from '@/components';
import { formatCedis } from '@/constants/ghana';
import { MOCK_GIFT_OFFERS, mockProfileById } from '@/features/mock-data';
import { lastMessage, useSocial } from '@/features/social/social-store';
import { colors, fonts, spacing } from '@/theme';
import type { Message } from '@/types/domain';

function preview(m: Message | undefined, name: string) {
  if (!m) return { text: `Say hello to ${name}. Ask about their day, or send a voice note.`, italic: false };
  const who = m.senderId === 'me' ? 'You: ' : '';
  if (m.kind === 'text') return { text: `${who}${m.body}`, italic: m.senderId !== 'me' };
  if (m.kind === 'voice') return { text: `${who}Voice note · 0:${String(Math.round(m.durationMs / 1000)).padStart(2, '0')}`, italic: false };
  const o = MOCK_GIFT_OFFERS.find((x) => x.id === m.offerId);
  return { text: `${who}Sent a treat${o ? ` · ${o.label} (${formatCedis(o.pricePesewas)})` : ''}`, italic: false };
}

function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / 1440)}d`;
}

/** New matches up top, then conversations sorted by the latest message. */
export default function Matches() {
  const { state } = useSocial();
  const matches = Object.values(state.matches)
    .map((m) => ({ ...m, profile: mockProfileById(m.profileId)!, last: lastMessage(state, m.id) }))
    .filter((m) => m.profile)
    .sort((a, b) => ((b.last?.createdAt ?? b.createdAt) > (a.last?.createdAt ?? a.createdAt) ? 1 : -1));

  return (
    <Screen back={false} bottomInset={false}>
      <Heading title="Conversations" subtitle="Notes, voice exchanges & intentions" />
      {matches.length === 0 ? (
        <Card bg="surfaceContainerLow" rounded="xl" padding="lg" shadow="none" style={{ alignItems: 'center', gap: spacing.md }}>
          <IconBadge icon="forum" bg="primaryFixed" color="primary" size={56} iconSize={28} />
          <Text variant="headlineMd" center>
            No matches yet
          </Text>
          <Text color="tertiary" center>
            Like a specific answer or photo on Discover. When it’s mutual, your conversation starts here.
          </Text>
        </Card>
      ) : (
        <>
          <View style={{ gap: spacing.sm }}>
            <Text variant="labelSm" color="tertiary" uppercase>
              Your matches
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.xs }}>
              {matches.map((m) => (
                <PressableScale key={m.id} scaleTo={0.94} onPress={() => router.push(`/person/${m.profile.id}`)} accessibilityRole="button" accessibilityLabel={`${m.profile.firstName}'s profile`} style={{ alignItems: 'center', gap: 6, width: 72 }}>
                  <Image source={m.profile.photos[0]?.source} contentFit="cover" style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2.5, borderColor: m.last ? colors.surfaceContainerLowest : colors.secondary }} />
                  <Text variant="labelMd" numberOfLines={1}>
                    {m.profile.firstName}
                  </Text>
                </PressableScale>
              ))}
            </ScrollView>
          </View>
          <View style={{ gap: spacing.md }}>
            {matches.map((m, i) => {
              const pv = preview(m.last, m.profile.firstName);
              const unread = m.last?.senderId === 'them';
              return (
                <Enter key={m.id} index={i}>
                  <Card rounded="card" padding="margin" shadow="warm" onPress={() => router.push(`/chat/${m.id}`)} accessibilityLabel={`Conversation with ${m.profile.firstName}${unread ? ', new message' : ''}`} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                    <View>
                      <Image source={m.profile.photos[0]?.source} style={{ width: 56, height: 56, borderRadius: 28 }} contentFit="cover" />
                      {unread ? <View style={{ position: 'absolute', top: 0, right: 0, width: 13, height: 13, borderRadius: 7, backgroundColor: colors.secondary, borderWidth: 2, borderColor: colors.surfaceContainerLowest }} /> : null}
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text variant="headlineMd" style={{ fontSize: 19, lineHeight: 24 }}>
                            {m.profile.firstName}
                          </Text>
                          {m.profile.verification === 'verified' ? <Icon name="verified" size={15} color="primary" /> : null}
                        </View>
                        <Text variant="labelSm" color={unread ? 'secondary' : 'tertiary'}>
                          {timeAgo(m.last?.createdAt ?? m.createdAt)}
                        </Text>
                      </View>
                      <Text italic={pv.italic} numberOfLines={2} color={unread ? 'onSurface' : 'tertiary'} style={{ fontSize: 15, lineHeight: 21, fontFamily: unread && !pv.italic ? fonts.sansSemiBold : undefined }}>
                        {pv.text}
                      </Text>
                    </View>
                  </Card>
                </Enter>
              );
            })}
          </View>
        </>
      )}
    </Screen>
  );
}
