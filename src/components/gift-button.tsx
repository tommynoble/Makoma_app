import { View } from 'react-native';
import { giftLockHint, giftUnlockSteps } from '@/features/gifts/unlock';
import { spacing } from '@/theme';
import type { GiftUnlock } from '@/types/domain';
import { IconButton } from './button';
import { Card, IconBadge, ProgressDots } from './surface';
import { Text } from './text';

/** Banner at the top of a chat showing progress towards unlocking treats. */
export function TreatUnlockBanner({ unlock }: { unlock: GiftUnlock }) {
  return (
    <Card bg={unlock.unlocked ? 'primaryFixed' : 'surfaceContainerHigh'} rounded="lg" shadow="none" style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <IconBadge icon={unlock.unlocked ? 'lock_open' : 'lock'} size={40} iconSize={20} bg={unlock.unlocked ? 'primary' : 'secondaryContainer'} color={unlock.unlocked ? 'onPrimary' : 'onSecondaryContainer'} />
      <View style={{ flex: 1 }}>
        <Text variant="labelLg">{unlock.unlocked ? 'Treats unlocked' : 'Treat tray unlocking'}</Text>
        <Text variant="labelMd" color="tertiary">
          {unlock.unlocked ? 'You can now send a treat.' : giftLockHint(unlock)}
        </Text>
      </View>
      <ProgressDots total={unlock.voiceNotesRequired} current={giftUnlockSteps(unlock)} />
    </Card>
  );
}

/**
 * Treat button for the chat composer. Locked until the voice-note milestone;
 * tapping while locked only explains what is left. There is deliberately no
 * way to request a treat.
 */
export function GiftButton({ unlock, onPress, onLockedPress }: { unlock: GiftUnlock; onPress: () => void; onLockedPress: (hint: string) => void }) {
  return (
    <IconButton
      icon={unlock.unlocked ? 'redeem' : 'lock'}
      label={unlock.unlocked ? 'Send a treat' : `Treats locked. ${giftLockHint(unlock)}`}
      size={48}
      bg={unlock.unlocked ? 'secondaryFixed' : 'surfaceContainerHigh'}
      color={unlock.unlocked ? 'secondary' : 'tertiaryContainer'}
      onPress={() => (unlock.unlocked ? onPress() : onLockedPress(giftLockHint(unlock)))}
    />
  );
}
