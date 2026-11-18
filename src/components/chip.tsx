import { Pressable } from 'react-native';
import { haptic } from '@/lib/motion';
import { colors, fonts, radius, spacing } from '@/theme';
import { Text } from './text';

/** Multi-select chip (checkbox semantics). Selected = terracotta fill. */
export function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      onPress={() => {
        haptic.select();
        onPress();
      }}
      style={{ minHeight: 40, paddingHorizontal: spacing.md, justifyContent: 'center', borderRadius: radius.full, backgroundColor: on ? colors.secondary : colors.surfaceContainerHigh }}
    >
      <Text variant="labelMd" color={on ? 'onSecondary' : 'onSurface'} style={{ fontFamily: fonts.sansSemiBold }}>
        {label}
      </Text>
    </Pressable>
  );
}

