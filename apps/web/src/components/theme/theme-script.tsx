import { DEFAULT_THEME, THEME_STORAGE_KEY, THEMES } from '@/lib/theme';

/**
 * Applies the stored theme to <html> *before* the browser paints.
 *
 * This has to be a plain synchronous <script> injected into the document
 * rather than a useEffect: an effect runs after hydration, which means the
 * first frame renders with the default theme and the user sees a flash of the
 * wrong colours on every refresh. Blocking here costs well under a
 * millisecond and removes the flash entirely.
 *
 * The script is self-contained (no imports at runtime) because it executes
 * before any bundle has loaded, so the theme list is serialised into it.
 */
export function ThemeScript() {
  const script = `
(function () {
  try {
    var themes = ${JSON.stringify(THEMES)};
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var theme = themes.indexOf(stored) !== -1 ? stored : null;

    if (!theme) {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark && themes.indexOf('dark') !== -1 ? 'dark' : ${JSON.stringify(DEFAULT_THEME)};
    }

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  } catch (e) {
    document.documentElement.setAttribute('data-theme', ${JSON.stringify(DEFAULT_THEME)});
  }
})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: script }} suppressHydrationWarning />;
}
