/**
 * PLACEHOLDER design tokens, to be replaced when the designs arrive.
 * Every component reads from here, so swapping in the real palette and type
 * scale should not require touching screens.
 */
export const colors = {
  background: '#FFFFFF',
  surface: '#F6F4F1',
  text: '#1A1A1A',
  textMuted: '#6B6B6B',
  primary: '#B5462E',
  primaryText: '#FFFFFF',
  border: '#E3DED8',
  verified: '#C9A227',
  danger: '#C62828',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const radius = { sm: 8, md: 12, lg: 20, pill: 999 };

export const type = {
  title: { fontSize: 28, fontWeight: '700' as const },
  heading: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16 },
  caption: { fontSize: 13 },
};
