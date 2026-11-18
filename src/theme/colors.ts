/**
 * "Bold Editorial Intent" palette from the Superdesign v4 draft. Every text
 * colour passes WCAG AA (4.5:1) on the surfaces it is used on; the soft
 * terracotta (#E8664F) is decorative only. Light mode only. Never hardcode a
 * hex value outside this file.
 */
export const colors = {
  /** Light, barely-warm canvas. Cards pop through edge + shadow, not a warm backdrop. */
  background: '#f5f2ef',
  surface: '#f5f2ef',
  surfaceBright: '#f5f2ef',
  surfaceDim: '#ddd5cf',
  /** Cards. */
  surfaceContainerLowest: '#ffffff',
  /** Tinted panel ON THE CANVAS (lighter than the canvas). */
  surfaceContainerLow: '#fbf9f7',
  surfaceContainer: '#f4efeb',
  /** Pills, chips and panels ON WHITE CARDS (darker than white, 1.21:1). */
  surfaceContainerHigh: '#eee8e3',
  /** Tracks, disabled fills. */
  surfaceContainerHighest: '#ddd5cf',
  surfaceVariant: '#ddd5cf',
  onSurface: '#0a0805',
  onSurfaceVariant: '#3d3530',
  inverseSurface: '#1f1a16',
  inverseOnSurface: '#fdeee4',
  outline: '#6f7978',
  outlineVariant: '#bfc8c7',

  /** Deep teal: headings accents, active icons, strong actions. */
  primary: '#1a4a47',
  onPrimary: '#ffffff',
  /** Button teal: default CTA fill (white text 5.8:1). */
  primaryContainer: '#2d6f6c',
  onPrimaryContainer: '#00201f',
  /** Mint highlight. */
  primaryFixed: '#7fe9e0',
  primaryFixedDim: '#94d2cd',
  onPrimaryFixed: '#00201f',
  onPrimaryFixedVariant: '#04504d',

  /** Terracotta: selection, voice, warm actions (white text 6.3:1). */
  secondary: '#a83b2a',
  onSecondary: '#ffffff',
  /** Terracotta tint. */
  secondaryContainer: '#ffb3a0',
  onSecondaryContainer: '#7a2a1c',
  /** Soft terracotta, decorative only (never for text). */
  secondaryAccent: '#e8664f',
  secondaryFixed: '#ffdad4',
  secondaryFixedDim: '#ffb4a7',
  onSecondaryFixed: '#4a160c',
  onSecondaryFixedVariant: '#7a2a1c',

  /** Muted text (11.4:1 on the canvas). */
  tertiary: '#3d3530',
  onTertiary: '#ffffff',
  /** Placeholder / quiet text (5.7:1 on white). */
  tertiaryContainer: '#6e6560',
  tertiaryFixed: '#eae1d7',
  onTertiaryFixedVariant: '#4b463f',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',

  /** Hairline border on cards and inputs. */
  hairline: 'rgba(10, 8, 5, 0.12)',
  /** Unselected controls (switch off, radio ring): 3:1+ on canvas and cards (WCAG 1.4.11). */
  control: '#7a6e66',
  /** Scrim behind sheets. */
  scrim: 'rgba(10, 8, 5, 0.45)',
  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;

/** Same colour at a given opacity, for tints like "primary at 10%". */
export function alpha(hex: string, opacity: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
}
