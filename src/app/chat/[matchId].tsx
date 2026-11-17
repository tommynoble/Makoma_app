import { useEffect, useMemo, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Body, Button, Chip } from '@/components/ui';
import { GiftButton } from '@/components/GiftButton';
import { formatCedis } from '@/constants/ghana';
import {
  fetchGiftOffers,
  fetchGiftUnlock,
  sendText,
  sendVoiceNote,
  startGift,
  subscribeToMessages,
} from '@/features/api';
import { computeGiftUnlock } from '@/features/gifts/unlock';
import { useVoiceRecorder } from '@/features/voice/useVoiceRecorder';
import { isBackendConfigured } from '@/lib/supabase';
import { colors, radius, spacing } from '@/theme/tokens';
import type { GiftOffer, GiftUnlock, Message } from '@/types/domain';

// Mock mode: the match has already said hello, so the lock can be demoed by replying.
const MOCK_OPENING: Message[] = [
  { id: 'm0', matchId: 'demo', senderId: 'them', kind: 'text', body: 'Hi! How was your day?', createdAt: new Date().toISOString() },
];

type Local<T> = T extends Message ? Omit<T, 'id' | 'matchId' | 'senderId' | 'createdAt'> : never;
type NewLocalMessage = Local<Message>;

/**
 * Chat: text, voice notes and treats.
 * - Treats are partner vouchers (never cash) and stay locked until the
 *   conversation is real (see features/gifts/unlock.ts).
 * - By design there is no "request a gift" action anywhere.
 */
export default function Chat() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [messages, setMessages] = useState<Message[]>(isBackendConfigured ? [] : MOCK_OPENING);
  const [serverUnlock, setServerUnlock] = useState<GiftUnlock | null>(null);
  const [offers, setOffers] = useState<GiftOffer[]>([]);
  const [text, setText] = useState('');
  const [showTray, setShowTray] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const rec = useVoiceRecorder();

  useEffect(() => {
    fetchGiftOffers().then(setOffers).catch(() => setOffers([]));
    if (!isBackendConfigured || !matchId) return;
    fetchGiftUnlock(matchId).then(setServerUnlock).catch(() => {});
    return subscribeToMessages(matchId, (m) => {
      setMessages((prev) => [...prev, m]);
      fetchGiftUnlock(matchId).then(setServerUnlock).catch(() => {});
    });
  }, [matchId]);

  // Local count keeps the indicator responsive; the server decides at purchase time.
  const localUnlock = useMemo(() => computeGiftUnlock(messages), [messages]);
  const unlock = serverUnlock ?? localUnlock;

  const appendLocal = (m: NewLocalMessage) =>
    setMessages((prev) => [
      ...prev,
      { ...m, id: `local-${prev.length}`, matchId, senderId: 'me', createdAt: new Date().toISOString() } as Message,
    ]);

  const onSend = async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    if (isBackendConfigured) await sendText(matchId, body);
    else appendLocal({ kind: 'text', body });
  };

  const onVoiceRelease = async () => {
    const clip = await rec.stop();
    if (!clip) return;
    if (isBackendConfigured) await sendVoiceNote(matchId, clip.uri, clip.durationMs);
    else appendLocal({ kind: 'voice', audioUrl: clip.uri, durationMs: clip.durationMs });
  };

  const onTreat = async (offer: GiftOffer) => {
    setShowTray(false);
    if (!isBackendConfigured) {
      setNotice(`Demo: ${offer.label} voucher would be sent, redeemable at ${offer.partnerName}, ${offer.area}.`);
      return;
    }
    try {
      const { authorizationUrl } = await startGift(matchId, offer.id);
      await WebBrowser.openBrowserAsync(authorizationUrl); // Paystack MoMo checkout
    } catch (e: any) {
      setNotice(e?.message ?? 'Could not start payment');
    }
  };

  const offerById = (id: string) => offers.find((o) => o.id === id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        ListHeaderComponent={
          <Body muted>
            🛡 Makoma will never ask you for money, and no one should ask you to send gifts. Report anyone who does.
          </Body>
        }
        ListEmptyComponent={<Body muted>Start with a greeting. Ask how their day is going, or send a voice note.</Body>}
        renderItem={({ item }) =>
          item.kind === 'text' ? (
            <Body muted={item.senderId !== 'me'}>{item.body}</Body>
          ) : item.kind === 'voice' ? (
            <Chip label={`🎙 Voice note · ${Math.round(item.durationMs / 1000)}s`} />
          ) : (
            <Chip label={`${offerById(item.offerId)?.emoji ?? '🎁'} Sent a treat: ${offerById(item.offerId)?.label ?? 'voucher'}`} />
          )
        }
      />

      {notice ? (
        <View style={{ paddingHorizontal: spacing.md }}>
          <Body muted>{notice}</Body>
        </View>
      ) : null}

      {showTray ? (
        <View style={{ padding: spacing.md, gap: spacing.sm }}>
          <Body muted>Treat them to something. They get a voucher to redeem at a partner spot.</Body>
          {offers.map((o) => (
            <Button
              key={o.id}
              variant="secondary"
              label={`${o.emoji} ${o.label} · ${o.partnerName}, ${o.area} · ${formatCedis(o.pricePesewas)}`}
              onPress={() => onTreat(o)}
            />
          ))}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.md, alignItems: 'center' }}>
        <GiftButton
          unlock={unlock}
          onPress={() => {
            setNotice(null);
            setShowTray((s) => !s);
          }}
          onLockedPress={setNotice}
        />
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 10 }}
          placeholder="Message"
          value={text}
          onChangeText={setText}
        />
        {text.trim() ? (
          <Button label="Send" onPress={onSend} />
        ) : (
          <Button label={rec.isRecording ? '● Release' : '🎙 Hold'} onPress={rec.isRecording ? onVoiceRelease : rec.start} />
        )}
      </View>
    </View>
  );
}
