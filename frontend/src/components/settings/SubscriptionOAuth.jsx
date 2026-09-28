import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { OAUTH_PROVIDERS } from '../../constants/oauthProviders';

const POLL_MS = 2000;

export default function SubscriptionOAuth({
  settings,
  onSettingsChange,
  onModelsRefresh,
  directAvailableModels = [],
}) {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState({});
  const [busy, setBusy] = useState({});
  const [errors, setErrors] = useState({});
  const pollTimers = useRef({});

  useEffect(() => () => {
    Object.values(pollTimers.current).forEach(clearInterval);
  }, []);

  const stopPolling = (providerId) => {
    if (pollTimers.current[providerId]) {
      clearInterval(pollTimers.current[providerId]);
      delete pollTimers.current[providerId];
    }
  };

  const handleComplete = async (providerId) => {
    stopPolling(providerId);
    setSessions((prev) => {
      const next = { ...prev };
      delete next[providerId];
      return next;
    });
    setBusy((prev) => ({ ...prev, [providerId]: false }));
    const data = await api.getSettings();
    onSettingsChange?.(data);
    await onModelsRefresh?.();
  };

  const startPolling = (providerId, sessionId) => {
    stopPolling(providerId);
    pollTimers.current[providerId] = setInterval(async () => {
      try {
        const status = await api.oauthStatus(providerId, sessionId);
        if (status.status === 'complete') {
          await handleComplete(providerId);
        } else if (status.status === 'error' || status.status === 'expired') {
          stopPolling(providerId);
          setErrors((prev) => ({
            ...prev,
            [providerId]: status.error || t('providers.oauth.authFailedOrExpired'),
          }));
          setBusy((prev) => ({ ...prev, [providerId]: false }));
        }
      } catch (err) {
        stopPolling(providerId);
        setErrors((prev) => ({ ...prev, [providerId]: err.message }));
        setBusy((prev) => ({ ...prev, [providerId]: false }));
      }
    }, POLL_MS);
  };

  const handleConnect = async (providerId) => {
    setErrors((prev) => ({ ...prev, [providerId]: null }));
    setBusy((prev) => ({ ...prev, [providerId]: true }));
    try {
      const result = await api.startOAuth(providerId);
      setSessions((prev) => ({ ...prev, [providerId]: result }));
      startPolling(providerId, result.session_id);
    } catch (err) {
      setErrors((prev) => ({ ...prev, [providerId]: err.message }));
      setBusy((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  const handleDisconnect = async (providerId) => {
    setErrors((prev) => ({ ...prev, [providerId]: null }));
    setBusy((prev) => ({ ...prev, [providerId]: true }));
    stopPolling(providerId);
    try {
      await api.disconnectOAuth(providerId);
      setSessions((prev) => {
        const next = { ...prev };
        delete next[providerId];
        return next;
      });
      const data = await api.getSettings();
      onSettingsChange?.(data);
      await onModelsRefresh?.();
    } catch (err) {
      setErrors((prev) => ({ ...prev, [providerId]: err.message }));
    } finally {
      setBusy((prev) => ({ ...prev, [providerId]: false }));
    }
  };

  const openVerification = (session) => {
    const url = session.verification_uri_complete || session.verification_uri;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="subsection" style={{ marginTop: '24px' }}>
      <h4>{t('providers.oauth.heading')}</h4>
      <p className="api-key-hint" style={{ marginBottom: '16px' }}>
        {t('providers.oauth.description')}
      </p>

      {OAUTH_PROVIDERS.map((provider) => {
        const connected = !!settings?.[provider.connectedKey];
        const session = sessions[provider.id];
        const isBusy = busy[provider.id];
        const error = errors[provider.id];
        const modelCount = (directAvailableModels || []).filter(
          (m) => m.source === provider.id || m.id?.startsWith(`${provider.id}:`)
        ).length;

        return (
          <div key={provider.id} className="api-key-section oauth-provider-section">
            <label>{provider.label}</label>
            <p className="api-key-hint" style={{ marginTop: 0, marginBottom: '10px' }}>
              {t(`providers.oauth.providerDescriptions.${provider.id}`, { defaultValue: provider.description })}
            </p>

            {connected && !session && (
              <div className="key-status set key-status-row">
                <span>
                  {t('providers.oauth.connected')}
                  {provider.id === 'github-copilot' && settings?.github_copilot_is_free_plan === true && (
                    <> {t('providers.oauth.freePlan')}</>
                  )}
                  {provider.id === 'github-copilot' && settings?.github_copilot_is_free_plan === false && (
                    <> {settings?.github_copilot_plan
                      ? t('providers.oauth.paidPlanNamed', { plan: settings.github_copilot_plan })
                      : t('providers.oauth.paidPlan')}</>
                  )}
                  {modelCount > 0 && ` ${t('providers.oauth.modelsAvailable', { count: modelCount })}`}
                </span>
                <button
                  type="button"
                  className="test-button danger"
                  onClick={() => handleDisconnect(provider.id)}
                  disabled={isBusy}
                >
                  {isBusy ? t('providers.oauth.disconnecting') : t('providers.disconnect')}
                </button>
              </div>
            )}

            {!connected && !session && (
              <button
                type="button"
                className="test-button"
                onClick={() => handleConnect(provider.id)}
                disabled={isBusy}
              >
                {isBusy ? t('providers.oauth.starting') : t('providers.connect')}
              </button>
            )}

            {session && (
              <div className="oauth-device-flow">
                <p className="oauth-instructions">
                  {t('providers.oauth.verificationInstructions')}
                </p>
                <div className="oauth-user-code ltr" dir="ltr">{session.user_code}</div>
                <div className="oauth-actions">
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => openVerification(session)}
                  >
                    {t('providers.oauth.openVerificationPage')}
                  </button>
                  <span className="oauth-waiting">{t('providers.oauth.waitingForAuth')}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="test-result error">{error}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
