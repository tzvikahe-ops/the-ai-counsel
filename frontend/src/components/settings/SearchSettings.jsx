import React from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalTestMessage } from '../../utils/testMessageHelper';

export const SEARCH_PROVIDERS = [
    { id: 'duckduckgo', name: 'DuckDuckGo', requiresKey: false, keyType: null },
    { id: 'serper', name: 'Serper (Google)', requiresKey: true, keyType: 'serper' },
    { id: 'tavily', name: 'Tavily', requiresKey: true, keyType: 'tavily' },
    { id: 'brave', name: 'Brave Search', requiresKey: true, keyType: 'brave' },
    { id: 'tinyfish', name: 'TinyFish', requiresKey: true, keyType: 'tinyfish' },
];

const PROVIDER_DESCRIPTIONS = {
    duckduckgo: 'Hybrid web + news search with smart optimization. Fast and free.',
    serper: 'Real Google search results. 2,500 free queries. Fast and accurate.',
    tavily: 'Purpose-built for LLMs. Returns rich, relevant content. Requires API key.',
    brave: 'Privacy-focused search. 2,000 free queries/month. Requires API key.',
    tinyfish: 'AI-powered search with free tier (5 req/min). Free API key, no credit card. Includes batch content fetching.',
};

export default function SearchSettings({
    settings,
    selectedSearchProvider,
    setSelectedSearchProvider,
    // Serper (Google)
    serperApiKey,
    setSerperApiKey,
    handleTestSerper,
    isTestingSerper,
    serperTestResult,
    setSerperTestResult,
    // Tavily
    tavilyApiKey,
    setTavilyApiKey,
    handleTestTavily,
    isTestingTavily,
    tavilyTestResult,
    setTavilyTestResult,
    // Brave
    braveApiKey,
    setBraveApiKey,
    handleTestBrave,
    isTestingBrave,
    braveTestResult,
    setBraveTestResult,
    // TinyFish
    tinyfishApiKey,
    setTinyfishApiKey,
    handleTestTinyfish,
    isTestingTinyfish,
    tinyfishTestResult,
    setTinyfishTestResult,
    // Other Settings
    fullContentResults,
    setFullContentResults,
    searchKeywordExtraction,
    setSearchKeywordExtraction,
    // New DuckDuckGo optimization settings
    searchResultCount,
    setSearchResultCount,
    searchHybridMode,
    setSearchHybridMode
}) {
    const { t } = useTranslation();
    return (
        <section className="settings-section">
            <h3>{t('search.providerHeading')}</h3>
            <div className="provider-options">
                {SEARCH_PROVIDERS.map(provider => (
                    <div key={provider.id} className={`provider-option-container ${selectedSearchProvider === provider.id ? 'selected' : ''}`}>
                        <label className="provider-option">
                            <input
                                type="radio"
                                name="search_provider"
                                value={provider.id}
                                checked={selectedSearchProvider === provider.id}
                                onChange={() => setSelectedSearchProvider(provider.id)}
                            />
                            <div className="provider-info">
                                <span className="provider-name ltr">{provider.name}</span>
                                <span className="provider-description">{PROVIDER_DESCRIPTIONS[provider.id]}</span>
                            </div>
                        </label>

                        {/* Inline API Key Input for Serper (Google) */}
                        {selectedSearchProvider === 'serper' && provider.id === 'serper' && (
                            <div className="inline-api-key-section">
                                <div className="api-key-input-row">
                                    <input
                                        type="password"
                                        placeholder={settings?.serper_api_key_set ? '••••••••••••••••' : t('search.enterKey')}
                                        value={serperApiKey}
                                        onChange={e => {
                                            setSerperApiKey(e.target.value);
                                            if (setSerperTestResult) setSerperTestResult(null);
                                        }}
                                        className={settings?.serper_api_key_set && !serperApiKey ? 'key-configured' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="test-button"
                                        onClick={handleTestSerper}
                                        disabled={isTestingSerper || (!serperApiKey && !settings?.serper_api_key_set)}
                                    >
                                        {isTestingSerper ? t('providers.testing') : (settings?.serper_api_key_set && !serperApiKey ? t('providers.retest') : t('providers.test'))}
                                    </button>
                                </div>
                                {settings?.serper_api_key_set && !serperApiKey && (
                                    <div className="key-status set">{t('providers.apiKeyConfigured')}</div>
                                )}
                                {serperTestResult && (
                                    <div className={`test-result ${serperTestResult.success ? 'success' : 'error'}`}>
                                        {serperTestResult.success ? '✓' : '✗'} {getLocalTestMessage(serperTestResult.message, t)}
                                    </div>
                                )}
                                <a 
                                    href="https://serper.dev" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="api-key-link"
                                    style={{ marginTop: '8px', display: 'inline-block', fontSize: '12px', color: '#60a5fa' }}
                                >
                                    Get API key at serper.dev →
                                </a>
                            </div>
                        )}

                        {/* Inline API Key Input for Tavily */}
                        {selectedSearchProvider === 'tavily' && provider.id === 'tavily' && (
                            <div className="inline-api-key-section">
                                <div className="api-key-input-row">
                                    <input
                                        type="password"
                                        placeholder={settings?.tavily_api_key_set ? '••••••••••••••••' : t('search.enterKey')}
                                        value={tavilyApiKey}
                                        onChange={e => {
                                            setTavilyApiKey(e.target.value);
                                            if (setTavilyTestResult) setTavilyTestResult(null);
                                        }}
                                        className={settings?.tavily_api_key_set && !tavilyApiKey ? 'key-configured' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="test-button"
                                        onClick={handleTestTavily}
                                        disabled={isTestingTavily || (!tavilyApiKey && !settings?.tavily_api_key_set)}
                                    >
                                        {isTestingTavily ? t('providers.testing') : (settings?.tavily_api_key_set && !tavilyApiKey ? t('providers.retest') : t('providers.test'))}
                                    </button>
                                </div>
                                {settings?.tavily_api_key_set && !tavilyApiKey && (
                                    <div className="key-status set">{t('providers.apiKeyConfigured')}</div>
                                )}
                                {tavilyTestResult && (
                                    <div className={`test-result ${tavilyTestResult.success ? 'success' : 'error'}`}>
                                        {tavilyTestResult.success ? '✓' : '✗'} {getLocalTestMessage(tavilyTestResult.message, t)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Inline API Key Input for Brave */}
                        {selectedSearchProvider === 'brave' && provider.id === 'brave' && (
                            <div className="inline-api-key-section">
                                <div className="api-key-input-row">
                                    <input
                                        type="password"
                                        placeholder={settings?.brave_api_key_set ? '••••••••••••••••' : t('search.enterKey')}
                                        value={braveApiKey}
                                        onChange={e => {
                                            setBraveApiKey(e.target.value);
                                            if (setBraveTestResult) setBraveTestResult(null);
                                        }}
                                        className={settings?.brave_api_key_set && !braveApiKey ? 'key-configured' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="test-button"
                                        onClick={handleTestBrave}
                                        disabled={isTestingBrave || (!braveApiKey && !settings?.brave_api_key_set)}
                                    >
                                        {isTestingBrave ? t('providers.testing') : (settings?.brave_api_key_set && !braveApiKey ? t('providers.retest') : t('providers.test'))}
                                    </button>
                                </div>
                                {settings?.brave_api_key_set && !braveApiKey && (
                                    <div className="key-status set">{t('providers.apiKeyConfigured')}</div>
                                )}
                                {braveTestResult && (
                                    <div className={`test-result ${braveTestResult.success ? 'success' : 'error'}`}>
                                        {braveTestResult.success ? '✓' : '✗'} {getLocalTestMessage(braveTestResult.message, t)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Inline API Key Input for TinyFish */}
                        {selectedSearchProvider === 'tinyfish' && provider.id === 'tinyfish' && (
                            <div className="inline-api-key-section">
                                <div className="api-key-input-row">
                                    <input
                                        type="password"
                                        placeholder={settings?.tinyfish_api_key_set ? '••••••••••••••••' : t('search.enterKey')}
                                        value={tinyfishApiKey}
                                        onChange={e => {
                                            setTinyfishApiKey(e.target.value);
                                            if (setTinyfishTestResult) setTinyfishTestResult(null);
                                        }}
                                        className={settings?.tinyfish_api_key_set && !tinyfishApiKey ? 'key-configured' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="test-button"
                                        onClick={handleTestTinyfish}
                                        disabled={isTestingTinyfish || (!tinyfishApiKey && !settings?.tinyfish_api_key_set)}
                                    >
                                        {isTestingTinyfish ? t('providers.testing') : (settings?.tinyfish_api_key_set && !tinyfishApiKey ? t('providers.retest') : t('providers.test'))}
                                    </button>
                                </div>
                                {settings?.tinyfish_api_key_set && !tinyfishApiKey && (
                                    <div className="key-status set">{t('providers.apiKeyConfigured')}</div>
                                )}
                                {tinyfishTestResult && (
                                    <div className={`test-result ${tinyfishTestResult.success ? 'success' : 'error'}`}>
                                        {tinyfishTestResult.success ? '✓' : '✗'} {getLocalTestMessage(tinyfishTestResult.message, t)}
                                    </div>
                                )}
                                <div className="rate-limit-notice" style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                                    {t('search.tinyfishFreeNote')} <a href="https://agent.tinyfish.ai" target="_blank" rel="noopener noreferrer" className="ltr" style={{ color: '#60a5fa' }}>agent.tinyfish.ai</a> {t('search.tinyfishFreeNote2')}
                                </div>
                                <a
                                    href="https://agent.tinyfish.ai/api-keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="api-key-link"
                                    style={{ marginTop: '8px', display: 'inline-block', fontSize: '12px', color: '#60a5fa' }}
                                >
                                    {t('search.getFreeApiKeyAt')} <span className="ltr">agent.tinyfish.ai</span> →
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="full-content-section">
                <label>{t('search.fullArticleLabel')}</label>
                <p className="setting-description">
                    {t('search.fullArticleDesc')}
                    <strong> {t('search.fullArticleZero')}</strong>
                </p>
                <div className="full-content-input-row">
                    <input
                        type="range"
                        min="0"
                        max="5"
                        value={fullContentResults}
                        onChange={e => setFullContentResults(parseInt(e.target.value, 10))}
                        className="full-content-slider"
                    />
                    <span className="full-content-value">{t('search.resultsCount', { n: fullContentResults })}</span>
                </div>
            </div>

            {/* DuckDuckGo-specific optimization settings */}
            {selectedSearchProvider === 'duckduckgo' && (
                <div className="ddg-optimization-section" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <label>{t('search.ddgOptimization')}</label>
                    <p className="setting-description">
                        {t('search.ddgDesc')}
                    </p>
                    <ul className="feature-list" style={{ margin: '8px 0 12px 20px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        <li>{t('search.ddgFeature1')}</li>
                        <li>{t('search.ddgFeature2')}</li>
                        <li>{t('search.ddgFeature3')}</li>
                        <li>{t('search.ddgFeature4')}</li>
                    </ul>

                    {/* Result Count Slider */}
                    <div className="result-count-section" style={{ marginTop: '16px' }}>
                        <div className="setting-row">
                            <span className="setting-label">{t('search.resultCount')}</span>
                            <span className="setting-value">{t('search.resultsCount', { n: searchResultCount })}</span>
                        </div>
                        <input
                            type="range"
                            min="5"
                            max="15"
                            value={searchResultCount}
                            onChange={e => setSearchResultCount(parseInt(e.target.value, 10))}
                            className="full-content-slider"
                        />
                        <p className="setting-hint">{t('search.resultCountHint')}</p>
                    </div>

                    {/* Hybrid Mode Toggle */}
                    <div className="hybrid-mode-section" style={{ marginTop: '16px' }}>
                        <label className="toggle-wrapper">
                            <input
                                type="checkbox"
                                checked={searchHybridMode}
                                onChange={e => setSearchHybridMode(e.target.checked)}
                            />
                            <span className="toggle-label">{t('search.hybridSearch')}</span>
                        </label>
                        <p className="setting-hint" style={{ marginTop: '4px', marginInlineStart: '28px' }}>
                            {t('search.hybridSearchHint')}
                        </p>
                    </div>
                </div>
            )}

            {/* Search Query Processing */}
            <div className="keyword-extraction-section" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <label>{t('search.queryProcessing')}</label>
                <p className="setting-description">
                    {t('search.queryProcessingDesc')}
                    {selectedSearchProvider === 'duckduckgo' && (
                        <span style={{ display: 'block', marginTop: '4px', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                            {t('search.ddgInfoNote')}
                        </span>
                    )}
                </p>

                <div className="provider-options">
                    <div className={`provider-option-container ${searchKeywordExtraction === 'direct' ? 'selected' : ''}`}>
                        <label className="provider-option">
                            <input
                                type="radio"
                                name="keyword_extraction"
                                value="direct"
                                checked={searchKeywordExtraction === 'direct'}
                                onChange={() => setSearchKeywordExtraction('direct')}
                            />
                            <div className="provider-info">
                                <span className="provider-name">{t('search.directRecommended')}</span>
                                <span className="provider-description">
                                    {t('search.directDesc')}
                                </span>
                            </div>
                        </label>
                    </div>

                    <div className={`provider-option-container ${searchKeywordExtraction === 'yake' ? 'selected' : ''}`}>
                        <label className="provider-option">
                            <input
                                type="radio"
                                name="keyword_extraction"
                                value="yake"
                                checked={searchKeywordExtraction === 'yake'}
                                onChange={() => setSearchKeywordExtraction('yake')}
                            />
                            <div className="provider-info">
                                <span className="provider-name">{t('search.smartKeywords')}</span>
                                <span className="provider-description">
                                    {t('search.smartKeywordsDesc')}
                                </span>
                            </div>
                        </label>
                    </div>

                    <div className={`provider-option-container ${searchKeywordExtraction === 'llm' ? 'selected' : ''}`}>
                        <label className="provider-option">
                            <input
                                type="radio"
                                name="keyword_extraction"
                                value="llm"
                                checked={searchKeywordExtraction === 'llm'}
                                onChange={() => setSearchKeywordExtraction('llm')}
                            />
                            <div className="provider-info">
                                <span className="provider-name">{t('search.llmReformulation')}</span>
                                <span className="provider-description">
                                    {t('search.llmReformulationDesc')}
                                </span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </section>
    );
}
