/**
 * Theming is TWO independent axes in this design, not one list of themes.
 *
 * The account menu has "Change Theme" (light/dark) and, separately, a
 * "Color Mode" submenu listing six accent colours. They combine, so the user
 * can be in dark mode with an Emerald accent. Both persist across refreshes.
 *
 * Implemented as two attributes on <html>:
 *   data-theme="light|dark"   drives surfaces and text
 *   data-accent="blue|..."    drives the accent colour only
 */

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

/** Order matches the Color Mode menu in the design. Blue is checked by default. */
export const ACCENTS = ['amber', 'blue', 'pink', 'rose', 'emerald', 'black'] as const;
export type Accent = (typeof ACCENTS)[number];

export const ACCENT_LABELS: Record<Accent, string> = {
  amber: 'Amber',
  blue: 'Blue',
  pink: 'Pink',
  rose: 'Rose',
  emerald: 'Emerald',
  black: 'Black',
};

export const DEFAULT_THEME: Theme = 'light';
export const DEFAULT_ACCENT: Accent = 'blue';

export const THEME_STORAGE_KEY = 'app-theme';
export const ACCENT_STORAGE_KEY = 'app-accent';

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

export function isAccent(value: unknown): value is Accent {
  return typeof value === 'string' && (ACCENTS as readonly string[]).includes(value);
}
