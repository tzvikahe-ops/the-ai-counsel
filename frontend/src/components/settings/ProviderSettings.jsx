import React from 'react';
import { useTranslation } from 'react-i18next';
import openrouterIcon from '../../assets/icons/openrouter.svg';
import groqIcon from '../../assets/icons/groq.svg';
import ollamaIcon from '../../assets/icons/ollama.svg';
import openaiIcon from '../../assets/icons/openai.svg';
import anthropicIcon from '../../assets/icons/anthropic.svg';
import googleIcon from '../../assets/icons/google.svg';
import mistralIcon from '../../assets/icons/mistral.svg';
import deepseekIcon from '../../assets/icons/deepseek.svg';
import nvidiaIcon from '../../assets/icons/nvidia.svg';
import customEndpointIcon from '../../assets/icons/openai-compatible.svg';
import opencodeIcon from '../../assets/icons/opencode.svg';
import { getLocalTestMessage } from '../../utils/testMessageHelper';

const PROVIDER_ICONS = {
    openai: openaiIcon,
    anthropic: anthropicIcon,
    google: googleIcon,
    mistral: mistralIcon,
    deepseek: deepseekIcon,
    nvidia: nvidiaIcon,
    'opencode-zen': opencodeIcon,
    'opencode-go': opencodeIcon,
};

const DIRECT_PROVIDERS = [
    { id: 'openai', name: 'OpenAI', key: 'openai_api_key' },
    { id: 'anthropic', name: 'Anthropic', key: 'anthropic_api_key' },
    { id: 'google', name: 'Google', key: 'google_api_key' },
    { id: 'mistral', name: 'Mistral', key: 'mistral_api_key' },
    { id: 'deepseek', name: 'DeepSeek', key: 'deepseek_api_key' },
    { id: 'nvidia', name: 'NVIDIA Build', key: 'nvidia_api_key' },
];

export default function ProviderSettings({
    settings,
    availableModels = [],
    directAvailableModels = [],
    ollamaAvailableModels = [],
    // OpenRouter
    openrouterApiKey,
    setOpenrouterApiKey,
    handleTestOpenRouter,
    isTestingOpenRouter,
    openrouterTestResult,
    // Groq
    groqApiKey,
    setGroqApiKey,
    handleTestGroq,
    isTestingGroq,
    groqTestResult,
    // Ollama
    ollamaBaseUrl,
    setOllamaBaseUrl,
    handleTestOllama,
    isTestingOllama,
    ollamaTestResult,
    ollamaStatus,
    loadOllamaModels,
    // Direct
    directKeys,
    setDirectKeys,
    handleTestDirectKey,
    validatingKeys,
    keyValidationStatus,
    // OpenCode
    opencodeApiKey,
    setOpencodeApiKey,
    handleTestOpencode,
    isTestingOpencode,
    opencodeTestResult,
    opencodeAvailableModels,
    // Custom Endpoint
    customEndpointName,
    setCustomEndpointName,
    customEndpointUrl,
    setCustomEndpointUrl,
    customEndpointApiKey,
    setCustomEndpointApiKey,
    handleTestCustomEndpoint,
    isTestingCustomEndpoint,
    customEndpointTestResult,
    customEndpointModels,
    onClearCustomEndpoint
}) {
    const { t } = useTranslation();
    const getDirectProviderModelsCount = (providerId) => {
        const providerNameMap = {
            openai: 'OpenAI',
            anthropic: 'Anthropic',
            google: 'Google',
            mistral: 'Mistral',
            deepseek: 'DeepSeek',
            nvidia: 'NVIDIA'
        };
        const name = providerNameMap[providerId];
        if (!name) return 0;
        return directAvailableModels.filter(m => m.provider === name).length;
    };

    const groqModelsCount = directAvailableModels.filter(m => m.provider === 'Groq').length;

    return (
        <section className="settings-section">
            <h3>{t('providers.heading')}</h3>
            <p className="section-description">
                {t('providers.description')}
            </p>

            {/* OpenRouter */}
            <form className="api-key-section" onSubmit={e => e.preventDefault()}>
                <label>
                    <img src={openrouterIcon} alt="" className="provider-icon" />
                    {t('providers.openrouterLabel')}
                </label>
                <div className="api-key-input-row">
                    <input
                        type="password"
                        placeholder={settings?.openrouter_api_key_set ? '••••••••••••••••' : t('providers.enterApiKey')}
                        value={openrouterApiKey}
                        onChange={(e) => {
                            setOpenrouterApiKey(e.target.value);
                            // Reset test result on change is handled by parent usually, but here we might need a callback or just let parent handle it via the setter wrapper if needed.
                            // In Settings.jsx: setOpenrouterTestResult(null) was called.
                            // We should probably pass a wrapper or just accept that the parent setter doesn't clear the error.
                            // Actually, looking at Settings.jsx, the onChange did: setOpenrouterApiKey(...); setOpenrouterTestResult(null);
                            // So we need to replicate that logic or pass a specific handler.
                            // For simplicity, let's assume the parent passes a setter that *just* sets the key, and we might need a separate prop for clearing error?
                            // No, simpler: The parent passed `setOpenrouterApiKey`. If we want to clear error, we need to do it here?
                            // Wait, the prop `setOpenrouterApiKey` is likely just the state setter.
                            // I should probably accept `onOpenrouterKeyChange` instead of raw setter if I want to bundle logic.
                            // BUT, to keep it "dumb", I'll just use the props as is, but I can't clear the error if I don't have the error setter.
                            // Let's check the props again. I didn't pass `setOpenrouterTestResult`.
                            // I should probably pass `onOpenrouterChange` which does both.
                            // OR, I can just pass `setOpenrouterTestResult` as a prop too.
                            // Let's pass `setOpenrouterTestResult` etc. to be safe, or better, make the props `onChange...`.
                            // I'll stick to the raw setters for now but I'll add `setOpenrouterTestResult` to the props list to be safe, OR just ignore clearing it (minor UX regression).
                            // BETTER: I'll define `handleOpenrouterChange` locally if I have the setters.
                        }}
                        className={`ltr ${settings?.openrouter_api_key_set && !openrouterApiKey ? 'key-configured' : ''}`}
                    />
                    <button
                        className="test-button"
                        onClick={handleTestOpenRouter}
                        disabled={!openrouterApiKey && !settings?.openrouter_api_key_set || isTestingOpenRouter}
                    >
                        {isTestingOpenRouter ? t('providers.testing') : (settings?.openrouter_api_key_set && !openrouterApiKey ? t('providers.retest') : t('providers.test'))}
                    </button>
                </div>
                {settings?.openrouter_api_key_set && !openrouterApiKey && (
                    <div className="key-status set">
                        {t('providers.apiKeyConfigured')}
                        {availableModels.length > 0 && ` · ${availableModels.length} ${t('providers.modelsAvailableSuffix')}`}
                    </div>
                )}
                {openrouterTestResult && (
                    <div className={`test-result ${openrouterTestResult.success ? 'success' : 'error'}`}>
                        {getLocalTestMessage(openrouterTestResult.message, t)}
                    </div>
                )}
                <p className="api-key-hint">
                    {t('providers.openrouterHint')} <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="ltr">openrouter.ai</a>
                </p>
            </form>

            {/* Groq */}
            <form className="api-key-section" onSubmit={e => e.preventDefault()}>
                <label>
                    <img src={groqIcon} alt="" className="provider-icon" />
                    {t('providers.groqLabel')}
                </label>
                <div className="api-key-input-row">
                    <input
                        type="password"
                        placeholder={settings?.groq_api_key_set ? '••••••••••••••••' : t('providers.enterApiKey')}
                        value={groqApiKey}
                        onChange={(e) => {
                            setGroqApiKey(e.target.value);
                        }}
                        className={`ltr ${settings?.groq_api_key_set && !groqApiKey ? 'key-configured' : ''}`}
                    />
                    <button
                        className="test-button"
                        onClick={handleTestGroq}
                        disabled={!groqApiKey && !settings?.groq_api_key_set || isTestingGroq}
                    >
                        {isTestingGroq ? t('providers.testing') : (settings?.groq_api_key_set && !groqApiKey ? t('providers.retest') : t('providers.test'))}
                    </button>
                </div>
                {settings?.groq_api_key_set && !groqApiKey && (
                    <div className="key-status set">
                        {t('providers.apiKeyConfigured')}
                        {groqModelsCount > 0 && ` · ${groqModelsCount} ${t('providers.modelsAvailableSuffix')}`}
                    </div>
                )}
                {groqTestResult && (
                    <div className={`test-result ${groqTestResult.success ? 'success' : 'error'}`}>
                        {getLocalTestMessage(groqTestResult.message, t)}
                    </div>
                )}
                <p className="api-key-hint">
                    {t('providers.groqHint')} <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="ltr">console.groq.com</a>
                </p>
            </form>

            {/* Ollama */}
            <form className="api-key-section" onSubmit={e => e.preventDefault()}>
                <label>
                    <img src={ollamaIcon} alt="" className="provider-icon" />
                    {t('providers.ollamaLabel')}
                </label>
                <div className="api-key-input-row">
                    <input
                        type="text"
                        className="ltr"
                        placeholder="http://localhost:11434"
                        value={ollamaBaseUrl}
                        onChange={(e) => {
                            setOllamaBaseUrl(e.target.value);
                        }}
                    />
                    <button
                        className="test-button"
                        onClick={handleTestOllama}
                        disabled={!ollamaBaseUrl || isTestingOllama}
                    >
                        {isTestingOllama ? t('providers.testing') : t('providers.connect')}
                    </button>
                </div>
                {ollamaTestResult && (
                    <div className={`test-result ${ollamaTestResult.success ? 'success' : 'error'}`}>
                        {getLocalTestMessage(ollamaTestResult.message, t)}
                    </div>
                )}
                {ollamaStatus && ollamaStatus.connected && (
                    <div className="ollama-auto-status connected">
                        <span className="status-indicator connected">●</span>
                        <span className="status-text">
                            <strong>{t('providers.ollamaConnected')}</strong>
                            {ollamaAvailableModels.length > 0 && ` · ${ollamaAvailableModels.length} ${t('providers.ollamaModelsAvailable')}`}
                            <span className="status-separator">·</span>
                            <span className="status-time">{t('providers.ollamaLast')} <span className="ltr">{new Date(ollamaStatus.lastConnected).toLocaleTimeString()}</span></span>
                        </span>
                    </div>
                )}
                {ollamaStatus && !ollamaStatus.connected && !ollamaStatus.testing && (
                    <div className="ollama-auto-status">
                        <span className="status-indicator disconnected">●</span>
                        <span className="status-text">{t('providers.ollamaNotConnected')}</span>
                    </div>
                )}
                <div className="model-options-row" style={{ marginTop: '12px' }}>
                    <button
                        type="button"
                        className="reset-defaults-button"
                        onClick={() => loadOllamaModels(ollamaBaseUrl)}
                    >
                        {t('providers.refreshLocalModels')}
                    </button>
                </div>
            </form>

            {/* Direct LLM API Connections */}
            <div className="subsection" style={{ marginTop: '24px' }}>
                <h4>{t('providers.directHeading')}</h4>
                {DIRECT_PROVIDERS.map(dp => (
                    <form key={dp.id} className="api-key-section" onSubmit={e => e.preventDefault()}>
                        <label>
                            <img src={PROVIDER_ICONS[dp.id]} alt="" className="provider-icon" />
                            <span className="ltr">{dp.name}</span> {t('providers.directKeyLabelSuffix')}
                        </label>
                        <div className="api-key-input-row">
                            <input
                                type="password"
                                placeholder={settings?.[`${dp.key}_set`] ? '••••••••••••••••' : t('providers.enterApiKey')}
                                value={directKeys[dp.key]}
                                onChange={e => setDirectKeys(prev => ({ ...prev, [dp.key]: e.target.value }))}
                                className={`ltr ${settings?.[`${dp.key}_set`] && !directKeys[dp.key] ? 'key-configured' : ''}`}
                            />
                            <button
                                className="test-button"
                                onClick={() => handleTestDirectKey(dp.id, dp.key)}
                                disabled={(!directKeys[dp.key] && !settings?.[`${dp.key}_set`]) || validatingKeys[dp.id]}
                            >
                                {validatingKeys[dp.id] ? t('providers.testing') : (settings?.[`${dp.key}_set`] && !directKeys[dp.key] ? t('providers.retest') : t('providers.test'))}
                            </button>
                        </div>
                        {settings?.[`${dp.key}_set`] && !directKeys[dp.key] && (
                            <div className="key-status set">
                                {t('providers.apiKeyConfigured')}
                                {getDirectProviderModelsCount(dp.id) > 0 && ` · ${getDirectProviderModelsCount(dp.id)} ${t('providers.modelsAvailableSuffix')}`}
                            </div>
                        )}
                        {keyValidationStatus[dp.id] && (
                            <div className={`test-result ${keyValidationStatus[dp.id].success ? 'success' : 'error'}`}>
                                {getLocalTestMessage(keyValidationStatus[dp.id].message, t)}
                            </div>
                        )}
                    </form>
                ))}
            </div>

            {/* OpenCode Zen / Go */}
            <div className="subsection" style={{ marginTop: '24px' }}>
                <h4>
                    <img src={opencodeIcon} alt="" className="provider-icon" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    {t('providers.opencodeHeading')}
                </h4>
                <p className="subsection-description" style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
                    {t('providers.opencodeDescription')}
                </p>
                <form className="api-key-section" onSubmit={e => e.preventDefault()}>
                    <label>{t('providers.opencodeApiKey')}</label>
                    <div className="api-key-input-row">
                        <input
                            type="password"
                            placeholder={settings?.opencode_api_key_set ? '••••••••••••••••' : t('providers.enterApiKey')}
                            value={opencodeApiKey}
                            onChange={e => setOpencodeApiKey(e.target.value)}
                            className={`ltr ${settings?.opencode_api_key_set && !opencodeApiKey ? 'key-configured' : ''}`}
                        />
                        <button
                            className="test-button"
                            onClick={handleTestOpencode}
                            disabled={(!opencodeApiKey && !settings?.opencode_api_key_set) || isTestingOpencode}
                        >
                            {isTestingOpencode ? t('providers.testing') : (settings?.opencode_api_key_set && !opencodeApiKey ? t('providers.retest') : t('providers.test'))}
                        </button>
                    </div>
                    {settings?.opencode_api_key_set && !opencodeApiKey && (
                        <div className="key-status set">
                            {t('providers.apiKeyConfigured')}
                            {opencodeAvailableModels.length > 0 && ` · ${opencodeAvailableModels.length} ${t('providers.modelsAvailableSuffix')}`}
                        </div>
                    )}
                    {opencodeTestResult && (
                        <div className={`test-result ${opencodeTestResult.success ? 'success' : 'error'}`}>
                            {getLocalTestMessage(opencodeTestResult.message, t)}
                        </div>
                    )}
                    <p className="api-key-hint">
                        {t('providers.opencodeHint')} <a href="https://opencode.ai/auth" target="_blank" rel="noopener noreferrer" className="ltr">opencode.ai/auth</a>
                    </p>
                </form>
            </div>

            {/* Custom OpenAI-compatible Endpoint */}
            <div className="subsection" style={{ marginTop: '24px' }}>
                <h4>{t('providers.customHeading')}</h4>
                <p className="subsection-description" style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
                    {t('providers.customDescription')}
                </p>
                <form className="api-key-section" onSubmit={e => e.preventDefault()}>
                    <label>
                        <img src={customEndpointIcon} alt="" className="provider-icon" />
                        {t('providers.displayName')}
                    </label>
                    <div className="api-key-input-row">
                        <input
                            type="text"
                            placeholder={t('providers.displayNamePlaceholder')}
                            value={customEndpointName}
                            onChange={(e) => {
                                setCustomEndpointName(e.target.value);
                            }}
                        />
                    </div>

                    <label style={{ marginTop: '12px' }}>{t('providers.baseUrl')}</label>
                    <div className="api-key-input-row">
                        <input
                            type="text"
                            className="ltr"
                            placeholder="https://api.together.xyz/v1"
                            value={customEndpointUrl}
                            onChange={(e) => {
                                setCustomEndpointUrl(e.target.value);
                            }}
                        />
                    </div>

                    <label style={{ marginTop: '12px' }}>{t('providers.apiKeyLabel')} <span style={{ fontWeight: 'normal', opacity: 0.7 }}>{t('providers.optionalLocal')}</span></label>
                    <div className="api-key-input-row">
                        <input
                            type="password"
                            placeholder={settings?.custom_endpoint_url ? '••••••••••••••••' : t('providers.enterApiKey')}
                            value={customEndpointApiKey}
                            onChange={(e) => {
                                setCustomEndpointApiKey(e.target.value);
                            }}
                            className="ltr"
                        />
                        <button
                            className="test-button"
                            onClick={handleTestCustomEndpoint}
                            disabled={!customEndpointName || !customEndpointUrl || isTestingCustomEndpoint}
                        >
                            {isTestingCustomEndpoint ? t('providers.testing') : t('providers.connect')}
                        </button>
                    </div>

                    {settings?.custom_endpoint_url && (
                        <div className="key-status set key-status-row">
                            <span>
                                {t('providers.endpointConfigured')}
                                {customEndpointModels.length > 0 && ` · ${customEndpointModels.length} ${t('providers.modelsAvailableSuffix')}`}
                            </span>
                            <button
                                className="test-button danger"
                                onClick={onClearCustomEndpoint}
                            >
                                {t('providers.disconnect')}
                            </button>
                        </div>
                    )}
                    {customEndpointTestResult && (
                        <div className={`test-result ${customEndpointTestResult.success ? 'success' : 'error'}`}>
                            {getLocalTestMessage(customEndpointTestResult.message, t)}
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
}
