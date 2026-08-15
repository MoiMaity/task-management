'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_THEME, isTheme, THEME_STORAGE_KEY, THEMES, type Theme } from '@/lib/theme';

interface ThemeContextValue {
  theme: Theme;
  themes: readonly Theme[];
  setTheme: (theme: Theme) => void;
  /** False until the client has read the real theme off the DOM. */
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Starts at the default on both server and client so the markup matches.
  // ThemeScript has already set the correct attribute on <html>, so the
  // colours are right from the first paint; this state only catches up so
  // React components can *read* the current theme.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (isTheme(current)) setThemeState(current);
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next === 'dark' ? 'dark' : 'light';

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can throw in private browsing modes. The theme still applies
      // for this session; only persistence is lost.
    }
  }, []);

  // Keep open tabs in sync when the theme changes in another one.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === THEME_STORAGE_KEY && isTheme(event.newValue)) {
        setThemeState(event.newValue);
        document.documentElement.setAttribute('data-theme', event.newValue);
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, themes: THEMES, setTheme, mounted }),
    [theme, setTheme, mounted],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
}
