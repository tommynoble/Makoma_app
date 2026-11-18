import type { ReactNode } from 'react';
import { View } from 'react-native';
import { colors, fonts, spacing } from '@/theme';
import type { ColorName } from '@/theme';
import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { IconBadge } from './surface';
import { Text } from './text';

/**
 * A settings / menu row: icon badge, title, optional subtitle, and either a
 * chevron (tappable) or a trailing control (e.g. a Toggle).
 */
export function ListRow({
  icon,
  title,
  body,
  onPress,
  trailing,
  tone = 'default',
  last,
}: {
  icon: IconName;
  title: string;
  body?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  tone?: 'default' | 'danger';
  last?: boolean;
}) {
  const danger = tone === 'danger';
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.hairline }}>
      <IconBadge icon={icon} size={40} iconSize={20} bg={danger ? 'errorContainer' : 'surfaceContainerHigh'} color={(danger ? 'error' : 'primary') as ColorName} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="labelLg" color={danger ? 'error' : 'onSurface'} style={{ fontFamily: fonts.sansBold }}>
          {title}
        </Text>
        {body ? (
          <Text variant="labelMd" color="tertiary" style={{ fontFamily: fonts.sansMedium }}>
            {body}
          </Text>
        ) : null}
      </View>
      {trailing ?? (onPress ? <Icon name="chevron_right" size={20} color="tertiary" /> : null)}
    </View>
  );
  if (!onPress) return content;
  return (
    <PressableScale scaleTo={0.98} onPress={onPress} accessibilityRole="button" accessibilityLabel={body ? `${title}. ${body}` : title}>
      {content}
    </PressableScale>
  );
}
