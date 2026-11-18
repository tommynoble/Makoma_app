import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { FlatList, KeyboardAvoidingView, Pressable, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Enter, Icon, IconButton, PressableScale, Text, VoiceBubble } from '@/components';
import { GiftButton, TreatUnlockBanner } from '@/components/gift-button';
import { formatCedis } from '@/constants/ghana';
import { fetchGiftOffers, fetchGiftUnlock, sendText, sendVoiceNote, startGift, subscribeToMessages } from '@/features/api';
import { computeGiftUnlock } from '@/features/gifts/unlock';
import { mockProfileById } from '@/features/mock-data';
import { useSocial } from '@/features/social/social-store';
import { useVoiceRecorder } from '@/features/voice/use-voice-recorder';
import { haptic, TOAST_IN, TOAST_OUT } from '@/lib/motion';
import { isBackendConfigured } from '@/lib/supabase';
import { colors, radius, shadows, spacing, type } from '@/theme';
import type { GiftOffer, GiftUnlock, Message } from '@/types/domain';

/**
 * Chat: text, voice notes and treats. Treats are partner vouchers (never
 * cash) and unlock after 3 voice notes are exchanged. By design there is no
 * "request a gift" action anywhere.
 */
export default function Chat() {
  const insets = useSafeAreaInsets();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const social = useSocial();
  const match = social.state.matches[matchId];
  // TODO: load the match's profile from the backend.
  const other = mockProfileById(match?.profileId ?? matchId?.replace(/^m-/, ''));
  const [remote, setRemote] = useState<Message[]>([]);
  const messages = useMemo(() => (isBackendConfigured ? remote : (social.state.messages[matchId] ?? [])), [remote, social.state.messages, matchId]);
  const typing = social.typingIn === matchId;
  const list = useRef<ComponentRef<typeof FlatList<Message>>>(null);
  const [serverUnlock, setServerUnlock] = useState<GiftUnlock | null>(null);
  const [offers, setOffers] = useState<GiftOffer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [showTray, setShowTray] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const rec = useVoiceRecorder();

  useEffect(() => {
    fetchGiftOffers().then(setOffers).catch(() => setOffers([]));
    if (!isBackendConfigured || !matchId) return;
    fetchGiftUnlock(matchId).then(setServerUnlock).catch(() => {});
    return subscribeToMessages(matchId, (m) => {
      setRemote((prev) => [...prev, m]);
      fetchGiftUnlock(matchId).then(setServerUnlock).catch(() => {});
    });
  }, [matchId]);

  // Local count keeps the indicator responsive; the server decides at purchase time.
  const localUnlock = useMemo(() => computeGiftUnlock(messages), [messages]);
  const unlock = serverUnlock ?? localUnlock;

  // The moment treats unlock is rare and earned: mark it with a success haptic.
  const wasUnlocked = useRef(unlock.unlocked);
  useEffect(() => {
    if (unlock.unlocked && !wasUnlocked.current) haptic.success();
    wasUnlocked.current = unlock.unlocked;
  }, [unlock.unlocked]);
  const offer = offers.find((o) => o.id === selected);

  useEffect(() => {
    const t = setTimeout(() => list.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages.length, typing]);

  if (!other) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.surface }}>
        <Text color="tertiary">This conversation is no longer available.</Text>
      </View>
    );
  }

  const onSend = async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    haptic.light();
    try {
      if (isBackendConfigured) await sendText(matchId, body);
      else social.send(matchId, { kind: 'text', body });
    } catch {
      setText(body);
      setNotice('Message not sent. Check your connection and try again.');
    }
  };

  const onVoice = async () => {
    if (!rec.isRecording) return rec.start();
    const clip = await rec.stop();
    if (!clip) return;
    haptic.light();
    try {
      if (isBackendConfigured) await sendVoiceNote(matchId, clip.uri, clip.durationMs);
      else social.send(matchId, { kind: 'voice', audioUrl: clip.uri, durationMs: clip.durationMs });
    } catch {
      setNotice('Voice note not sent. Check your connection and try again.');
    }
  };

  const onPay = async () => {
    if (!offer) return;
    haptic.medium();
    setShowTray(false);
    if (!isBackendConfigured) {
      haptic.success();
      social.send(matchId, { kind: 'gift', giftId: `g-${offer.id}-${messages.length}`, offerId: offer.id });
      setSelected(null);
      setNotice(`Demo payment done. ${other.firstName} gets a ${offer.label} voucher for ${offer.partnerName}, ${offer.area}. No cash changes hands.`);
      return;
    }
    try {
      const { authorizationUrl } = await startGift(matchId, offer.id);
      await WebBrowser.openBrowserAsync(authorizationUrl); // Paystack MoMo checkout
    } catch (e: any) {
      setNotice(e?.message ?? 'Could not start payment. Please try again.');
    }
  };

  const bubble = (mine: boolean) =>
    ({
      maxWidth: '82%',
      alignSelf: mine ? 'flex-end' : 'flex-start',
      backgroundColor: mine ? colors.primary : colors.surfaceContainerLowest,
      borderRadius: radius.lg,
      borderCurve: 'continuous',
      borderBottomRightRadius: mine ? radius.xs : radius.lg,
      borderBottomLeftRadius: mine ? radius.lg : radius.xs,
      paddingHorizontal: spacing.margin,
      paddingVertical: 12,
      boxShadow: shadows.sm,
    }) as const;

  return (
    <KeyboardAvoidingView behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={insets.top + 44} style={{ flex: 1, backgroundColor: colors.surface }}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <PressableScale onPress={() => router.push(`/person/${other.id}`)} accessibilityRole="button" accessibilityLabel={`View ${other.firstName}'s profile`} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Image source={other.photos[0]?.source} style={{ width: 36, height: 36, borderRadius: 18 }} contentFit="cover" />
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text variant="headlineMd" style={{ fontSize: 19, lineHeight: 24 }}>
                    {other.firstName}
                  </Text>
                  {other.verification === 'verified' ? <Icon name="verified" size={16} color="primary" /> : null}
                </View>
                <Text variant="labelSm" color="tertiary">
                  {other.neighborhood}, {other.city}
                </Text>
              </View>
            </PressableScale>
          ),
        }}
      />
      <FlatList
        ref={list}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.margin, gap: spacing.md }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            <Enter key={unlock.unlocked ? 'unlocked' : 'locked'} variant="fade">
              <TreatUnlockBanner unlock={unlock} />
            </Enter>
            <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', paddingHorizontal: spacing.xs }}>
              <Icon name="shield" size={16} color="tertiary" style={{ marginTop: 1 }} />
              <Text variant="labelSm" color="tertiary" style={{ flex: 1, fontFamily: 'PlusJakartaSans_500Medium', lineHeight: 16 }}>
                Makoma never asks you for money, and no one should ask you to send gifts. Report anyone who does.
              </Text>
            </View>
          </View>
        }
        ListFooterComponent={
          typing ? (
            <Enter variant="fade">
              <View accessibilityLabel={`${other.firstName} is typing`} style={[bubble(false), { flexDirection: 'row', gap: 5, paddingVertical: 16 }]}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.control, opacity: 0.5 + i * 0.25 }} />
                ))}
              </View>
            </Enter>
          ) : undefined
        }
        ListEmptyComponent={
          <Text color="tertiary" center>
            Start with a greeting. Ask how their day is going, or send a voice note.
          </Text>
        }
        renderItem={({ item }) => {
          const mine = item.senderId === 'me';
          const fg = mine ? 'onPrimary' : 'onSurface';
          if (item.kind === 'text') {
            return (
              <View style={bubble(mine)}>
                <Text color={fg} style={type.bodyMd}>
                  {item.body}
                </Text>
              </View>
            );
          }
          if (item.kind === 'voice') {
            return (
              <View style={bubble(mine)}>
                <VoiceBubble id={item.id} uri={item.audioUrl || undefined} durationMs={item.durationMs} mine={mine} />
              </View>
            );
          }
          const o = offers.find((x) => x.id === item.offerId);
          return (
            <View style={[bubble(mine), { backgroundColor: colors.secondaryFixed, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }]}>
              <Icon name="redeem" size={20} color="secondary" />
              <Text variant="labelMd" color="onSecondaryContainer">
                {mine ? 'You sent a treat' : 'Sent you a treat'}: {o?.label ?? 'voucher'}
              </Text>
            </View>
          );
        }}
      />

      {notice ? (
        <Animated.View entering={TOAST_IN} exiting={TOAST_OUT}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" onPress={() => setNotice(null)} style={{ marginHorizontal: spacing.margin, marginBottom: spacing.sm, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceContainerHigh }}>
          <Text variant="labelMd" color="onSurfaceVariant" selectable>
            {notice}
          </Text>
        </Pressable>
        </Animated.View>
      ) : null}

      {showTray ? (
        <Animated.View entering={TOAST_IN} exiting={TOAST_OUT}>
        <Card rounded="lg" shadow="xl" style={{ marginHorizontal: spacing.sm, marginBottom: spacing.sm, gap: spacing.md }}>
          <Text variant="labelSm" color="secondary" uppercase>
            Send a treat
          </Text>
          <Text variant="headlineMd">Treat {other.firstName} to something.</Text>
          <Text color="tertiary">They get a voucher to redeem at a partner spot. No cash is sent.</Text>
          <View accessibilityRole="radiogroup" style={{ gap: spacing.sm }}>
            {offers.map((o) => {
              const on = o.id === selected;
              return (
                <Pressable
                  key={o.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    if (!on) haptic.select();
                    setSelected(o.id);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 14,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.md,
                    borderCurve: 'continuous',
                    backgroundColor: on ? colors.secondaryFixed : colors.surfaceContainerHigh,
                    borderWidth: 1.5,
                    borderColor: on ? colors.secondary : colors.transparent,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="headlineMd" style={{ fontSize: 18, lineHeight: 24 }}>
                      {o.label}
                    </Text>
                    <Text variant="labelSm" color="tertiary">
                      {o.partnerName} · {o.area}
                    </Text>
                  </View>
                  <Text variant="labelLg" color={on ? 'onSecondaryContainer' : 'onSurface'}>
                    {formatCedis(o.pricePesewas)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Button title={offer ? `Pay ${formatCedis(offer.pricePesewas)} with MoMo` : 'Choose a treat'} haptics="none" disabled={!offer} onPress={onPay} />
          <Text variant="labelSm" color="tertiary" center style={{ fontFamily: 'PlusJakartaSans_500Medium' }}>
            Voucher valid for 30 days · Redeemable only at this partner
          </Text>
        </Card>
        </Animated.View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: Math.max(insets.bottom, spacing.sm), alignItems: 'center', backgroundColor: colors.surface, boxShadow: shadows.tabBar }}>
        <GiftButton
          unlock={unlock}
          onPress={() => {
            setNotice(null);
            setShowTray((s) => !s);
          }}
          onLockedPress={setNotice}
        />
        <TextInput
          accessibilityLabel="Message"
          style={{ ...type.bodyMd, flex: 1, color: colors.onSurface, backgroundColor: colors.surfaceContainerLow, borderRadius: radius.full, paddingHorizontal: spacing.margin, paddingVertical: 12, maxHeight: 120 }}
          placeholder={rec.isRecording ? 'Recording…' : 'Message'}
          placeholderTextColor={colors.tertiaryContainer}
          value={text}
          onChangeText={setText}
          multiline
        />
        {text.trim() ? (
          <IconButton icon="send" label="Send message" filled size={48} bg="primary" color="onPrimary" onPress={onSend} />
        ) : (
          <IconButton icon={rec.isRecording ? 'stop' : 'mic'} label={rec.isRecording ? 'Stop and send voice note' : 'Record a voice note'} filled size={48} bg={rec.isRecording ? 'error' : 'secondary'} color="onSecondary" onPress={onVoice} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
