import { useTranslation } from 'react-i18next';
import './ThemeToggle.css';

/**
 * Theme toggle switch — flips between dark and light mode.
 * Controlled component: parent owns the `theme` state and persistence.
 */
export default function ThemeToggle({ theme, onToggle }) {
  const { t } = useTranslation();
  const isLight = theme === 'light';
  const label = isLight ? t('common.switchToDarkMode') : t('common.switchToLightMode');

  return (
    <button
      type="button"
      className={`theme-toggle ${isLight ? 'theme-toggle--light' : 'theme-toggle--dark'}`}
      onClick={onToggle}
      role="switch"
      aria-checked={isLight}
      aria-label={label}
      title={label}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">☀</span>
        <span className="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">☾</span>
        <span className="theme-toggle__thumb" />
      </span>
    </button>
  );
}
