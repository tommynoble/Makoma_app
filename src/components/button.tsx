import { ActivityIndicator, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, radius, shadows, spacing, type ColorName } from '@/theme';
import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { haptic } from '@/lib/motion';
import { Text } from './text';

const variants = {
  /** Default CTA in the designs: pastel teal pill. */
  primary: { bg: 'primaryContainer', fg: 'onPrimary', shadow: shadows.md },
  /** Strong CTA (deep teal), e.g. "Take Live Selfie". */
  strong: { bg: 'primary', fg: 'onPrimary', shadow: shadows.primaryGlow },
  /** Terracotta, for warm/emotional actions like "Send Rose". */
  warm: { bg: 'secondary', fg: 'onSecondary', shadow: shadows.lg },
  /** Quiet surface button. */
  tonal: { bg: 'surfaceContainerHigh', fg: 'onSurface', shadow: undefined },
} as const satisfies Record<string, { bg: ColorName; fg: ColorName; shadow?: string }>;

const sizes = {
  md: { height: 48, paddingHorizontal: spacing.margin },
  lg: { height: 56, paddingHorizontal: spacing.lg },
} as const;

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  iconLeft,
  iconFilled,
  disabled,
  loading,
  fullWidth = true,
  haptics,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Trailing icon (the designs use a trailing arrow). */
  icon?: IconName;
  iconLeft?: IconName;
  iconFilled?: boolean;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  /** Tactile tick on press. Defaults to light for filled buttons; pass 'none' when the action plays its own. */
  haptics?: 'light' | 'medium' | 'none';
  style?: StyleProp<ViewStyle>;
}) {
  const v = variants[variant];
  const feel = haptics ?? (variant === 'tonal' ? 'none' : 'light');
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      onPress={() => {
        if (feel !== 'none') haptic[feel]();
        onPress?.();
      }}
      containerStyle={[{ alignSelf: fullWidth ? 'stretch' : 'center' }, style]}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          borderRadius: radius.full,
          // Disabled: solid muted fill with readable text, not a faded colour.
          backgroundColor: disabled ? colors.surfaceContainerHighest : colors[v.bg],
          boxShadow: disabled ? undefined : v.shadow,
          ...sizes[size],
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[v.fg]} />
      ) : (
        <>
          {iconLeft ? <Icon name={iconLeft} size={22} color={disabled ? 'tertiary' : v.fg} filled={iconFilled} /> : null}
          <Text variant="labelLg" color={disabled ? 'tertiary' : v.fg} style={{ fontFamily: fonts.sansBold }}>
            {title}
          </Text>
          {icon ? <Icon name={icon} size={18} color={disabled ? 'tertiary' : v.fg} filled={iconFilled} /> : null}
        </>
      )}
    </PressableScale>
  );
}

/** Round icon-only button. Always needs a label for screen readers. */
export function IconButton({
  icon,
  label,
  onPress,
  size = 44,
  iconSize = 22,
  bg = 'transparent',
  color = 'onSurface',
  filled,
  shadow,
  style,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  bg?: ColorName;
  color?: ColorName;
  filled?: boolean;
  shadow?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <PressableScale
      scaleTo={0.92}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={size < 44 ? (44 - size) / 2 : 0}
      containerStyle={style}
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors[bg],
          boxShadow: shadow,
        },
      ]}
    >
      <Icon name={icon} size={iconSize} color={color} filled={filled} />
    </PressableScale>
  );
}
