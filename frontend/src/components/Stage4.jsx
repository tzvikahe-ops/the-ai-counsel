import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Skeleton from './common/Skeleton';
import { getModelVisuals, getShortModelName } from '../utils/modelHelpers';
import ThinkBlockRenderer from './ThinkBlockRenderer';
import StageTimer from './StageTimer';
import { copyToClipboard } from '../utils/clipboard';
import './Stage4.css';

/** Highlight [REVISED: ...] and [NEW: ...] markers for visual scanning */
function highlightRevisionMarkers(text) {
    if (!text) return text;
    return text
        .replace(/\[REVISED[:\s]*/gi, '**🔶 REVISED:** *')
        .replace(/\[NEW[:\s]*/gi, '**🟢 NEW:** *')
        .replace(/(?<=\*)(\.?\])/g, '*');
}

export default function Stage4({ correctedDraft, startTime, endTime }) {
    const { t } = useTranslation();
    const [isCopied, setIsCopied] = useState(false);

    if (!correctedDraft) return null;

    const visuals = getModelVisuals(correctedDraft?.model);
    const shortName = getShortModelName(correctedDraft?.model);

    const handleCopy = async () => {
        const textToCopy = typeof correctedDraft?.response === 'string'
            ? correctedDraft.response
            : String(correctedDraft?.response || '');
        if (!textToCopy) return;
        const copied = await copyToClipboard(textToCopy);
        if (copied) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="stage-container stage-4">
            <div className="stage-header">
                <div className="stage-title">
                    <span className="stage-icon">📝</span>
                    {t('stage4.title')}
                </div>
                <StageTimer startTime={startTime} endTime={endTime} label={t('stage4.duration')} />
            </div>
            <p className="stage-4-description">
                {t('stage4.description')}
            </p>
            <div className="corrected-draft-response">
                <div className="corrected-draft-header">
                    <div className="corrected-draft-identity">
                        <span className="corrected-draft-avatar" style={{ backgroundColor: visuals.color }}>
                            {visuals.icon}
                        </span>
                        <div className="corrected-draft-info">
                            <span className="corrected-draft-role">
                                <span>📝</span> {t('stage4.draftLabel')}
                            </span>
                            <span className="corrected-draft-model ltr">{shortName}</span>
                            <span className="corrected-draft-provider-badge ltr">{visuals.name}</span>
                        </div>
                    </div>
                    <button
                        className={`copy-button ${isCopied ? 'copied' : ''}`}
                        onClick={handleCopy}
                        title={t('stage4.copyTitle')}
                    >
                        {isCopied ? (
                            <><span className="icon">✓</span><span className="label">{t('stage4.copied')}</span></>
                        ) : (
                            <><span className="icon">📋</span><span className="label">{t('stage4.copy')}</span></>
                        )}
                    </button>
                </div>
                <div className="corrected-draft-text markdown-content">
                    <ThinkBlockRenderer
                        content={highlightRevisionMarkers(
                            typeof correctedDraft?.response === 'string'
                                ? correctedDraft.response
                                : String(correctedDraft?.response || t('stage4.noDraft'))
                        )}
                    />
                </div>
            </div>
        </div>
    );
}

export function Stage4Skeleton() {
    const { t } = useTranslation();
    return (
        <div className="stage-container stage-4 skeleton-mode">
            <div className="stage-header">
                <div className="stage-title">
                    <span className="stage-icon">📝</span>
                    {t('stage4.title')}
                </div>
                <div className="stage-timer-skeleton"><Skeleton variant="text" width="60px" /></div>
            </div>
            <div className="stage-4-description">
                <Skeleton variant="text" width="80%" />
            </div>
            <div className="corrected-draft-response">
                <div className="corrected-draft-header">
                    <div className="corrected-draft-identity">
                        <Skeleton variant="avatar" />
                        <div style={{ gap: '4px', display: 'flex', flexDirection: 'column' }}>
                            <Skeleton variant="text" width="140px" height="1.2em" />
                            <Skeleton variant="text" width="100px" height="0.8em" />
                        </div>
                    </div>
                </div>
                <div className="corrected-draft-text" style={{ marginTop: '16px' }}>
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="95%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="97%" />
                    <br />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="88%" />
                </div>
            </div>
        </div>
    );
}
