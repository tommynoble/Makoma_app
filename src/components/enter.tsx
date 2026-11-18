import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { CSS_EASE_OUT, durations } from '@/lib/motion';

// Mount-only entrances are Reanimated CSS keyframe animations (no state, no
// worklet). Fill mode "backwards" keeps the start frame during the delay.
const UP = {
  from: { opacity: 0, transform: [{ translateY: 12 }] },
  to: { opacity: 1, transform: [{ translateY: 0 }] },
} as const;
const FADE = { from: { opacity: 0 }, to: { opacity: 1 } } as const;

/**
 * Plays a short entrance once when mounted: rise-and-fade (default) or a
 * crossfade. `index` staggers siblings by 50ms. Off when Reduce Motion is on.
 */
export function Enter({
  children,
  index = 0,
  variant = 'up',
  style,
}: {
  children: ReactNode;
  index?: number;
  variant?: 'up' | 'fade';
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  return (
    <Animated.View
      style={[
        style,
        reduced
          ? null
          : {
              animationName: variant === 'up' ? UP : FADE,
              animationDuration: durations.enter,
              animationDelay: Math.min(index, 7) * 50,
              animationFillMode: 'backwards',
              animationTimingFunction: CSS_EASE_OUT,
            },
      ]}
    >
      {children}
    </Animated.View>
  );
}
