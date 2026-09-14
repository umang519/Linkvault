/**
 * Design tokens for the "Modernist" design system.
 * Source of truth: PROJECT.md §14.2 (color) and §14.3 (type scale).
 * Do not add values here that aren't in that spec — the system is
 * deliberately small (ground, surface, ink, accent, plus the two
 * dark-mode shifts, nothing else).
 */

export const lightColors = {
  bg: '#f3f2f2',
  surface: '#eae9e9',
  ink: '#201e1d',
  muted: '#605d5d',
  line: '#bab6b6',
  rule: '#201e1d',
  accent: '#ec3013',
  accentWash: '#fff2ef',
  inverse: '#f3f2f2',
} as const;

export const darkColors = {
  bg: '#191817',
  surface: '#242221',
  ink: '#f4f2f1',
  muted: '#9b9797',
  line: '#444141',
  rule: '#f4f2f1',
  accent: '#ff563c',
  accentWash: '#3b1a12',
  inverse: '#191817',
} as const;

export type ThemeColors = { [K in keyof typeof lightColors]: string };

// Archivo throughout; headings are weight 800 ("ExtraBold" in the
// @expo-google-fonts/archivo package), body is weight 400.
export const fonts = {
  heading: 'Archivo_800ExtraBold',
  body: 'Archivo_400Regular',
} as const;

// PROJECT.md §14.3 — 29 / 20 / 15 / 13.5 / 12.5 / 10, with the 10px
// tier tracked (+0.08–0.14em) and uppercased at the call site.
export const type = {
  screenTitle: 29,
  section: 20,
  linkTitle: 15,
  body: 13.5,
  secondary: 12.5,
  label: 10,
} as const;

// Zero border-radius everywhere, 2px rules for primary dividers,
// 1px hairlines for secondary ones — see PROJECT.md §14.1.
export const radius = 0;
export const ruleWidth = 2;
export const hairlineWidth = 1;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
} as const;
