import { View, type DimensionValue } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { colors, radius } from '@/theme';

const PULSE = {
  '0%': { opacity: 0.55 },
  '50%': { opacity: 1 },
  '100%': { opacity: 0.55 },
} as const;

/** Placeholder block shown while content loads. Pulses gently; static when Reduce Motion is on. */
export function Skeleton({ width = '100%', height, rounded = 'md' }: { width?: DimensionValue; height: number; rounded?: keyof typeof radius }) {
  const reduced = useReducedMotion();
  const base = { width, height, borderRadius: radius[rounded], backgroundColor: colors.surfaceContainerHighest } as const;
  if (reduced) return <View style={base} />;
  return <Animated.View style={[base, { animationName: PULSE, animationDuration: 1400, animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }]} />;
}
