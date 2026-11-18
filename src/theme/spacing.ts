/** Stitch spacing scale (rem × 16). `margin` is the screen edge padding. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 36,
  /** Gap between major sections of a screen. */
  section: 32,
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
