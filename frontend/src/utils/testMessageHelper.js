/**
 * Translates test results and error messages returned by the backend or UI.
 *
 * @param {string} msg - The message to translate
 * @param {Function} t - The translation function (from useTranslation)
 * @returns {string} The localized message
 */
export function getLocalTestMessage(msg, t) {
  if (!msg) return '';
  if (msg === 'API key is valid') return t('settingsShell.errors.apiKeyValid');
  if (msg === 'Invalid API key') return t('settingsShell.errors.invalidApiKey');
  if (msg === 'Request timed out') return t('settingsShell.errors.requestTimedOut');
  if (msg === 'Connection failed') return t('settingsShell.errors.connectionFailed');
  if (msg === 'No API key provided or configured') return t('settingsShell.errors.noApiKey');
  if (msg === 'Successfully connected to Ollama') return t('settingsShell.errors.ollamaConnected');
  if (msg === 'Please enter an API key first') return t('settingsShell.errors.enterApiKeyFirst');
  if (msg === 'Please enter a name and URL') return t('settingsShell.errors.enterNameUrl');
  if (msg === 'Test failed') return t('settingsShell.errors.testFailed');
  if (msg === 'Import failed') return t('settingsShell.errors.importFailed');

  if (msg.startsWith('API error:')) {
    const code = msg.replace('API error:', '').trim();
    return t('settingsShell.errors.apiError', { code });
  }
  if (msg.startsWith('Ollama API error:')) {
    const code = msg.replace('Ollama API error:', '').trim();
    return t('settingsShell.errors.ollamaApiError', { code });
  }
  if (msg.includes('Could not connect to Ollama. Is it running at this URL?')) {
    return t('settingsShell.errors.ollamaConnectError');
  }
  if (msg.includes('Could not connect to Ollama. Is it running?')) {
    return t('settingsShell.errors.ollamaConnectError');
  }

  // OpenCode composite message mapping:
  // e.g. "✓ Zen · ✗ Go - Invalid API key"
  if (msg.includes('Zen') && msg.includes('Go')) {
    const parts = msg.split(' - ');
    if (parts.length > 1) {
      const prefix = parts[0];
      const statusPart = parts[1];
      return `${prefix} - ${getLocalTestMessage(statusPart, t)}`;
    }
  }

  return msg;
}
