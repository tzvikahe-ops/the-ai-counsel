import { useTranslation } from 'react-i18next';

const COUNCIL_PROMPTS = [
  {
    id: 'stage1',
    key: 'stage1_prompt',
    labelKey: 'prompts.council.stage1Label',
    headingKey: 'prompts.council.stage1Heading',
    descriptionKey: 'prompts.council.stage1Description',
    variables: ['user_query', 'search_context_block'],
  },
  {
    id: 'stage2',
    key: 'stage2_prompt',
    labelKey: 'prompts.council.stage2Label',
    headingKey: 'prompts.council.stage2Heading',
    descriptionKey: 'prompts.council.stage2Description',
    variables: ['user_query', 'responses_text', 'search_context_block'],
  },
  {
    id: 'stage3',
    key: 'stage3_prompt',
    labelKey: 'prompts.council.stage3Label',
    headingKey: 'prompts.council.stage3Heading',
    descriptionKey: 'prompts.council.stage3Description',
    variables: ['user_query', 'stage1_responses', 'rankings_text', 'search_context_block'],
  },
  {
    id: 'stage4',
    key: 'stage4_prompt',
    labelKey: 'prompts.council.stage4Label',
    headingKey: 'prompts.council.stage4Heading',
    descriptionKey: 'prompts.council.stage4Description',
    variables: ['total_rounds', 'original_text', 'verdict_text'],
  },
  {
    id: 'title',
    key: 'title_prompt',
    labelKey: 'prompts.council.titleLabel',
    headingKey: 'prompts.council.titleHeading',
    descriptionKey: 'prompts.council.titleDescription',
    variables: ['user_query'],
  },
  {
    id: 'query',
    key: 'query_prompt',
    labelKey: 'prompts.council.queryLabel',
    headingKey: 'prompts.council.queryHeading',
    descriptionKey: 'prompts.council.queryDescription',
    variables: ['user_query'],
  },
];

const ADVISOR_PROMPTS = [
  {
    id: 'advisor_round1',
    key: 'advisor_round1_prompt',
    labelKey: 'prompts.advisor.round1Label',
    headingKey: 'prompts.advisor.round1Heading',
    descriptionKey: 'prompts.advisor.round1Description',
    variables: ['search_context_block', 'question', 'consensus_tag'],
  },
  {
    id: 'advisor_followup',
    key: 'advisor_followup_prompt',
    labelKey: 'prompts.advisor.followupLabel',
    headingKey: 'prompts.advisor.followupHeading',
    descriptionKey: 'prompts.advisor.followupDescription',
    variables: [
      'search_context_block',
      'question',
      'transcript',
      'round_number',
      'previous_round_number',
      'cross_pollination_extract',
      'consensus_tag',
    ],
  },
  {
    id: 'advisor_extract',
    key: 'advisor_cross_pollination_prompt',
    labelKey: 'prompts.advisor.extractLabel',
    headingKey: 'prompts.advisor.extractHeading',
    descriptionKey: 'prompts.advisor.extractDescription',
    variables: ['question', 'round_number', 'round_transcript'],
  },
  {
    id: 'advisor_verdict',
    key: 'advisor_verdict_prompt',
    labelKey: 'prompts.advisor.verdictLabel',
    headingKey: 'prompts.advisor.verdictHeading',
    descriptionKey: 'prompts.advisor.verdictDescription',
    variables: ['question', 'transcript', 'debate_arc'],
  },
  {
    id: 'advisor_tiebreaker',
    key: 'advisor_tiebreaker_prompt',
    labelKey: 'prompts.advisor.tiebreakerLabel',
    headingKey: 'prompts.advisor.tiebreakerHeading',
    descriptionKey: 'prompts.advisor.tiebreakerDescription',
    variables: ['question', 'transcript'],
  },
];

export default function PromptSettings({
  variant = 'council',
  prompts,
  handlePromptChange,
  handleResetPrompt,
  activePromptTab,
  setActivePromptTab,
}) {
  const { t } = useTranslation();
  const promptConfigs = variant === 'advisor' ? ADVISOR_PROMPTS : COUNCIL_PROMPTS;
  const activeConfig = promptConfigs.find(prompt => prompt.id === activePromptTab) || promptConfigs[0];
  const sectionTitle = variant === 'advisor' ? t('prompts.advisorHeading') : t('prompts.councilHeading');
  const sectionDescription = variant === 'advisor'
    ? t('prompts.advisorDescription')
    : t('prompts.councilDescription');
  const textAreaRows = variant === 'advisor' ? 18 : 20;

  return (
    <section>
      <h3>{sectionTitle}</h3>
      <p className="section-description">{sectionDescription}</p>

      <div className="prompts-tabs">
        {promptConfigs.map(prompt => (
          <button
            key={prompt.id}
            type="button"
            className={`prompt-tab ${activeConfig.id === prompt.id ? 'active' : ''}`}
            onClick={() => setActivePromptTab(prompt.id)}
          >
            {t(prompt.labelKey)}
          </button>
        ))}
      </div>

      <div className="prompt-content">
        <label htmlFor={`${activeConfig.id}-prompt`}>{t(activeConfig.headingKey)}</label>
        <p className="prompt-help">
          {t(activeConfig.descriptionKey)}
          <span>{t('prompts.availableVariables')}</span>
          {activeConfig.variables.map(variable => (
            <code key={variable} className="ltr">{`{${variable}}`}</code>
          ))}
        </p>
        <textarea
          id={`${activeConfig.id}-prompt`}
          value={prompts[activeConfig.key] || ''}
          onChange={(event) => handlePromptChange(activeConfig.key, event.target.value)}
          rows={textAreaRows}
          spellCheck={false}
          className="ltr"
          dir="ltr"
        />
        <button
          type="button"
          className="reset-prompt-btn"
          onClick={() => handleResetPrompt(activeConfig.key)}
        >
          {t('prompts.resetToDefault')}
        </button>
      </div>

    </section>
  );
}
