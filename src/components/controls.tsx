import { Pressable, TextInput, type TextInputProps } from 'react-native';
import Animated, { type CSSTransitionProperties, type CSSTransitionProperty } from 'react-native-reanimated';
import { CSS_EASE_OUT, durations, haptic } from '@/lib/motion';
import { colors, fonts, radius, spacing, type } from '@/theme';
import { Icon } from './icon';
import { Text } from './text';

const stateTransition = (props: CSSTransitionProperty): CSSTransitionProperties => ({
  transitionProperty: props,
  transitionDuration: durations.state,
  transitionTimingFunction: CSS_EASE_OUT,
});

/** Pill switch (48x28). The knob slides and the track colour crossfades; a haptic tick on change. */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => {
        haptic.select();
        onChange(!value);
      }}
      hitSlop={8}
    >
      <Animated.View
        style={[
          { width: 48, height: 28, borderRadius: radius.full, padding: 4, justifyContent: 'center', backgroundColor: value ? colors.primary : colors.control },
          stateTransition(['backgroundColor']),
        ]}
      >
        <Animated.View
          style={[
            { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.onPrimary, boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transform: [{ translateX: value ? 20 : 0 }] },
            stateTransition(['transform']),
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

/** Animated check mark: scales in from 60% with a fade, never from zero. */
function CheckGlyph({ on, size, color }: { on: boolean; size: number; color: 'onPrimary' | 'onSecondary' }) {
  return (
    <Animated.View style={[{ opacity: on ? 1 : 0, transform: [{ scale: on ? 1 : 0.6 }] }, stateTransition(['opacity', 'transform'])]}>
      <Icon name="check" size={size} color={color} />
    </Animated.View>
  );
}

export function Checkbox({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={() => {
        haptic.select();
        onChange(!value);
      }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minHeight: 44 }}
    >
      <Animated.View
        style={[
          {
            width: 22,
            height: 22,
            borderRadius: radius.xs,
            borderWidth: 2,
            borderColor: value ? colors.primary : colors.control,
            backgroundColor: value ? colors.primary : colors.surfaceContainerLowest,
            alignItems: 'center',
            justifyContent: 'center',
          },
          stateTransition(['backgroundColor', 'borderColor']),
        ]}
      >
        <CheckGlyph on={value} size={16} color="onPrimary" />
      </Animated.View>
      <Text variant="labelMd" style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Radio indicator: a 3:1 ring when off; fills terracotta and pops a check when selected. */
export function RadioMark({ selected }: { selected: boolean }) {
  return (
    <Animated.View
      style={[
        {
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: selected ? colors.secondary : colors.control,
          backgroundColor: selected ? colors.secondary : colors.surfaceContainerLowest,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        },
        stateTransition(['backgroundColor', 'borderColor']),
      ]}
    >
      <CheckGlyph on={selected} size={18} color="onSecondary" />
    </Animated.View>
  );
}

/** Soft-fill text field. `serif` uses the reading font for user-written answers. */
export function Field({ serif, style, ...props }: TextInputProps & { serif?: boolean }) {
  return (
    <TextInput
      placeholderTextColor={colors.tertiaryContainer}
      style={[
        serif ? type.bodyMd : { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 24 },
        {
          color: colors.onSurface,
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: colors.hairline,
          borderRadius: radius.md,
          borderCurve: 'continuous',
          paddingHorizontal: spacing.margin,
          paddingVertical: 14,
          minHeight: props.multiline ? 96 : 52,
          textAlignVertical: props.multiline ? 'top' : 'center',
        },
        style,
      ]}
      {...props}
    />
  );
}

/** Shows/hides a small indicator (e.g. a selected-card check) with the same scale+fade as the radio. */
export function Pop({ on, children }: { on: boolean; children: React.ReactNode }) {
  return <Animated.View style={[{ opacity: on ? 1 : 0, transform: [{ scale: on ? 1 : 0.6 }] }, stateTransition(['opacity', 'transform'])]}>{children}</Animated.View>;
}
