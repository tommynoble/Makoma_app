import { Pressable, StyleSheet, Text, View } from 'react-native';
import { giftLockHint, giftUnlockProgress } from '@/features/gifts/unlock';
import { colors, radius, spacing, type } from '@/theme/tokens';
import type { GiftUnlock } from '@/types/domain';

/**
 * Gift icon for the chat composer. Locked (with a subtle progress bar) until the
 * conversation reaches the milestone in features/gifts/unlock.ts. Tapping while
 * locked only shows the hint. Placeholder visuals: restyle with the designs.
 */
export function GiftButton({
  unlock,
  onPress,
  onLockedPress,
}: {
  unlock: GiftUnlock;
  onPress: () => void;
  onLockedPress: (hint: string) => void;
}) {
  const progress = giftUnlockProgress(unlock);
  const hint = giftLockHint(unlock);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unlock.unlocked ? 'Send a treat' : `Treats locked. ${hint}`}
      accessibilityState={{ disabled: !unlock.unlocked }}
      onPress={() => (unlock.unlocked ? onPress() : onLockedPress(hint))}
      style={[styles.button, !unlock.unlocked && styles.locked]}
    >
      <Text style={type.heading}>{unlock.unlocked ? '🎁' : '🔒'}</Text>
      {!unlock.unlocked ? (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locked: { opacity: 0.7 },
  track: {
    position: 'absolute',
    bottom: 6,
    left: spacing.sm + 2,
    right: spacing.sm + 2,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: { height: 3, backgroundColor: colors.primary },
});
