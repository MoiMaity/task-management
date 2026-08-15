/**
 * Theme registry.
 *
 * TODO(figma): replace this list with the exact themes shown in the design.
 * Adding a theme should require touching only this file and the matching
 * `[data-theme="..."]` block in `app/globals.css` — nothing else.
 */
export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = 'light';

/** Key used in localStorage. Also referenced by the inline ThemeScript. */
export const THEME_STORAGE_KEY = 'app-theme';

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}
