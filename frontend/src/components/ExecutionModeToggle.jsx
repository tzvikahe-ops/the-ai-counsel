import { useTranslation } from 'react-i18next';
import './ExecutionModeToggle.css';

export default function ExecutionModeToggle({ value, onChange, disabled, chairmanModel }) {
    const { t } = useTranslation();
    const hasChairman = !!(chairmanModel && chairmanModel.trim());

    const modes = [
        { id: 'chat_only', labelKey: 'executionMode.chatOnly', icon: '💬' },
        { id: 'chat_ranking', labelKey: 'executionMode.chatRanking', icon: '⚖️' },
        { id: 'full', labelKey: 'executionMode.fullDeliberation', icon: '🏛️', needsChairman: true }
    ];

    return (
        <div className="execution-mode-toggle" role="radiogroup" aria-label={t('executionMode.ariaLabel')}>
            {modes.map(mode => {
                const locked = mode.needsChairman && !hasChairman;
                const isDisabled = disabled || locked;
                const label = t(mode.labelKey);
                return (
                    <button
                        key={mode.id}
                        type="button"
                        role="radio"
                        aria-checked={value === mode.id}
                        className={`mode-option ${value === mode.id ? 'active' : ''} ${locked ? 'locked' : ''}`}
                        onClick={() => !isDisabled && onChange(mode.id)}
                        disabled={isDisabled}
                        title={locked ? t('executionMode.needsChairman') : label}
                    >
                        <span className="mode-icon">{mode.icon}</span>
                        <span className="mode-label">{label}</span>
                    </button>
                );
            })}
        </div>
    );
}
