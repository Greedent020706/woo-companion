import { use } from 'react';
import { ThemeContext } from '../theme/theme-context';

export function useTheme() {
  const themeContext = use(ThemeContext);
  if (!themeContext) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return themeContext;
}
