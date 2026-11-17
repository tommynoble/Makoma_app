import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { router } from 'expo-router';
import { Button, Card, Heading, Icon, IconButton, Pill, Screen, Text, Waveform } from '@/components';
import { useOnboarding } from '@/features/onboarding/onboarding-context';
import { useVoiceRecorder, VOICE_INTRO_MAX_MS } from '@/features/voice/use-voice-recorder';
import { colors, fonts, radius, spacing } from '@/theme';

const SUGGESTIONS = [
  'Greet your match like it’s Friday evening and share your favourite Accra or Kumasi hangout.',
  'Describe your dream Sunday morning breakfast and who you’re sharing it with.',
  'Teach a two-word phrase in your language and what it means to you.',
];

const clock = (ms: number) => `0:${String(Math.floor(ms / 1000)).padStart(2, '0')}`;

/** A short voice intro lets people hear warmth, accent and humour before matching. */
export default function Voice() {
  const { draft, update } = useOnboarding();
  const rec = useVoiceRecorder(VOICE_INTRO_MAX_MS);
  const [suggestion, setSuggestion] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const clip = draft.voiceIntro;
  const player = useAudioPlayer(clip?.uri ?? null);
  const playback = useAudioPlayerStatus(player);

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

  const start = async () => {
    setElapsed(0);
    update({ voiceIntro: undefined });
    await rec.start();
  };
  const stop = async () => {
    const result = await rec.stop();
    if (result) update({ voiceIntro: result, voicePromptText: SUGGESTIONS[suggestion] });
  };
  const togglePlay = () => {
    if (playback.playing) return player.pause();
    if (playback.didJustFinish || playback.currentTime >= playback.duration) player.seekTo(0);
    player.play();
  };

  const shownMs = rec.isRecording ? elapsed : clip ? (playback.playing ? playback.currentTime * 1000 : clip.durationMs) : 0;
  const progress = rec.isRecording ? elapsed / VOICE_INTRO_MAX_MS : clip && playback.duration ? playback.currentTime / playback.duration : clip ? 1 : 0;
  const state = rec.isRecording ? 'recording' : clip ? 'ready' : 'idle';

  return (
    <Screen
      step={6}
      footer={
        <>
          <Button title="Finish & Enter Discover" icon="arrow_forward" onPress={() => router.replace('/discover')} />
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: spacing.sm }}>
            <Icon name="lock" size={16} color="tertiary" />
            <Text variant="labelSm" color="tertiary" center style={{ flexShrink: 1 }}>
              {clip ? 'You can re-record your voice intro anytime in your profile.' : 'Optional, but profiles with a voice feel far more human.'}
            </Text>
          </View>
        </>
      }
    >
      <Heading
        eyebrow={<Pill label="Voice Intro" dot="primary" uppercase />}
        title="Let them hear your warmth."
        subtitle="Profiles with voice notes feel immediate and human. Record up to 20 seconds, in any language you like."
      />

      <Card bg="surfaceContainerLow" padding="none" style={{ overflow: 'hidden', flexDirection: 'row' }}>
        <View style={{ width: 6, backgroundColor: colors.secondaryContainer }} />
        <View style={{ flex: 1, padding: spacing.md, gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="lightbulb" size={16} color="secondary" />
              <Text variant="labelSm" color="secondary" uppercase>
                Prompt Suggestion
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Show another suggestion"
              hitSlop={12}
              onPress={() => setSuggestion((s) => (s + 1) % SUGGESTIONS.length)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
            >
              <Icon name="shuffle" size={15} color="tertiary" />
              <Text variant="labelSm" color="tertiary">
                Swap
              </Text>
            </Pressable>
          </View>
          <Text variant="headlineMd" italic>
            “{SUGGESTIONS[suggestion]}”
          </Text>
        </View>
      </Card>

      <Card rounded="xl" padding="lg" shadow="md" style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pill
            size="md"
            label={state === 'recording' ? 'Recording…' : state === 'ready' ? 'Ready to preview' : 'Tap the mic to start'}
            icon={state === 'ready' ? 'check_circle' : state === 'recording' ? 'graphic_eq' : 'mic'}
            iconColor="primary"
            bg="primaryFixed"
            color="onPrimaryFixed"
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surfaceContainer, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: state === 'recording' ? colors.error : colors.secondary }} />
            <Text variant="labelMd" style={{ fontFamily: fonts.sansSemiBold, fontVariant: ['tabular-nums'] }}>
              {clock(shownMs)} / {clock(VOICE_INTRO_MAX_MS)}
            </Text>
          </View>
        </View>

        <View style={{ height: 112, backgroundColor: colors.surfaceContainerLow, borderRadius: radius.lg, borderCurve: 'continuous', padding: spacing.md, flexDirection: 'row', alignItems: 'center' }}>
          <Waveform seed={clip?.uri ?? SUGGESTIONS[suggestion]} progress={progress} height={80} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {clip && !rec.isRecording ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Re-record audio" hitSlop={10} onPress={start} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}>
              <Icon name="refresh" size={18} color="tertiary" />
              <Text variant="labelMd" color="tertiary">
                Re-record audio
              </Text>
            </Pressable>
          ) : (
            <Text variant="labelMd" color="tertiary" style={{ flex: 1 }}>
              {rec.isRecording ? 'Tap stop when you are done.' : 'Speak naturally. One take is fine.'}
            </Text>
          )}
          {state === 'ready' ? (
            <IconButton icon={playback.playing ? 'pause' : 'play_arrow'} label={playback.playing ? 'Pause preview' : 'Play preview'} filled size={56} iconSize={32} bg="secondaryContainer" color="onSecondaryContainer" onPress={togglePlay} />
          ) : (
            <IconButton icon={rec.isRecording ? 'stop' : 'mic'} label={rec.isRecording ? 'Stop recording' : 'Start recording'} filled size={56} iconSize={30} bg={rec.isRecording ? 'error' : 'secondary'} color="onSecondary" onPress={rec.isRecording ? stop : start} />
          )}
        </View>
        {rec.error ? (
          <Text variant="labelMd" color="error" selectable>
            {rec.error}
          </Text>
        ) : null}
      </Card>
    </Screen>
  );
}
