import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDatePart } from '../../utils/dateFormat';
import { FONT_SIZE_OPTIONS } from '../../utils/fontSize';
import { RESPONSE_LANGUAGE_DEFAULT, RESPONSE_LANGUAGES_FALLBACK } from '../../constants/responseLanguages';

export { RESPONSE_LANGUAGE_DEFAULT };

const UI_LANGUAGES = [
  { code: 'he', labelKey: 'language.hebrew' },
  { code: 'en', labelKey: 'language.english' },
];

export default function GeneralSettings({
  dateFormat,
  onDateFormatChange,
  fontSize,
  onFontSizeChange,
  responseLanguage,
  onResponseLanguageChange,
  responseLanguages = RESPONSE_LANGUAGES_FALLBACK,
  // relay-ai import (optional — desktop only feature)
  settings,
  relayItems = [],
  relaySelected = [],
  setRelaySelected,
  relayBannerVisible = false,
  relayDiscoverBusy = false,
  relayImportBusy = false,
  relayImportMessage = null,
  relayDiscoverReason = null,
  onDiscoverRelayAi,
  onImportRelayAi,
  onDismissRelayBanner,
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
        <div className="general-setting-row">
          <label htmlFor="font-size-select" className="general-setting-label">{t('generalExtra.fontSize.label')}</label>
          <select
            id="font-size-select"
            value={fontSize}
            onChange={(e) => onFontSizeChange(e.target.value)}
            className="select-input general-setting-select"
          >
            {FONT_SIZE_OPTIONS.map(({ value }) => (
              <option key={value} value={value}>{t(`generalExtra.fontSize.${value}`, { defaultValue: value })}</option>
            ))}
          </select>
          <span className="general-setting-hint">
            {t('generalExtra.fontSize.hint')}
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

      <div className="subsection general-subsection-divider">
        <h4>{t('generalExtra.relayImport.heading')}</h4>
        <p className="section-description">
          {t('generalExtra.relayImport.description')}
        </p>

        {relayBannerVisible && relayItems.length > 0 && !settings?.relay_ai_import_dismissed && (
          <div className="relay-import-banner">
            <div className="relay-import-banner-text">
              {t('generalExtra.relayImport.bannerFound', { count: relayItems.length })}
            </div>
            <button type="button" className="cancel-button" onClick={onDismissRelayBanner}>
              {t('generalExtra.relayImport.dismiss')}
            </button>
          </div>
        )}

        <button
          type="button"
          className="action-btn"
          onClick={onDiscoverRelayAi}
          disabled={relayDiscoverBusy}
          style={{ marginBottom: '12px' }}
        >
          {relayDiscoverBusy ? t('generalExtra.relayImport.discovering') : t('generalExtra.relayImport.discoverCredentials')}
        </button>

        {relayDiscoverReason && relayItems.length === 0 && (
          <p className="api-key-hint">{relayDiscoverReason}</p>
        )}

        {relayImportMessage && (
          <div
            className={`test-result ${relayImportMessage.tone === 'error' ? 'error' : 'success'}`}
            style={{ marginBottom: '12px' }}
            role="status"
          >
            {relayImportMessage.text}
          </div>
        )}

        {relayItems.length > 0 && (
          <div className="relay-import-list">
            {relayItems.map((item) => (
              <label key={item.relay_id} className="relay-import-item">
                <input
                  type="checkbox"
                  checked={relaySelected.includes(item.relay_id)}
                  onChange={(e) => {
                    setRelaySelected?.((prev) => (
                      e.target.checked
                        ? [...prev, item.relay_id]
                        : prev.filter((id) => id !== item.relay_id)
                    ));
                  }}
                />
                <span>
                  {item.label}
                  {item.already_configured_in_counsel && (
                    <span className="toggle-hint"> {t('generalExtra.relayImport.alreadyInCounsel')}</span>
                  )}
                </span>
              </label>
            ))}
            <div className="council-actions" style={{ marginTop: '12px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="action-btn"
                onClick={onImportRelayAi}
                disabled={relayImportBusy || relaySelected.length === 0}
              >
                {relayImportBusy ? t('generalExtra.relayImport.importing') : t('generalExtra.relayImport.importSelected', { count: relaySelected.length })}
              </button>
              {!settings?.relay_ai_import_dismissed && (
                <button type="button" className="cancel-button" onClick={onDismissRelayBanner}>
                  {t('generalExtra.relayImport.dismissNotice')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
