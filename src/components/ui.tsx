/**
 * Minimal, unstyled-ish primitives. These are scaffolding only. They will be
 * restyled (or replaced) once the designs arrive, so keep screen-level styling
 * out of the screens and in here.
 */
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, type } from '@/theme/tokens';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {scroll ? <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView> : children}
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={[type.title, { color: colors.text, marginBottom: spacing.sm }]}>{children}</Text>;
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[type.body, { color: muted ? colors.textMuted : colors.text }]}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: primary ? colors.primary : colors.surface, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[type.body, { color: primary ? colors.primaryText : colors.text, fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
}

export function Choice({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.choice, selected && { borderColor: colors.primary, borderWidth: 2 }]}
    >
      <Text style={[type.body, { color: colors.text, fontWeight: '600' }]}>{label}</Text>
      {description ? <Text style={[type.caption, { color: colors.textMuted }]}>{description}</Text> : null}
    </Pressable>
  );
}

export function Chip({ label, style }: { label: string; style?: ViewStyle }) {
  return (
    <View style={[styles.chip, style]}>
      <Text style={[type.caption, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

export function VerifiedBadge() {
  return <Chip label="✓ Verified" style={{ backgroundColor: colors.verified }} />;
}

export const Gap = ({ size = spacing.md }: { size?: number }) => <View style={{ height: size }} />;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  button: { paddingVertical: 14, paddingHorizontal: spacing.lg, borderRadius: radius.pill, alignItems: 'center' },
  choice: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
  },
});
