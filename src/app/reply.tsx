import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Icon, IconButton, Pill, Text } from '@/components';
import { ageOf } from '@/components/profile/sections';
import { promptById } from '@/constants/prompts';
import { useSocial } from '@/features/social/social-store';
import { useVoiceRecorder, VOICE_REPLY_MAX_MS } from '@/features/voice/use-voice-recorder';
import { haptic } from '@/lib/motion';
import { alpha, colors, radius, spacing, type } from '@/theme';

const MAX_NOTE = 250;

/**
 * Bottom sheet for liking one specific thing on a profile, with an optional
 * written or voice reply. Presented as a native form sheet (see _layout).
 */
export default function Reply() {
  const insets = useSafeAreaInsets();
  const { profileId, kind, promptId } = useLocalSearchParams<{ profileId: string; kind: 'voice' | 'prompt' | 'photo'; promptId?: string }>();
  // TODO: load the profile from the backend when configured.
  const social = useSocial();
  const profile = social.profile(profileId);
  const [note, setNote] = useState('');
  const [rose, setRose] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceSecs, setVoiceSecs] = useState<number | null>(null);
  const rec = useVoiceRecorder(VOICE_REPLY_MAX_MS);

  if (!profile) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <Text color="tertiary">This profile is no longer available.</Text>
      </View>
    );
  }

  const answer = promptId ? profile.prompts.find((p) => p.promptId === promptId) : undefined;
  const title = kind === 'voice' ? 'Replying to voice prompt' : kind === 'prompt' ? 'Replying to prompt' : 'Liking photo';
  const quoteTitle = kind === 'voice' ? profile.voicePrompt?.promptText : answer ? promptById(answer.promptId)?.text : undefined;
  const quoteBody = kind === 'voice' ? profile.voicePrompt?.transcript : answer?.answer;

  const toggleVoice = async () => {
    if (rec.isRecording) {
      const clip = await rec.stop();
      // TODO: upload the clip and attach it to the like (likes.voice_reply_path).
      setVoiceSecs(clip ? Math.round(clip.durationMs / 1000) : null);
    } else {
      setVoiceSecs(null);
      await rec.start();
    }
  };

  const send = async (withNote: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const opts = { promptId, comment: withNote && note.trim() ? note.trim() : undefined, rose };
      const matchId = await social.like(profile.id, opts);
      if (matchId) {
        haptic.success();
        router.replace(`/match/${matchId}`);
      } else {
        if (rose) haptic.medium();
        else haptic.light();
        router.back();
      }
    } catch (e: any) {
      setError(e?.message ?? 'Could not send. Please try again.');
      setBusy(false);
    }
  };

  const hasReply = note.trim().length > 0 || voiceSecs != null;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.surfaceContainerLowest }}
      contentContainerStyle={{ paddingHorizontal: spacing.margin, paddingTop: spacing.lg, paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm, gap: spacing.lg }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: alpha(colors.surfaceContainerHighest, 0.8) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <View>
            <Image source={profile.photos[0]?.source} contentFit="cover" style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: alpha(colors.primaryContainer, 0.3) }} />
            {profile.verification === 'verified' ? (
              <View style={{ position: 'absolute', right: -4, bottom: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={12} color="onPrimary" />
              </View>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="labelSm" color="tertiary" uppercase>
              {title}
            </Text>
            <Text variant="headlineMd" accessibilityRole="header">
              {profile.firstName}, {ageOf(profile.birthDate)}
            </Text>
          </View>
        </View>
        <IconButton icon="close" label="Close" size={36} iconSize={18} bg="surfaceContainerHigh" onPress={() => router.back()} />
      </View>

      {quoteTitle ? (
        <View style={{ padding: spacing.md, gap: spacing.sm, borderRadius: radius.md, borderCurve: 'continuous', backgroundColor: colors.surfaceContainerHigh, borderWidth: 1, borderColor: alpha(colors.surfaceContainerHighest, 0.8) }}>
          {kind === 'voice' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Pill label="Voice Prompt" dot="primaryContainer" color="primary" bg="surfaceContainerLowest" uppercase />
              <Pill label={`0:${String(Math.round((profile.voicePrompt?.durationMs ?? 0) / 1000)).padStart(2, '0')}`} icon="play_arrow" iconFilled color="tertiary" bg="surfaceContainerLowest" />
            </View>
          ) : null}
          <Text variant="bodyMd" italic style={{ fontFamily: type.headlineMd.fontFamily }}>
            “{quoteTitle}”
          </Text>
          {quoteBody ? (
            <View style={{ borderLeftWidth: 2, borderLeftColor: colors.secondaryContainer, paddingLeft: 10 }}>
              <Text variant="labelMd" color="tertiary" numberOfLines={3} style={{ fontFamily: 'PlusJakartaSans_500Medium', lineHeight: 22 }}>
                “{quoteBody}”
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="labelMd">Your thoughtful note</Text>
          <Text variant="labelSm" color="tertiary" style={{ fontVariant: ['tabular-nums'] }}>
            {note.length} / {MAX_NOTE}
          </Text>
        </View>
        <View style={{ backgroundColor: colors.surfaceContainerLowest, borderRadius: radius.md, borderCurve: 'continuous', borderWidth: 1, borderColor: colors.surfaceContainerHighest, padding: spacing.md, gap: spacing.md }}>
          <TextInput
            accessibilityLabel="Your note"
            multiline
            maxLength={MAX_NOTE}
            value={note}
            onChangeText={setNote}
            placeholder={quoteBody ? 'Add a comment… ask about something specific they said.' : 'Add a comment… say what caught your eye.'}
            placeholderTextColor={colors.tertiaryContainer}
            style={{ ...type.bodyMd, color: colors.onSurface, minHeight: 72, textAlignVertical: 'top' }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.surfaceContainerHigh }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={rec.isRecording ? 'Stop recording voice reply' : 'Record a voice reply, up to 20 seconds'}
              onPress={toggleVoice}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12, borderRadius: radius.full, backgroundColor: colors.secondaryFixed, borderWidth: 1, borderColor: alpha(colors.secondaryContainer, 0.6) }}
            >
              <Icon name={rec.isRecording ? 'stop' : voiceSecs != null ? 'check' : 'mic'} size={16} color="secondary" filled />
              <Text variant="labelMd" color="onSecondaryContainer">
                {rec.isRecording ? 'Stop recording' : voiceSecs != null ? `Voice reply added (${voiceSecs}s)` : 'Record voice reply (20s)'}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: rose }} hitSlop={10} onPress={() => {
                haptic.select();
                setRose((r) => !r);
              }} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 36 }}>
              <Icon name="eco" size={16} color="secondary" filled={rose} />
              <Text variant="labelMd" color="secondary" style={{ textDecorationLine: rose ? 'none' : 'underline' }}>
                {rose ? 'Rose attached' : 'Attach Rose'}
              </Text>
            </Pressable>
          </View>
        </View>
        {rec.error ? (
          <Text variant="labelMd" color="error" selectable>
            {rec.error}
          </Text>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.surfaceContainerHigh }}>
        <Icon name="forum" size={18} color="tertiary" />
        <Text variant="labelMd" color="tertiary" style={{ flex: 1, fontFamily: 'PlusJakartaSans_500Medium' }}>
          A specific comment starts a far better conversation than a like on its own.
        </Text>
      </View>

      {error ? (
        <Text variant="labelMd" color="error" selectable>
          {error}
        </Text>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <Button title={hasReply ? 'Send Like & Comment' : 'Send Like'} haptics="none" icon="arrow_forward" loading={busy} onPress={() => send(true)} />
        {hasReply ? <Button title="Send like only" variant="tonal" size="md" haptics="none" disabled={busy} onPress={() => send(false)} /> : null}
      </View>
    </ScrollView>
  );
}
