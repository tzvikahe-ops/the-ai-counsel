import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function StageTimer({ startTime, endTime, label }) {
    const { t } = useTranslation();
    const [elapsed, setElapsed] = useState(0);
    const effectiveLabel = label ?? t('stageTimer.elapsed');

    useEffect(() => {
        if (!startTime) return;

        if (endTime) {
            setElapsed(endTime - startTime);
            return;
        }

        const interval = setInterval(() => {
            setElapsed(Date.now() - startTime);
        }, 100);

        return () => clearInterval(interval);
    }, [startTime, endTime]);

    if (!startTime) return null;

    const formatTime = (ms) => {
        const seconds = (ms / 1000).toFixed(1);
        return `${seconds}s`;
    };

    return (
        <span className="stage-timer" style={{
            marginInlineStart: '10px',
            fontSize: '12px',
            color: '#666',
            fontFamily: 'monospace'
        }}>
            {effectiveLabel}: <span className="ltr">{formatTime(elapsed)}</span>
        </span>
    );
}
