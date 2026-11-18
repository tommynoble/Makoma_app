import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { colors, italicOf, type, type ColorName, type TypeVariant } from '@/theme';

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  color?: ColorName;
  italic?: boolean;
  uppercase?: boolean;
  center?: boolean;
}

/** The only way screens render text: picks a step of the type ramp and a palette colour. */
export function Text({ variant = 'bodyMd', color = 'onSurface', italic, uppercase, center, style, ...props }: TextProps) {
  const base = type[variant];
  return (
    <RNText
      style={[
        base,
        { color: colors[color] },
        italic && { fontFamily: italicOf[base.fontFamily] ?? base.fontFamily },
        uppercase && { textTransform: 'uppercase', letterSpacing: 1.1 },
        center && { textAlign: 'center' },
        style,
      ]}
      {...props}
    />
  );
}

/** Small uppercase label above a field or section (v4 "eyebrow"). */
export function Eyebrow({ children, color = 'tertiary' }: { children: string; color?: ColorName }) {
  return (
    <Text variant="labelSm" color={color} uppercase>
      {children}
    </Text>
  );
}
