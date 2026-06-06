import React from 'react';
import { useTranslation } from 'react-i18next';
import { getShortModelName } from '../utils/modelHelpers';
import { localizePersona } from '../utils/personaHelpers';
import './AdvisorGrid.css';

export default function AdvisorGrid({
  personas = [],
  activePersonaId = null,
  round = 1,
  maxRounds = 3,
  isRunning = false,
}) {
  const { t } = useTranslation();
  if (!personas || personas.length === 0) return null;
  const displayPersonas = personas.map((p) => localizePersona(p, t));

  return (
    <div className="advisor-grid-wrapper">
      <div className="advisor-round-indicator">
        {t('advisorGrid.roundOfMax', { current: round, max: maxRounds })}
      </div>
      <div className="advisor-grid">
        {displayPersonas.map((persona) => {
          const isActive = persona.id === activePersonaId;

          let cardState = 'idle';
          if (isActive) {
            cardState = 'thinking';
          } else if (isRunning) {
            cardState = 'waiting';
          }

          return (
            <div
              key={persona.id}
              className={`advisor-card advisor-card--${cardState}`}
              style={{ '--persona-color': persona.color }}
            >
              <div className="advisor-avatar-wrap">
                <div
                  className="advisor-avatar"
                  style={{ backgroundColor: persona.color + '26' }}
                >
                  <span className="advisor-emoji">{persona.avatar_emoji}</span>
                  {cardState === 'thinking' && (
                    <div
                      className="advisor-thinking-ring"
                      style={{ borderColor: persona.color }}
                    />
                  )}
                  {!isRunning && !isActive && round > 1 && (
                    <div className="advisor-done-badge">✓</div>
                  )}
                </div>
              </div>
              <div className="advisor-info">
                <span className="advisor-name">{persona.name}</span>
                <span className="advisor-role">{persona.role}</span>
                {persona.model && (
                  <span className="advisor-model ltr">{getShortModelName(persona.model)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

