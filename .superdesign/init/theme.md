# Theme

## Part 1: token summary

**Colors** (light only)
- surface/background `#fff8f5`; surfaceContainerLowest `#ffffff`; surfaceContainerLow `#fff1e8`; surfaceContainer `#fbebe1`; surfaceContainerHigh `#f5e5dc`; surfaceContainerHighest `#efe0d6`; surfaceDim `#e6d7ce`
- onSurface `#221a14`; onSurfaceVariant `#3f4948`; tertiary (muted text) `#635d56`; tertiaryContainer `#a49c93`; outline `#6f7978`; outlineVariant `#bfc8c7`
- primary `#286865`; primaryContainer (main CTA fill) `#6ba8a4`; primaryFixed `#afeee9`; onPrimaryContainer `#003c3a`
- secondary (terracotta) `#8e4c40`; secondaryContainer `#fda99a`; secondaryFixed `#ffdad4`; onSecondaryContainer `#783b30`
- tertiaryFixed `#eae1d7`; error `#ba1a1a`; inverseSurface `#372f28`; inverseOnSurface `#fdeee4`; scrim `rgba(44,36,30,0.58)`

**Type** (no fontWeight; weight is the font file)
- headlineXl Newsreader 400 30/38 (-0.3); headlineLg Newsreader 500 24/32; headlineMd Newsreader 500 22/28
- bodyLg Newsreader 400 20/30; bodyMd Newsreader 400 16/24; italics via Newsreader Italic
- labelLg Plus Jakarta Sans 600 15/20; labelMd PJS 600 13/18; labelSm PJS 700 11/14 (eyebrows uppercase, tracking ~1.1)

**Spacing** xs 4, sm 8, md 16, lg 24, xl 36, margin (screen edge) 20, gutter 16
**Radius** xs 6, md 16, lg 32, xl 48, full 9999 (pills); `borderCurve: 'continuous'`
**Shadows** (boxShadow strings, warm espresso tint) sm `0 1px 2px rgba(44,36,30,.05)`, md, lg, xl, primaryGlow `0 8px 20px -4px rgba(40,104,101,.35)`, halo, header `0 1px 8px rgba(0,0,0,.04)`, tabBar
**Max content width** 580. **Icons** Material Symbols Outlined / Filled.

## Part 2: raw source

### `src/theme/colors.ts`

```ts
/**
 * "Warm Editorial Trust" palette, copied one-for-one from the Stitch design
 * system (project "Ghanaian Dating App Onboarding Flow"). Light mode only
 * until dark designs exist. Never hardcode a hex value outside this file.
 */
export const colors = {
  background: '#fff8f5',
  surface: '#fff8f5',
  surfaceBright: '#fff8f5',
  surfaceDim: '#e6d7ce',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#fff1e8',
  surfaceContainer: '#fbebe1',
  surfaceContainerHigh: '#f5e5dc',
  surfaceContainerHighest: '#efe0d6',
  surfaceVariant: '#efe0d6',
  onSurface: '#221a14',
  onSurfaceVariant: '#3f4948',
  inverseSurface: '#372f28',
  inverseOnSurface: '#fdeee4',
  outline: '#6f7978',
  outlineVariant: '#bfc8c7',

  primary: '#286865',
  onPrimary: '#ffffff',
  primaryContainer: '#6ba8a4',
  onPrimaryContainer: '#003c3a',
  primaryFixed: '#afeee9',
  primaryFixedDim: '#94d2cd',
  onPrimaryFixed: '#00201f',
  onPrimaryFixedVariant: '#04504d',

  secondary: '#8e4c40',
  onSecondary: '#ffffff',
  secondaryContainer: '#fda99a',
  onSecondaryContainer: '#783b30',
  secondaryFixed: '#ffdad4',
  secondaryFixedDim: '#ffb4a7',
  onSecondaryFixed: '#390b05',
  onSecondaryFixedVariant: '#71352b',

  tertiary: '#635d56',
  onTertiary: '#ffffff',
  tertiaryContainer: '#a49c93',
  tertiaryFixed: '#eae1d7',
  onTertiaryFixedVariant: '#4b463f',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',

  /** Scrim behind sheets: espresso at 58%. */
  scrim: 'rgba(44, 36, 30, 0.58)',
  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;

/** Same colour at a given opacity, for tints like "primary at 10%". */
export function alpha(hex: string, opacity: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
}
```

### `src/theme/typography.ts`

```ts
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
```

### `src/theme/spacing.ts`

```ts
/** Stitch spacing scale (rem × 16). `margin` is the screen edge padding. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 36,
  margin: 20,
  gutter: 16,
} as const;

/** Stitch corner scale: rounded-md 6, rounded/2xl 16, lg 32, xl 48, full. */
export const radius = {
  xs: 6,
  md: 16,
  lg: 32,
  xl: 48,
  full: 9999,
} as const;

/** Soft, warm elevation levels used across the designs. */
export const shadows = {
  sm: '0 1px 2px rgba(44, 36, 30, 0.05)',
  md: '0 4px 6px -1px rgba(44, 36, 30, 0.08), 0 2px 4px -2px rgba(44, 36, 30, 0.06)',
  lg: '0 10px 15px -3px rgba(44, 36, 30, 0.10), 0 4px 6px -4px rgba(44, 36, 30, 0.08)',
  xl: '0 20px 25px -5px rgba(44, 36, 30, 0.12), 0 8px 10px -6px rgba(44, 36, 30, 0.08)',
  primaryGlow: '0 8px 20px -4px rgba(40, 104, 101, 0.35)',
  halo: '0 20px 48px -12px rgba(40, 104, 101, 0.18)',
  header: '0 1px 8px rgba(0, 0, 0, 0.04)',
  tabBar: '0 -4px 20px rgba(44, 36, 30, 0.05)',
} as const;

export const motion = { fast: 150, base: 250, slow: 400 } as const;

/** Content never grows wider than this (keeps the editorial column on tablets). */
export const maxContentWidth = 580;
```
