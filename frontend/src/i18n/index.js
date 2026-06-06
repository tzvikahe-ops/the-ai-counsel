import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import he from './locales/he.json';
import en from './locales/en.json';

const STORAGE_KEY = 'ai-counsel-lang';
const DEFAULT_LANG = 'he';

const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
const initialLang = stored || DEFAULT_LANG;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      he: { translation: he },
      en: { translation: en },
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });

const RTL_LANGS = new Set(['he', 'ar', 'fa']);

const applyDocumentDirection = (lng) => {
  if (typeof document === 'undefined') return;
  const dir = RTL_LANGS.has(lng) ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lng);
};

applyDocumentDirection(i18n.language);

i18n.on('languageChanged', (lng) => {
  applyDocumentDirection(lng);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, lng);
  }
});

export default i18n;
