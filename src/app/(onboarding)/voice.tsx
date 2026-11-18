import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card, Heading, IconButton, Screen, Text, Waveform } from '@/components';
import { haptic } from '@/lib/motion';
import { useResolvedSources } from '@/features/backend/media';
import { useSaveProfile } from '@/features/backend/use-save-profile';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { useVoiceRecorder, VOICE_INTRO_MAX_MS } from '@/features/voice/use-voice-recorder';
import { colors, fonts, shadows, spacing } from '@/theme';

const SUGGESTIONS = [
  'Greet your match like it’s Friday evening and share your favourite local hangout.',
  'Describe your dream Sunday breakfast and who you’re sharing it with.',
  'Teach a two-word phrase in your language and what it means to you.',
];

const clock = (ms: number) => `0:${String(Math.floor(ms / 1000)).padStart(2, '0')}`;

/** A short voice intro lets people hear warmth, accent and humour. Optional. */
export default function Voice() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromProfile = from === 'profile';
  const { draft, update } = useOnboarding();
  const save = useSaveProfile();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Saves the whole profile (creates the account on the server at the end of onboarding).
  const finish = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      await save(fromProfile ? {} : { onboarded: true });
    } catch (e: any) {
      setSaving(false);
      if (!fromProfile) update({ onboarded: false });
      return setSaveError(e?.message ?? 'Couldn’t save your profile. Check your connection and try again.');
    }
    setSaving(false);
    if (fromProfile) return router.back();
    haptic.success();
    router.replace('/discover');
  };
  const rec = useVoiceRecorder(VOICE_INTRO_MAX_MS);
  const [suggestion, setSuggestion] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const clip = draft.voiceIntro;
  const [clipUrl] = useResolvedSources(clip ? [clip.uri] : []);
  const player = useAudioPlayer(clipUrl || null);
  const playback = useAudioPlayerStatus(player);

  const start = async () => {
    setElapsed(0);
    update({ voiceIntro: undefined });
    await rec.start();
  };
  const stop = async () => {
    const result = await rec.stop();
    if (result) update({ voiceIntro: result, voicePromptText: SUGGESTIONS[suggestion] });
  };

  // Count up while recording and stop automatically at the limit.
  useEffect(() => {
    if (!rec.isRecording) return;
    const started = Date.now();
    const t = setInterval(() => {
      const ms = Date.now() - started;
      setElapsed(ms);
      if (ms >= VOICE_INTRO_MAX_MS) stop();
    }, 200);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec.isRecording]);

  const togglePlay = () => {
    if (playback.playing) return player.pause();
    if (playback.didJustFinish || playback.currentTime >= playback.duration) player.seekTo(0);
    player.play();
  };

  const shownMs = rec.isRecording ? elapsed : clip ? (playback.playing ? playback.currentTime * 1000 : clip.durationMs) : 0;
  const progress = rec.isRecording ? elapsed / VOICE_INTRO_MAX_MS : clip && playback.duration ? playback.currentTime / playback.duration : clip ? 1 : 0;
  const link = { fontFamily: fonts.sansBold, fontSize: 14, textDecorationLine: 'underline' } as const;

  return (
    <Screen
      step={fromProfile ? undefined : 5}
      footer={
        <>
          {saveError ? (
            <Text variant="labelMd" color="error" center accessibilityLiveRegion="polite">
              {saveError}
            </Text>
          ) : null}
          <Button title={saving ? 'Saving your profile…' : fromProfile ? 'Done' : 'Finish & Enter Discover'} disabled={saving} onPress={finish} />
          {!clip && !fromProfile ? <Button title="Skip for now" variant="tonal" size="md" disabled={saving} onPress={finish} /> : null}
        </>
      }
    >
      <Heading title={'Let them hear\nyour warmth.'} subtitle="Up to 20 seconds, in any language you like. You can do this later from your profile." />

      <Card rounded="card" padding="lg" shadow="none" bg="surfaceContainerLow" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
        <Text variant="bodyLg" italic style={{ flex: 1, fontSize: 18, lineHeight: 28 }}>
          “{SUGGESTIONS[suggestion]}”
        </Text>
        <IconButton icon="refresh" label="Show another suggestion" size={40} iconSize={20} bg="surfaceContainerLowest" shadow={shadows.sm} onPress={() => setSuggestion((s) => (s + 1) % SUGGESTIONS.length)} />
      </Card>

      <Card rounded="card" padding="lg" shadow="warm" style={{ alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xl, borderWidth: 1, borderColor: colors.hairline }}>
        <View style={{ height: 64, width: '80%', flexDirection: 'row', alignItems: 'center' }}>
          <Waveform seed={clip?.uri ?? SUGGESTIONS[suggestion]} progress={progress} height={64} count={18} barWidth={5} playedColor="primary" restColor="outlineVariant" />
        </View>
        <Text style={{ fontFamily: fonts.sansBold, fontSize: 24, lineHeight: 30, color: colors.onSurface, fontVariant: ['tabular-nums'] }}>
          {clock(shownMs)} / {clock(VOICE_INTRO_MAX_MS)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
          {clip && !rec.isRecording ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Re-record" hitSlop={12} onPress={start}>
              <Text color="secondary" style={link}>
                Re-record
              </Text>
            </Pressable>
          ) : (
            <View style={{ width: 72 }} />
          )}
          {clip && !rec.isRecording ? (
            <IconButton icon={playback.playing ? 'pause' : 'play_arrow'} label={playback.playing ? 'Pause' : 'Play your recording'} size={64} iconSize={36} bg="primary" color="onPrimary" shadow={shadows.lg} onPress={togglePlay} />
          ) : (
            <IconButton icon={rec.isRecording ? 'stop' : 'mic'} label={rec.isRecording ? 'Stop recording' : 'Start recording'} size={64} iconSize={32} bg={rec.isRecording ? 'secondary' : 'primary'} color="onPrimary" shadow={shadows.lg} onPress={rec.isRecording ? stop : start} />
          )}
          <Text color="tertiary" style={{ width: 72, fontFamily: fonts.sansSemiBold, fontSize: 13 }}>
            {rec.isRecording ? 'Recording…' : clip ? 'Saved' : 'Tap to start'}
          </Text>
        </View>
        {rec.error ? (
          <Text variant="labelMd" color="error" center selectable>
            {rec.error}
          </Text>
        ) : null}
      </Card>
    </Screen>
  );
}
