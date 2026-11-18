import type { TextStyle } from 'react-native';

/**
 * Fonts are loaded once in src/app/_layout.tsx. Each weight is its own font
 * file, so styles pick a family and never set `fontWeight`.
 */
export const fonts = {
  serif: 'Fraunces_400Regular',
  serifItalic: 'Fraunces_400Regular_Italic',
  serifMedium: 'Fraunces_500Medium',
  serifMediumItalic: 'Fraunces_500Medium_Italic',
  serifSemiBold: 'Fraunces_600SemiBold',
  serifSemiBoldItalic: 'Fraunces_600SemiBold_Italic',
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
} as const;

/** Type ramp (mobile). Fraunces for reading and headlines, Plus Jakarta Sans for controls. */
export const type = {
  /** v4 screen titles: Fraunces semibold 32. */
  headlineXl: { fontFamily: fonts.serifSemiBold, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 },
  headlineLg: { fontFamily: fonts.serifMedium, fontSize: 24, lineHeight: 32, letterSpacing: -0.24 },
  headlineMd: { fontFamily: fonts.serifMedium, fontSize: 22, lineHeight: 28 },
  /** Large quoted text (transcripts, suggestions): editorial serif. */
  bodyLg: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 30 },
  /** Paragraphs and descriptions: clean sans for readability. */
  bodyMd: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 25 },
  labelLg: { fontFamily: fonts.sansSemiBold, fontSize: 15, lineHeight: 20, letterSpacing: 0.15 },
  labelMd: { fontFamily: fonts.sansSemiBold, fontSize: 13, lineHeight: 18, letterSpacing: 0.26 },
  labelSm: { fontFamily: fonts.sansBold, fontSize: 11, lineHeight: 14, letterSpacing: 0.44 },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

/**
 * Italic counterpart of a family. Italic paragraph text is always a quote
 * (someone's own words), so it switches to the editorial serif italic.
 */
export const italicOf: Partial<Record<string, string>> = {
  [fonts.sans]: fonts.serifItalic,
  [fonts.serif]: fonts.serifItalic,
  [fonts.serifMedium]: fonts.serifMediumItalic,
  [fonts.serifSemiBold]: fonts.serifSemiBoldItalic,
};
