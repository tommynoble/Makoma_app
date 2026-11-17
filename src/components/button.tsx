import { ActivityIndicator, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing, type ColorName } from '@/theme';
import { Icon, type IconName } from './icon';
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
  style?: StyleProp<ViewStyle>;
}) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          borderRadius: radius.full,
          backgroundColor: colors[v.bg],
          boxShadow: disabled ? undefined : v.shadow,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          alignSelf: fullWidth ? 'stretch' : 'center',
          ...sizes[size],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[v.fg]} />
      ) : (
        <>
          {iconLeft ? <Icon name={iconLeft} size={22} color={v.fg} filled={iconFilled} /> : null}
          <Text variant="labelLg" color={v.fg}>
            {title}
          </Text>
          {icon ? <Icon name={icon} size={18} color={v.fg} filled={iconFilled} /> : null}
        </>
      )}
    </Pressable>
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={size < 44 ? (44 - size) / 2 : 0}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors[bg],
          boxShadow: shadow,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
        style,
      ]}
    >
      <Icon name={icon} size={iconSize} color={color} filled={filled} />
    </Pressable>
  );
}
