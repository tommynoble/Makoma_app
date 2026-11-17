import { Text, type StyleProp, type TextStyle } from 'react-native';
import { colors, type ColorName } from '@/theme';
import { glyphs, type IconName } from './icon-glyphs';

export type { IconName };

/**
 * Material Symbols icon, the same set the designs use, on every platform.
 * `filled` switches to the filled style. Decorative by default: put the
 * accessibility label on the pressable that wraps it.
 */
export function Icon({
  name,
  size = 24,
  color = 'onSurface',
  filled,
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
          fontFamily: filled ? 'MaterialSymbols_400Regular_Filled' : 'MaterialSymbols_400Regular',
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
