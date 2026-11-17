import { useEffect, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Body, Button, Chip } from '@/components/ui';
import { formatCedis, GIFT_OPTIONS } from '@/constants/ghana';
import { sendText, sendVoiceNote, startGift, subscribeToMessages } from '@/features/api';
import { useVoiceRecorder } from '@/features/voice/useVoiceRecorder';
import { isBackendConfigured } from '@/lib/supabase';
import { colors, radius, spacing } from '@/theme/tokens';
import type { Message } from '@/types/domain';

/** Chat with text, voice notes (hold to record) and MoMo appreciation gifts. */
export default function Chat() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [showGifts, setShowGifts] = useState(false);
  const rec = useVoiceRecorder();

  useEffect(() => {
    if (!isBackendConfigured || !matchId) return;
    return subscribeToMessages(matchId, (m) => setMessages((prev) => [...prev, m]));
  }, [matchId]);

  const onSend = async () => {
    if (!text.trim() || !isBackendConfigured) return;
    await sendText(matchId, text.trim());
    setText('');
  };

  const onVoiceRelease = async () => {
    const clip = await rec.stop();
    if (clip && isBackendConfigured) await sendVoiceNote(matchId, clip.uri, clip.durationMs);
  };

  const onGift = async (giftId: string) => {
    setShowGifts(false);
    if (!isBackendConfigured) return;
    const { authorizationUrl } = await startGift(matchId, giftId);
    await WebBrowser.openBrowserAsync(authorizationUrl); // Paystack checkout: MoMo prompt on the sender's phone
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        ListEmptyComponent={<Body muted>Start with a greeting. Ask how their day is going, or send a voice note.</Body>}
        renderItem={({ item }) =>
          item.kind === 'text' ? (
            <Body>{item.body}</Body>
          ) : item.kind === 'voice' ? (
            <Chip label={`🎙 Voice note · ${Math.round(item.durationMs / 1000)}s`} />
          ) : (
            <Chip label={`🎁 Gift · ${formatCedis(item.amountPesewas)}`} />
          )
        }
      />
      {showGifts ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.md }}>
          {GIFT_OPTIONS.map((g) => (
            <Button key={g.id} variant="secondary" label={`${g.emoji} ${g.label} ${formatCedis(g.amountPesewas)}`} onPress={() => onGift(g.id)} />
          ))}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.md, alignItems: 'center' }}>
        <Button label="🎁" variant="secondary" onPress={() => setShowGifts((s) => !s)} />
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
