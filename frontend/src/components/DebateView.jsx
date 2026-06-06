import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AdvisorGrid from './AdvisorGrid';
import MarkdownContent from './MarkdownContent';
import { getShortModelName } from '../utils/modelHelpers';
import { localizePersona } from '../utils/personaHelpers';
import CostReport from './CostReport';
import { copyToClipboard } from '../utils/clipboard';
import './DebateView.css';

const toStr = (v) => (typeof v === 'string' ? v : String(v || ''));

function getLocalAdvisorError(err, t) {
  if (!err) return '';
  const errStr = typeof err === 'string' ? err : String(err);
  if (errStr === 'No advisor model configured. Set a default model in Settings.') {
    return t('debateView.errors.noModelConfigured');
  }
  if (errStr === 'Rounds must be between 3 and 10.') {
    return t('debateView.errors.roundsRange');
  }
  if (errStr === 'At least 2 valid advisors required.') {
    return t('debateView.errors.minAdvisors');
  }
  if (errStr.startsWith('Cross-pollination extract failed after Round')) {
    const match = errStr.match(/Round (\d+): (.*)/);
    if (match) {
      return t('debateView.errors.crossPollinationFailed', { round: match[1], error: match[2] });
    }
  }
  return errStr;
}

function findPersona(personas, id) {
  return personas.find((p) => p.id === id) || null;
}

function RoundSection({ roundIndex, roundData, personas, isLast, isRunning }) {
  const { t } = useTranslation();
  const responses = roundData.responses || [];
  const displayPersonas = personas.map((p) => localizePersona(p, t));

  return (
    <div className="debate-view__round">
      <div className="debate-view__round-header">
        <span className="debate-view__round-label">{t('debateView.round', { n: roundIndex + 1 })}</span>
        <div className="debate-view__round-divider" />
      </div>

      <div className="debate-view__round-cards">
        {responses.map((resp, idx) => {
          const persona = findPersona(displayPersonas, resp.persona_id);
          const hasError = !!resp.error;
          const hasWarning = !hasError && !!(resp.warning || resp.word_limit_exceeded);
          const displayName = persona?.name || resp.persona_name || resp.persona_id || t('stage1.unknownModel');
          const displayEmoji = persona?.avatar_emoji || '🤖';
          const displayRole = persona?.role || '';
          const displayColor = persona?.color || '#64748b';

          return (
            <div
              key={resp.persona_id || idx}
              className="debate-view__response-card"
              style={{ '--persona-color': displayColor }}
            >
              <div className="debate-view__response-header">
                <span className="debate-view__response-emoji">
                  {displayEmoji}
                </span>
                <div className="debate-view__response-meta">
                  <span className="debate-view__response-name">
                    {displayName}
                  </span>
                  <span className="debate-view__response-role">
                    {displayRole}
                  </span>
                  {resp.model && (
                    <span className="debate-view__response-model ltr">
                      {getShortModelName(resp.model)}
                    </span>
                  )}
                </div>
                {hasError && (
                  <span className="debate-view__response-error-badge">{t('debateView.error')}</span>
                )}
                {hasWarning && (
                  <span className="debate-view__response-warning-badge">{t('debateView.long')}</span>
                )}
              </div>
              <div className="debate-view__response-body">
                {hasError ? (
                  <div className="debate-view__response-error">
                    <span>⚠️</span>
                    <div className="debate-view__response-error-detail">
                      <span>{getLocalAdvisorError(resp.error, t) || t('debateView.responseFailed')}</span>
                      {resp.model && (
                        <span className="debate-view__response-error-model">{t('debateView.model')} <span className="ltr">{resp.model}</span></span>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    {hasWarning && (
                      <div className="debate-view__response-warning">
                        <span>{t('debateView.wordGuidance')}</span>
                        {resp.word_count && resp.word_limit && (
                          <span className="ltr">{t('debateView.wordsRatio', { count: resp.word_count, limit: resp.word_limit })}</span>
                        )}
                      </div>
                    )}
                    <MarkdownContent>{toStr(resp.content)}</MarkdownContent>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Consensus / round transition banner */}
      {isLast && isRunning ? (
        <div className="debate-view__next-round-banner">
          <span className="debate-view__next-round-dot" />
          {t('debateView.nextRoundStarting')}
        </div>
      ) : responses.length > 0 && !isRunning ? (
        <div className="debate-view__consensus-banner">
          {responses.every((r) => !r.error)
            ? t('debateView.allCompleted')
            : t('debateView.someErrors')}
        </div>
      ) : null}
    </div>
  );
}

export default function DebateView({
  personas = [],
  rounds = [],
  verdict = null,
  tiebreaker = null,
  currentRound = 1,
  maxRounds = 3,
  isRunning = false,
  phase = null,
  question = '',
  webSearch = null,
  error = null,
  costReport = null,
}) {
  const { t } = useTranslation();
  const [verdictCopied, setVerdictCopied] = useState(false);

  const activePersonaId = useMemo(() => {
    if (!isRunning) return null;
    const currentRoundData = rounds[currentRound - 1];
    const responded = new Set((currentRoundData?.responses || []).map((resp) => resp.persona_id));
    const order = currentRoundData?.order?.length
      ? currentRoundData.order
      : personas.map((persona) => persona.id);
    return order.find((personaId) => !responded.has(personaId)) || null;
  }, [isRunning, rounds, currentRound, personas]);

  const handleCopyVerdict = async () => {
    if (!verdict?.content) return;
    const copied = await copyToClipboard(toStr(verdict.content));
    if (copied) {
      setVerdictCopied(true);
      setTimeout(() => setVerdictCopied(false), 2000);
    }
  };

  const hasResponses = rounds.some((r) => (r.responses || []).length > 0);
  const showDebateStarting = isRunning && !hasResponses;
  const currentRoundData = rounds[currentRound - 1] || rounds[rounds.length - 1] || null;
  const currentResponseCount = currentRoundData?.responses?.length || 0;
  const expectedResponseCount = currentRoundData?.order?.length || personas.length || 0;
  const livePhase = phase || (isRunning ? 'round' : 'complete');
  const liveTitle = (() => {
    if (livePhase === 'search') return t('debateView.searching');
    if (livePhase === 'tiebreaker') return t('debateView.tiebreakerPhase');
    if (livePhase === 'verdict') return t('debateView.verdictPhase');
    if (livePhase === 'round_complete') return t('debateView.preparingNext');
    if (livePhase === 'initializing') return t('debateView.initializing');
    return t('debateView.roundInProgress', { n: currentRound });
  })();
  const liveDetail = expectedResponseCount > 0
    ? t('debateView.advisorsResponded', { current: currentResponseCount, total: expectedResponseCount })
    : t('debateView.preparingPanel');

  return (
    <div className="debate-view">
      {isRunning && (
        <div className="debate-view__live-status" role="status" aria-live="polite">
          <span className="debate-view__live-dot" aria-hidden="true" />
          <div className="debate-view__live-copy">
            <strong>{liveTitle}</strong>
            <span>{liveDetail}</span>
          </div>
        </div>
      )}

      {/* Advisor Grid - always shown at top */}
      <AdvisorGrid
        personas={personas}
        activePersonaId={activePersonaId}
        round={currentRound}
        maxRounds={maxRounds}
        isRunning={isRunning}
      />

      {/* Question echo */}
      {question && (
        <div className="debate-view__question">
          <div className="debate-view__question-top">
            <span className="debate-view__question-label">{t('debateView.debating')}</span>
            {webSearch && (
              <span className={`debate-view__search-badge ${showDebateStarting ? 'debate-view__search-badge--searching' : ''}`}>
                {showDebateStarting ? t('debateView.searchingWeb') : t('debateView.webIncluded')}
              </span>
            )}
          </div>
          <p className="debate-view__question-text">{question}</p>
        </div>
      )}

      {/* Live indicator - before any responses arrive */}
      {showDebateStarting && (
        <div className="debate-view__starting">
          <span className="debate-view__starting-spinner" aria-hidden="true" />
          {t('debateView.debateStarting')}
        </div>
      )}

      <CostReport report={costReport} title={t('debateView.advisorCost')} />

      {/* Error banner - shown when the debate fails */}
      {error && (
        <div className="debate-view__error">
          <span className="debate-view__error-icon">⚠️</span>
          <div className="debate-view__error-content">
            <strong>{t('debateView.debateFailed')}</strong>
            <p>{getLocalAdvisorError(error, t)}</p>
          </div>
        </div>
      )}

      {/* Round sections */}
      {rounds.map((roundData, idx) => {
        const hasContent = (roundData.responses || []).length > 0;
        if (!hasContent) return null;
        return (
          <RoundSection
            key={idx}
            roundIndex={idx}
            roundData={roundData}
            personas={personas}
            isLast={idx === rounds.length - 1}
            isRunning={isRunning}
          />
        );
      })}

      {/* Tiebreaker section */}
      {tiebreaker && tiebreaker.content && (
        <div className="debate-view__tiebreaker">
          <div className="debate-view__tiebreaker-header">
            <span className="debate-view__tiebreaker-icon">🔀</span>
            <span className="debate-view__tiebreaker-title">{t('debateView.tiebreaker')}</span>
            {tiebreaker.model && (
              <span className="debate-view__tiebreaker-model ltr">{tiebreaker.model}</span>
            )}
          </div>
          <MarkdownContent>{toStr(tiebreaker.content)}</MarkdownContent>
        </div>
      )}

      {/* Verdict section */}
      {verdict && verdict.content && (
        <div className={`debate-view__verdict ${verdict.error ? 'debate-view__verdict--error' : ''}`}>
          <div className="debate-view__verdict-header">
            <div className="debate-view__verdict-title-row">
              <span className="debate-view__verdict-icon">
                {verdict.error ? '⚠️' : '📋'}
              </span>
              <span className="debate-view__verdict-title">
                {verdict.error ? t('debateView.verdictError') : t('debateView.verdict')}
              </span>
              {verdict.model && (
                <span className="debate-view__verdict-model ltr">{verdict.model}</span>
              )}
            </div>
            {!verdict.error && (
              <button
                className={`debate-view__copy-btn ${verdictCopied ? 'debate-view__copy-btn--copied' : ''}`}
                onClick={handleCopyVerdict}
                type="button"
                title={t('debateView.copyVerdict')}
              >
                {verdictCopied ? (
                  <>
                    <span>✓</span>
                    <span>{t('debateView.copied')}</span>
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    <span>{t('debateView.copy')}</span>
                  </>
                )}
              </button>
            )}
          </div>
          <MarkdownContent className="debate-view__verdict-body">
            {toStr(verdict.content)}
          </MarkdownContent>
        </div>
      )}
    </div>
  );
}
