import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDatePart } from '../../utils/dateFormat';
import { RESPONSE_LANGUAGE_DEFAULT, RESPONSE_LANGUAGES_FALLBACK } from '../../constants/responseLanguages';

export { RESPONSE_LANGUAGE_DEFAULT };

const UI_LANGUAGES = [
  { code: 'he', labelKey: 'language.hebrew' },
  { code: 'en', labelKey: 'language.english' },
];

export default function GeneralSettings({
  dateFormat,
  onDateFormatChange,
  responseLanguage,
  onResponseLanguageChange,
  responseLanguages = RESPONSE_LANGUAGES_FALLBACK,
}) {
  const { t, i18n } = useTranslation();

  const handleUiLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <section className="settings-section">
      <h3>{t('generalExtra.heading')}</h3>
      <p className="section-description">
        {t('generalExtra.description')}
      </p>

      <div className="subsection">
        <h4>{t('settings.general.uiLanguageHeading')}</h4>
        <p className="section-description general-section-note">
          {t('settings.general.uiLanguageDescription')}
        </p>
        <div className="general-setting-row">
          <label htmlFor="ui-language-select" className="general-setting-label">
            {t('settings.general.uiLanguageLabel')}
          </label>
          <select
            id="ui-language-select"
            value={i18n.language}
            onChange={handleUiLanguageChange}
            className="select-input general-setting-select"
          >
            {UI_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {t(lang.labelKey)}
              </option>
            ))}
          </select>
          <span className="general-setting-hint">{t('settings.general.rtlNote')}</span>
        </div>
      </div>

      <div className="subsection general-subsection-divider">
        <h4>{t('generalExtra.displayPreferences')}</h4>
        <div className="general-setting-row">
          <label htmlFor="date-format-select" className="general-setting-label">{t('generalExtra.dateFormat')}</label>
          <select
            id="date-format-select"
            value={dateFormat}
            onChange={(e) => onDateFormatChange(e.target.value)}
            className="select-input general-setting-select"
          >
            <option value="auto">{t('generalExtra.autoBrowser')}</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (Europe / intl.)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
          </select>
          <span className="general-setting-hint">
            {t('generalExtra.sidebarPreview')} <span className="ltr">{formatDatePart(new Date(), dateFormat)}</span>
          </span>
        </div>
      </div>

      <div className="subsection general-subsection-divider">
        <h4>{t('generalExtra.responseLanguage')}</h4>
        <p className="section-description general-section-note">
          {t('generalExtra.responseLanguageDescription')}
        </p>
        <div className="general-setting-row">
          <label htmlFor="response-language-select" className="general-setting-label">{t('generalExtra.modelResponses')}</label>
          <select
            id="response-language-select"
            value={responseLanguage}
            onChange={(e) => onResponseLanguageChange(e.target.value)}
            className="select-input general-setting-select"
          >
            {responseLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
