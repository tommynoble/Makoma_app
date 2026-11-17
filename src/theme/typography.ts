import type { TextStyle } from 'react-native';

/**
 * Fonts are loaded once in src/app/_layout.tsx. Each weight is its own font
 * file, so styles pick a family and never set `fontWeight`.
 */
export const fonts = {
  serif: 'Newsreader_400Regular',
  serifItalic: 'Newsreader_400Regular_Italic',
  serifMedium: 'Newsreader_500Medium',
  serifMediumItalic: 'Newsreader_500Medium_Italic',
  serifSemiBold: 'Newsreader_600SemiBold',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
} as const;

/** Stitch type ramp (mobile sizes). Newsreader for reading, Plus Jakarta Sans for controls. */
export const type = {
  headlineXl: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 38, letterSpacing: -0.3 },
  headlineLg: { fontFamily: fonts.serifMedium, fontSize: 24, lineHeight: 32, letterSpacing: -0.24 },
  headlineMd: { fontFamily: fonts.serifMedium, fontSize: 22, lineHeight: 28 },
  bodyLg: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 30 },
  bodyMd: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 24 },
  labelLg: { fontFamily: fonts.sansSemiBold, fontSize: 15, lineHeight: 20, letterSpacing: 0.15 },
  labelMd: { fontFamily: fonts.sansSemiBold, fontSize: 13, lineHeight: 18, letterSpacing: 0.26 },
  labelSm: { fontFamily: fonts.sansBold, fontSize: 11, lineHeight: 14, letterSpacing: 0.44 },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

/** Italic counterpart of a serif family (labels have no italic). */
export const italicOf: Partial<Record<string, string>> = {
  [fonts.serif]: fonts.serifItalic,
  [fonts.serifMedium]: fonts.serifMediumItalic,
};
