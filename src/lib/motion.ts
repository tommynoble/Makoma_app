/**
 * Motion and haptics, following Expo's animation guidance:
 * - Reanimated on the UI thread, transform + opacity only.
 * - Strong ease-out for anything entering; springs only when a finger drives it.
 * - Short: press 120ms, small state changes 160-200ms, entrances 300ms.
 * - Reduced motion respected on every entrance (ReduceMotion.System).
 * - One haptic per user action, always paired with a visual change.
 */
import * as Haptics from 'expo-haptics';
import { cubicBezier, Easing, FadeInDown, FadeOutDown, ReduceMotion } from 'react-native-reanimated';

/** For Reanimated CSS transitions / animations. */
export const CSS_EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);
/** For withTiming / layout animation builders. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export const durations = { press: 120, state: 180, enter: 300, exit: 240 } as const;

// Layout-animation builders live at module scope (Reanimated recommendation).
// Used only where an exit animation is needed; mount entrances use <Enter>.
/** Toasts and small trays: enter from below, leave the same way, a little faster. */
export const TOAST_IN = FadeInDown.duration(durations.enter).easing(EASE_OUT).reduceMotion(ReduceMotion.System);
export const TOAST_OUT = FadeOutDown.duration(durations.exit).easing(EASE_OUT).reduceMotion(ReduceMotion.System);

const native = process.env.EXPO_OS !== 'web';
const safe = (p: () => Promise<void>) => {
  if (!native) return;
  p().catch(() => {});
};

/** Haptics are optional feedback: silent on web and when the device has them off. */
export const haptic = {
  /** A choice changed: radio, chip, toggle, checkbox. */
  select: () => safe(() => Haptics.selectionAsync()),
  /** A light commit: like, pass, send. */
  light: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** A weightier commit: sending a rose. */
  medium: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Something succeeded: treats unlocked, selfie sent. */
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
