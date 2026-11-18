import { Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius, spacing, type } from '@/theme';
import { Icon } from './icon';
import { Text } from './text';

/** Pill switch from the designs (48×28, teal when on). */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      hitSlop={8}
      style={{
        width: 48,
        height: 28,
        borderRadius: radius.full,
        padding: 4,
        backgroundColor: value ? colors.primary : colors.outlineVariant,
        alignItems: value ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.onPrimary, boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} />
    </Pressable>
  );
}

export function Checkbox({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minHeight: 44 }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: radius.xs,
          borderWidth: value ? 0 : 1.5,
          borderColor: colors.outline,
          backgroundColor: value ? colors.primary : colors.surfaceContainer,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {value ? <Icon name="check" size={16} color="onPrimary" /> : null}
      </View>
      <Text variant="labelMd" style={{ flex: 1 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Radio indicator used on the intent cards: filled terracotta check when selected. */
export function RadioMark({ selected }: { selected: boolean }) {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: selected ? colors.secondary : colors.surfaceContainerHighest,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {selected ? <Icon name="check" size={18} color="onSecondary" /> : null}
    </View>
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
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: props.multiline ? radius.md : radius.full,
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
