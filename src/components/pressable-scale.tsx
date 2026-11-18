import { useState, type ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { CSS_EASE_OUT, durations } from '@/lib/motion';

/**
 * Press feedback for every tappable surface: a 3% scale-down on press-in,
 * released on press-out (120ms, strong ease-out). A Reanimated CSS transition,
 * so it runs on the UI thread; the state flips only twice per tap.
 */
export function PressableScale({
  children,
  style,
  containerStyle,
  scaleTo = 0.97,
  disabled,
  ...props
}: Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  /** Visual style (background, radius, padding...). */
  style?: StyleProp<ViewStyle>;
  /** Layout style for the touch target (flex, alignSelf, margins). */
  containerStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      {...props}
      disabled={disabled}
      pressRetentionOffset={16}
      onPressIn={(e) => {
        setPressed(true);
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        props.onPressOut?.(e);
      }}
      style={containerStyle}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: pressed && !disabled ? scaleTo : 1 }],
            transitionProperty: 'transform',
            transitionDuration: durations.press,
            transitionTimingFunction: CSS_EASE_OUT,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
