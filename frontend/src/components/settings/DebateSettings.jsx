import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DebateSettings({
    critiqueMode,
    setCritiqueMode,
    debateRounds,
    setDebateRounds,
    autoConverge,
    setAutoConverge,
    convergenceThreshold,
    setConvergenceThreshold,
    executionMode,
}) {
    const { t } = useTranslation();

    // Deliberation and Cost Meter helpers
    const getMeterInfo = (rounds) => {
        if (rounds === 1) {
            return {
                width: '20%',
                color: '#06b6d4',
                label: t('debate.meterSingle'),
                desc: t('debate.meterSingleDesc'),
            };
        } else if (rounds <= 3) {
            return {
                width: rounds === 2 ? '40%' : '60%',
                color: '#06b6d4',
                label: t('debate.meterBalanced', { n: rounds }),
                desc: t('debate.meterBalancedDesc'),
            };
        } else {
            return {
                width: rounds === 4 ? '80%' : '100%',
                color: '#f59e0b',
                label: t('debate.meterDeep', { n: rounds }),
                desc: t('debate.meterDeepDesc'),
            };
        }
    };

    const meter = getMeterInfo(debateRounds);

    return (
        <section className="debate-settings-section">
            <div className="debate-section-header">
                <div className="debate-title-wrapper">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="debate-title-icon">
                        <path d="M17 6.1H3" />
                        <path d="M21 12H3" />
                        <path d="M17 17.9H3" />
                    </svg>
                    <h3>{t('debate.heading')}</h3>
                </div>
                <p className="section-description">
                    {t('debate.description')} <em>{t('debate.note')}</em>
                </p>
            </div>

            <div className="settings-group debate-settings-group">
                <div className="debate-group-title">
                    <h4>{t('debate.critiqueMode')}</h4>
                    <span className="debate-helper-badge">{t('debate.deliberationProtocol')}</span>
                </div>

                <div className="debate-card-stack">
                    {/* Freeform Card */}
                    <div 
                        className={`debate-mode-list-card ${critiqueMode === 'freeform' ? 'active' : ''}`}
                        onClick={() => setCritiqueMode('freeform')}
                    >
                        <div className="debate-card-header">
                            <div className="debate-card-title-block">
                                <span className="debate-card-icon-wrapper freeform-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                </span>
                                <div className="debate-card-title-text">
                                    <h5>{t('debate.freeformTitle')}</h5>
                                    <p className="debate-card-concept">{t('debate.freeformConcept')}</p>
                                </div>
                            </div>
                            <span className="debate-badge fastest">{t('debate.freeformBadge')}</span>
                        </div>

                        <div className="debate-card-details">
                            <ul className="debate-details-list">
                                <li>
                                    <span className="bullet-label">{t('debate.freeformR1')}</span> {t('debate.freeformR1Desc')}
                                </li>
                                <li>
                                    <span className="bullet-label">{t('debate.freeformR2')}</span> {t('debate.freeformR2Desc')}
                                </li>
                                <li>
                                    <span className="bullet-label">{t('debate.freeformBest')}</span> {t('debate.freeformBestDesc')}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Paragraph-level Card */}
                    <div 
                        className={`debate-mode-list-card ${critiqueMode === 'paragraph' ? 'active' : ''}`}
                        onClick={() => setCritiqueMode('paragraph')}
                    >
                        <div className="debate-card-header">
                            <div className="debate-card-title-block">
                                <span className="debate-card-icon-wrapper paragraph-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="21" y1="6" x2="9" y2="6" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                        <line x1="21" y1="18" x2="9" y2="18" />
                                        <rect x="3" y="5" width="2" height="2" />
                                        <rect x="3" y="11" width="2" height="2" />
                                        <rect x="3" y="17" width="2" height="2" />
                                    </svg>
                                </span>
                                <div className="debate-card-title-text">
                                    <h5>{t('debate.paragraphTitle')}</h5>
                                    <p className="debate-card-concept">{t('debate.paragraphConcept')}</p>
                                </div>
                            </div>
                            <span className="debate-badge balanced">{t('debate.paragraphBadge')}</span>
                        </div>

                        <div className="debate-card-details">
                            <ul className="debate-details-list">
                                <li>
                                    <span className="bullet-label">{t('debate.freeformR1')}</span> {t('debate.paragraphR1Desc')}
                                </li>
                                <li>
                                    <span className="bullet-label">{t('debate.freeformR2')}</span> {t('debate.paragraphR2Desc')}
                                </li>
                                <li>
                                    <span className="bullet-label">{t('debate.freeformBest')}</span> {t('debate.paragraphBestDesc')}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Claim-level Card */}
                    <div 
                        className={`debate-mode-list-card ${critiqueMode === 'claim' ? 'active' : ''}`}
                        onClick={() => setCritiqueMode('claim')}
                    >
                        <div className="debate-card-header">
                            <div className="debate-card-title-block">
                                <span className="debate-card-icon-wrapper claim-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        <path d="m9 11 2 2 4-4" />
                                    </svg>
                                </span>
                                <div className="debate-card-title-text">
                                    <h5>{t('debate.claimTitle')}</h5>
                                    <p className="debate-card-concept">{t('debate.claimConcept')}</p>
                                </div>
                            </div>
                            <span className="debate-badge rigorous">{t('debate.claimBadge')}</span>
                        </div>

                        <div className="debate-card-details">
                            <ul className="debate-details-list">
                                <li>
                                    <span className="bullet-label">{t('debate.claimBefore')}</span> {t('debate.claimBeforeDesc')}
                                </li>
                                <li>
                                    <span className="bullet-label">{t('debate.freeformR2')}</span> {t('debate.claimR2Desc')}
                                </li>
                                <li>
                                    <span className="bullet-label">{t('debate.freeformBest')}</span> {t('debate.claimBestDesc')}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Number of Rounds */}
                <div className="debate-rounds-section" style={{ marginTop: '32px' }}>
                    <div className="debate-group-title">
                        <h4>{t('debate.roundsHeading')}</h4>
                        <span className="debate-helper-badge">{t('debate.deliberationDepth')}</span>
                    </div>

                    <div className="rounds-segmented-bar">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                className={`rounds-step-btn ${debateRounds === n ? 'active' : ''}`}
                                onClick={() => setDebateRounds(n)}
                            >
                                <span className="rounds-step-number ltr">{n}</span>
                                <span className="rounds-step-label">
                                    {n === 1 ? t('debate.singlePass') : t('debate.rounds', { n })}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Deliberation & Cost Meter */}
                    <div className="cost-meter-container">
                        <div className="cost-meter-header">
                            <span className="cost-meter-title">{meter.label}</span>
                            <span className="cost-meter-percentage">{debateRounds === 1 ? t('debate.lowCost') : debateRounds <= 3 ? t('debate.balanced') : t('debate.highCost')}</span>
                        </div>
                        <div className="cost-meter-track">
                            <div 
                                className="cost-meter-fill animate-width" 
                                style={{ 
                                    width: meter.width, 
                                    backgroundColor: meter.color,
                                    boxShadow: `0 0 10px ${meter.color}40`
                                }}
                            />
                        </div>
                        <p className="cost-meter-description">{meter.desc}</p>
                    </div>
                </div>

                {/* Warnings / Multi-round Drawer */}
                {debateRounds > 1 ? (
                    <div className="convergence-drawer-container">
                        <div className="convergence-card">
                            <div
                                className="convergence-toggle-row"
                                onClick={() => setAutoConverge(!autoConverge)}
                            >
                                <div className="convergence-toggle-left">
                                    <div className="premium-checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            id="autoConvergeToggle"
                                            className="premium-checkbox"
                                            checked={autoConverge}
                                            onChange={(e) => setAutoConverge(e.target.checked)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <label
                                            htmlFor="autoConvergeToggle"
                                            className="premium-checkbox-label"
                                            onClick={(e) => e.stopPropagation()}
                                        ></label>
                                    </div>
                                    <div className="convergence-toggle-text">
                                        <h5>{t('debate.autoConverge')}</h5>
                                        <p className="convergence-toggle-hint">{t('debate.autoConvergeHint')}</p>
                                    </div>
                                </div>
                            </div>

                            {autoConverge && (
                                <div className="convergence-threshold-section animate-slide-down">
                                    <span className="convergence-threshold-label">{t('debate.requiredStableRounds')}</span>
                                    <div className="threshold-segmented-bar">
                                        {[1, 2, 3].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                className={`threshold-btn ${convergenceThreshold === n ? 'active' : ''}`}
                                                onClick={() => setConvergenceThreshold(n)}
                                            >
                                                {n > 1 ? t('debate.stableRoundsN', { n }) : t('debate.stableRound', { n })}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="setting-hint threshold-hint">
                                        {t('debate.thresholdHint', { n: convergenceThreshold })}
                                    </p>
                                </div>
                            )}
                        </div>

                        {executionMode === 'chat_only' && (
                            <div className="debate-warning-banner">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="warning-banner-icon">
                                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                <span>{t('debate.warnNotActive')} <strong>{t('executionMode.chatRanking')}</strong> {t('debate.warnNotActive2')} <strong>{t('executionMode.fullDeliberation')}</strong> {t('debate.warnNotActive3')}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    executionMode !== 'chat_only' ? null : (
                        <div className="debate-warning-banner" style={{ marginTop: '20px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="warning-banner-icon">
                                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <span>{t('debate.warnChatOnly')} <strong>{t('executionMode.chatOnly')}</strong>{t('debate.warnChatOnly2')}</span>
                        </div>
                    )
                )}
            </div>
        </section>
    );
}
