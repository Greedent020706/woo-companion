import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro';

  return (
    <button type="button" className={styles.toggle} onClick={toggleTheme} title={nextThemeLabel}>
      {theme === 'dark' ? (
        <Sun aria-hidden="true" size={18} />
      ) : (
        <Moon aria-hidden="true" size={18} />
      )}
      <span className="visually-hidden">{nextThemeLabel}</span>
    </button>
  );
}
