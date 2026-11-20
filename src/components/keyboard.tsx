import type { ComponentProps } from 'react';
import { KeyboardAwareScrollView, KeyboardToolbar } from 'react-native-keyboard-controller';
import { colors } from '@/theme';

/**
 * Keyboard handling, one way everywhere (react-native-keyboard-controller,
 * included in Expo Go):
 * - FormScrollView scrolls the focused field above the keyboard on iOS and
 *   Android (Android is edge-to-edge, so the window no longer resizes).
 * - Hiding the keyboard is always easy: tap outside a field, swipe the
 *   content down, or press Done on the bar above the keyboard.
 */
export function FormScrollView({ bottomOffset = 80, ...props }: ComponentProps<typeof KeyboardAwareScrollView>) {
  return <KeyboardAwareScrollView bottomOffset={bottomOffset} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" {...props} />;
}

const theme = {
  light: { primary: colors.primary, disabled: colors.control, background: colors.surfaceContainerHigh, ripple: colors.hairline },
  dark: { primary: colors.primaryFixed, disabled: colors.control, background: colors.onSurface, ripple: colors.hairline },
};

/** Bar above the keyboard: previous / next field and Done (hides the keyboard). Native only. */
export function KeyboardDoneBar() {
  if (process.env.EXPO_OS === 'web') return null;
  return (
    <KeyboardToolbar theme={theme}>
      <KeyboardToolbar.Prev />
      <KeyboardToolbar.Next />
      <KeyboardToolbar.Done text="Done" />
    </KeyboardToolbar>
  );
}
