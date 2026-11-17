import { Text, type StyleProp, type TextStyle } from 'react-native';
import { colors, type ColorName } from '@/theme';
import { glyphs, type IconName } from './icon-glyphs';

export type { IconName };

/**
 * Material Symbols Rounded icon (the Superdesign style), on every platform.
 * Filled by default; pass `filled={false}` for the outlined style (used for
 * heart buttons and inactive tabs). Decorative: put the accessibility label
 * on the pressable that wraps it.
 */
export function Icon({
  name,
  size = 24,
  color = 'onSurface',
  filled = true,
  style,
}: {
  name: IconName;
  size?: number;
  color?: ColorName;
  filled?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      aria-hidden
      allowFontScaling={false}
      style={[
        {
          fontFamily: filled ? 'MaterialSymbolsRounded_400Regular_Filled' : 'MaterialSymbolsRounded_400Regular',
          fontSize: size,
          lineHeight: size,
          width: size,
          height: size,
          color: colors[color],
        },
        style,
      ]}
    >
      {String.fromCharCode(glyphs[name])}
    </Text>
  );
}
