import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './theme-context';

const THEME_KEY = 'woo-companion:theme';

function readThemeAppliedBeforePaint(): Theme {
  return document.documentElement.dataset.bsTheme === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readThemeAppliedBeforePaint);

  useEffect(() => {
    document.documentElement.dataset.bsTheme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Sin storage el tema no se recuerda, pero sigue funcionando
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')),
    [],
  );

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
