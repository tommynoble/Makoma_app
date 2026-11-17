import { View } from 'react-native';
import { colors, type ColorName } from '@/theme';

/** Deterministic bar heights so a clip looks the same every time it renders. */
function bars(seed: string, count: number): number[] {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return Array.from({ length: count }, (_, i) => {
    h = (h * 1664525 + 1013904223 + i) >>> 0;
    return 0.25 + ((h >>> 8) % 100) / 133; // 0.25..1
  });
}

/**
 * Voice-note waveform. Played bars use `playedColor`, the rest are muted.
 * TODO: draw from real audio levels once recordings are metered.
 */
export function Waveform({
  seed,
  progress = 0,
  count = 28,
  height = 40,
  playedColor = 'primaryContainer',
  restColor = 'outlineVariant',
}: {
  seed: string;
  progress?: number;
  count?: number;
  height?: number;
  playedColor?: ColorName;
  restColor?: ColorName;
}) {
  const played = Math.round(progress * count);
  return (
    <View aria-hidden style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height }}>
      {bars(seed, count).map((b, i) => (
        <View
          key={i}
          style={{ width: 4, borderRadius: 2, height: Math.max(4, b * height), backgroundColor: colors[i < played ? playedColor : restColor] }}
        />
      ))}
    </View>
  );
}
