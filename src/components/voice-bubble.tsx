import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { colors } from '@/theme';
import { haptic } from '@/lib/motion';
import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';
import { Waveform } from './waveform';

const clock = (ms: number) => `0:${String(Math.round(ms / 1000)).padStart(2, '0')}`;

/**
 * A voice note player. Real recordings play through expo-audio; demo notes
 * with no file simulate playback so the control still responds.
 */
export function VoiceBubble({ id, uri, durationMs, mine }: { id: string; uri?: string; durationMs: number; mine: boolean }) {
  const player = useAudioPlayer(uri ? { uri } : null, { updateInterval: 100 });
  const status = useAudioPlayerStatus(player);
  const [fakeMs, setFakeMs] = useState<number | null>(null);

  useEffect(() => {
    if (fakeMs == null) return;
    const t = setTimeout(() => setFakeMs((v) => (v == null || v + 100 >= durationMs ? null : v + 100)), 100);
    return () => clearTimeout(t);
  }, [fakeMs, durationMs]);

  useEffect(() => {
    if (status.didJustFinish) player.seekTo(0);
  }, [status.didJustFinish, player]);

  const playing = uri ? status.playing : fakeMs != null;
  const posMs = uri ? status.currentTime * 1000 : (fakeMs ?? 0);
  const total = uri && status.duration ? status.duration * 1000 : durationMs;
  const progress = total ? Math.min(1, posMs / total) : 0;

  const toggle = async () => {
    haptic.select();
    if (!uri) return setFakeMs((v) => (v == null ? 0 : null));
    if (status.playing) return player.pause();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    player.play();
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 220 }}>
      <PressableScale
        scaleTo={0.9}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={`${playing ? 'Pause' : 'Play'} voice note, ${Math.round(durationMs / 1000)} seconds`}
        style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: mine ? colors.onPrimary : colors.secondary, alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name={playing ? 'pause' : 'play_arrow'} size={22} color={mine ? 'primary' : 'onSecondary'} filled />
      </PressableScale>
      <Waveform seed={id} count={18} height={28} progress={progress} playedColor={mine ? 'onPrimary' : 'secondary'} restColor={mine ? 'primaryFixedDim' : 'outlineVariant'} />
      <Text variant="labelSm" color={mine ? 'onPrimary' : 'onSurface'} style={{ fontVariant: ['tabular-nums'], minWidth: 30 }}>
        {playing ? clock(posMs) : clock(durationMs)}
      </Text>
    </View>
  );
}
