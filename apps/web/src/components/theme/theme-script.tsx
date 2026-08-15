import {
  ACCENTS,
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT,
  DEFAULT_THEME,
  THEMES,
  THEME_STORAGE_KEY,
} from '@/lib/theme';

/**
 * Applies the stored theme and accent to <html> before the browser paints.
 *
 * This has to be a synchronous inline <script>, not a useEffect: an effect
 * runs after hydration, so the first frame would render with the defaults and
 * the user would see a flash of the wrong colours on every refresh.
 *
 * It is self-contained because it executes before any bundle loads, so the
 * valid value lists are serialised into it.
 */
export function ThemeScript() {
  const script = `
(function () {
  var d = document.documentElement;
  function pick(key, list, fallback) {
    try {
      var v = localStorage.getItem(key);
      return list.indexOf(v) !== -1 ? v : fallback;
    } catch (e) {
      return fallback;
    }
  }
  var theme = pick(${JSON.stringify(THEME_STORAGE_KEY)}, ${JSON.stringify(THEMES)}, ${JSON.stringify(DEFAULT_THEME)});
  var accent = pick(${JSON.stringify(ACCENT_STORAGE_KEY)}, ${JSON.stringify(ACCENTS)}, ${JSON.stringify(DEFAULT_ACCENT)});
  d.setAttribute('data-theme', theme);
  d.setAttribute('data-accent', accent);
  d.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: script }} suppressHydrationWarning />;
}
