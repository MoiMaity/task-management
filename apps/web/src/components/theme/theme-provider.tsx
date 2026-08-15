'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  type Accent,
  type Theme,
  isAccent,
  isTheme,
} from '@/lib/theme';

interface ThemeContextValue {
  theme: Theme;
  accent: Accent;
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  /** False until the client has read the real values off the DOM. */
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private browsing can reject writes. The choice still applies for this
    // session; only persistence is lost.
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Starts at the defaults on both server and client so the markup matches.
  // ThemeScript has already set the correct attributes, so colours are right
  // from the first paint; this state only catches up so components can read
  // the current values.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [accent, setAccentState] = useState<Accent>(DEFAULT_ACCENT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const t = root.getAttribute('data-theme');
    const a = root.getAttribute('data-accent');
    if (isTheme(t)) setThemeState(t);
    if (isAccent(a)) setAccentState(a);
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next === 'dark' ? 'dark' : 'light';
    persist(THEME_STORAGE_KEY, next);
  }, []);

  const setAccent = useCallback((next: Accent) => {
    setAccentState(next);
    document.documentElement.setAttribute('data-accent', next);
    persist(ACCENT_STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ theme, accent, setTheme, setAccent, mounted }),
    [theme, accent, setTheme, setAccent, mounted],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
}
