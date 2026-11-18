import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing, type ColorName } from '@/theme';
import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

/** Rounded surface the designs build everything from. Content goes in as children. */
export function Card({
  children,
  bg = 'surfaceContainerLowest',
  rounded = 'lg',
  padding = 'lg',
  shadow = 'sm',
  onPress,
  accessibilityLabel,
  accessibilityRole = 'button',
  selected,
  style,
}: {
  children: ReactNode;
  bg?: ColorName;
  rounded?: keyof typeof radius;
  padding?: keyof typeof spacing | 'none';
  shadow?: keyof typeof shadows | 'none';
  onPress?: () => void;
  accessibilityLabel?: string;
  /** 'radio' for one-of-many option cards (announced as a radio button with checked state). */
  accessibilityRole?: 'button' | 'radio';
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const base: ViewStyle = {
    backgroundColor: colors[bg],
    // A fine edge so cards read clearly against the sand canvas.
    ...(bg === 'surfaceContainerLowest' || bg === 'surfaceContainerLow' ? { borderWidth: 1, borderColor: colors.hairline } : null),
    borderRadius: radius[rounded],
    borderCurve: 'continuous',
    padding: padding === 'none' ? 0 : spacing[padding],
    boxShadow: shadow === 'none' ? undefined : shadows[shadow],
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <PressableScale
      scaleTo={0.98}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected === undefined ? undefined : accessibilityRole === 'radio' ? { checked: selected } : { selected }}
      onPress={onPress}
      style={[base, style]}
    >
      {children}
    </PressableScale>
  );
}

/** Small rounded label: eyebrow tags ("OUR PLEDGE"), identity pills, status badges. */
export function Pill({
  label,
  icon,
  iconFilled,
  dot,
  bg = 'surfaceContainerHigh',
  color = 'onSurfaceVariant',
  iconColor,
  size = 'sm',
  uppercase,
  style,
}: {
  label: string;
  icon?: IconName;
  iconFilled?: boolean;
  dot?: ColorName;
  bg?: ColorName | string;
  color?: ColorName;
  iconColor?: ColorName;
  size?: 'sm' | 'md';
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: size === 'md' ? 6 : 4,
          borderRadius: radius.full,
          backgroundColor: bg in colors ? colors[bg as ColorName] : bg,
        },
        style,
      ]}
    >
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors[dot] }} /> : null}
      {icon ? <Icon name={icon} size={16} color={iconColor ?? color} filled={iconFilled} /> : null}
      <Text variant={size === 'md' ? 'labelMd' : 'labelSm'} color={color} uppercase={uppercase}>
        {label}
      </Text>
    </View>
  );
}

/** Round tinted container for an icon, used as a leading visual in rows and cards. */
export function IconBadge({
  icon,
  size = 48,
  iconSize = 24,
  bg = 'primaryFixed',
  color = 'onPrimaryContainer',
  rounded = 'full',
  filled,
}: {
  icon: IconName;
  size?: number;
  iconSize?: number;
  bg?: ColorName;
  color?: ColorName;
  rounded?: keyof typeof radius;
  filled?: boolean;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius[rounded],
        borderCurve: 'continuous',
        backgroundColor: colors[bg],
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon name={icon} size={iconSize} color={color} filled={filled} />
    </View>
  );
}

/** Segmented progress bar from the onboarding designs: thin pill dashes. */
export function ProgressSegments({ total, current }: { total: number; current: number }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${current} of ${total}`}
      accessibilityValue={{ min: 0, max: total, now: current }}
      style={{ flexDirection: 'row', gap: spacing.xs }}
    >
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: i < current ? colors.primaryContainer : colors.surfaceContainerHighest,
          }}
        />
      ))}
    </View>
  );
}

/** Dots used for small milestones, e.g. "2 of 3 voice notes exchanged". */
export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={`${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            borderWidth: i < current ? 0 : 1.5,
            borderColor: colors.outlineVariant,
            backgroundColor: i < current ? colors.primary : colors.transparent,
          }}
        />
      ))}
    </View>
  );
}
