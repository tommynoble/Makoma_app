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
