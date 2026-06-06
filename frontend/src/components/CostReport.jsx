import { useTranslation } from 'react-i18next';
import './CostReport.css';
import { formatUsd } from '../utils/formatCost';

const numberFormatter = new Intl.NumberFormat(undefined);

function formatTokens(value) {
  if (typeof value !== 'number') return '0';
  return numberFormatter.format(value);
}

export default function CostReport({ report, title }) {
  const { t } = useTranslation();
  const effectiveTitle = title || t('costReport.runCost');

  if (!report || !Array.isArray(report.by_model) || report.by_model.length === 0) {
    return null;
  }

  const formatTokenBreakdown = (item) =>
    t('costReport.tokenBreakdown', {
      input: formatTokens(item.input_tokens),
      output: formatTokens(item.output_tokens),
    });

  const rowCostLabel = (row) =>
    formatUsd(row.total_cost, row.known_cost_calls === 0 && row.unknown_cost_calls > 0);

  const rowStatus = (row) => {
    if (row.free_calls === row.calls) return { key: 'free', label: t('costReport.rowFree') };
    if (row.unknown_cost_calls > 0 && row.known_cost_calls === 0)
      return { key: 'usage-only', label: t('costReport.rowUsageOnly') };
    if (row.estimated_calls > 0) return { key: 'estimated', label: t('costReport.rowEstimated') };
    return { key: 'known', label: t('costReport.rowKnown') };
  };

  const unknownTotal = report.known_cost_calls === 0 && report.unknown_cost_calls > 0;
  const statusText = report.has_unknown_costs
    ? t('costReport.statusUnknown')
    : report.has_estimates
      ? t('costReport.statusEstimated')
      : t('costReport.statusKnown');

  return (
    <section className="cost-report" aria-label={effectiveTitle}>
      <div className="cost-report__summary">
        <div>
          <div className="cost-report__eyebrow">{effectiveTitle}</div>
          <div className="cost-report__total ltr">{formatUsd(report.total_cost, unknownTotal)}</div>
        </div>
        <div className="cost-report__metrics" aria-label={t('costReport.ariaLabel')}>
          <span title={t('costReport.totalTokensTooltip')}>
            <span className="ltr">{formatTokens(report.total_tokens)}</span> {t('costReport.totalTokensSuffix')}
          </span>
          <span title={t('costReport.inputTokensTooltip')}>
            <span className="ltr">{formatTokens(report.input_tokens)}</span> {t('costReport.tokensIn')}
          </span>
          <span title={t('costReport.outputTokensTooltip')}>
            <span className="ltr">{formatTokens(report.output_tokens)}</span> {t('costReport.tokensOut')}
          </span>
          <span><span className="ltr">{report.total_calls || 0}</span> {t('costReport.calls')}</span>
          <span className={`cost-report__status ${report.has_unknown_costs ? 'unknown' : report.has_estimates ? 'estimated' : 'known'}`}>
            {statusText}
          </span>
        </div>
      </div>

      <details className="cost-report__details">
        <summary>{t('costReport.modelBreakdown')}</summary>
        <div className="cost-report__table" role="table" aria-label={t('costReport.byModelAria')}>
          <div className="cost-report__row cost-report__row--head" role="row">
            <span role="columnheader">{t('costReport.colModel')}</span>
            <span role="columnheader">{t('costReport.colCalls')}</span>
            <span role="columnheader">{t('costReport.colTokens')}</span>
            <span role="columnheader">{t('costReport.colCost')}</span>
            <span role="columnheader">{t('costReport.colStatus')}</span>
          </div>
          {report.by_model.map((row) => {
            const status = rowStatus(row);
            return (
              <div className="cost-report__row" role="row" key={row.name}>
                <span className="cost-report__model ltr" role="cell" title={row.name}>{row.name}</span>
                <span role="cell" className="ltr">{row.calls || 0}</span>
                <span className="cost-report__tokens" role="cell" title={formatTokenBreakdown(row)}>
                  <span className="ltr">{formatTokens(row.total_tokens)}</span>
                  <small>{formatTokenBreakdown(row)}</small>
                </span>
                <span role="cell" className="ltr">{rowCostLabel(row)}</span>
                <span role="cell" className={`cost-report__source ${status.key}`}>
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      </details>
    </section>
  );
}
