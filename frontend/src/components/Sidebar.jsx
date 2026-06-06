import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDatePart, formatTimePart } from '../utils/dateFormat';
import { formatSidebarCost, sidebarCostTooltip } from '../utils/formatCost';
import ThemeToggle from './ThemeToggle';
import './Sidebar.css';

const getConversationMode = (conversation) => (
  conversation?.mode === 'advisors' ? 'advisors' : 'council'
);

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onNewAdvisors,
  onDeleteConversation,
  onOpenSettings,
  isLoading,
  onAbort,
  isOpen,
  onClose,
  onGoHome,
  dateFormat = 'auto',
  theme = 'dark',
  onToggleTheme,
}) {
  const { t } = useTranslation();
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getConversationTitle = (conv) => conv.title || t('sidebar.newConversation');

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const haystack = [
      getConversationTitle(conv),
      conv.run_summary || '',
    ].join(' ').toLowerCase();
    return haystack.includes(query);
  });

  const handleAbortClick = (e) => {
    e.stopPropagation();
    onAbort();
  };

  const handleDeleteClick = (e, convId) => {
    e.stopPropagation();
    setConfirmingDelete(convId);
  };

  const handleConfirmDelete = (e, convId) => {
    e.stopPropagation();
    onDeleteConversation(convId);
    setConfirmingDelete(null);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmingDelete(null);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Mobile close button */}
        <button className="sidebar-close-btn" onClick={onClose} aria-label={t('sidebar.closeMenu')}>
          ×
        </button>

        <div className="sidebar-header">
        <div className="sidebar-title-wrapper">
          <div className="sidebar-title" lang="en" dir="ltr">The AI <span className="title-plus">Counsel</span></div>
          <div className="sidebar-subtitle">
            {t('common.createdBy')}{' '}
            <a
              href="https://github.com/jacob-bd"
              target="_blank"
              rel="noopener noreferrer"
              lang="en"
              dir="ltr"
              style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px dotted currentColor', paddingBottom: '1px', opacity: 0.7, transition: 'opacity 0.2s', display: 'inline-block' }}
              onMouseEnter={e => e.target.style.opacity = '1'}
              onMouseLeave={e => e.target.style.opacity = '0.7'}
            >Jacob Ben-David</a>
          </div>
          <div className="sidebar-version" lang="en" dir="ltr">v0.9.0-he.1</div>
        </div>
        <div className="sidebar-header-actions">
          {onToggleTheme && (
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          )}
          <button
            className="icon-button"
            onClick={onOpenSettings}
            title={t('sidebar.settings')}
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Mode Actions */}
      <div className="sidebar-actions">
        <button className="sidebar-action-btn sidebar-action-btn--home" onClick={onGoHome}>
          <span className="btn-icon">⌂</span>
          <span className="btn-text">{t('sidebar.home')}</span>
        </button>
        <div className="sidebar-action-row">
          <button
            className="sidebar-action-btn sidebar-action-btn--council"
            onClick={onNewConversation}
            disabled={isLoading}
          >
            <span className="btn-icon">+</span>
            <span className="btn-text">{t('sidebar.newCouncil')}</span>
          </button>
          <button
            className="sidebar-action-btn sidebar-action-btn--advisors"
            onClick={onNewAdvisors}
            disabled={isLoading}
          >
            <span className="btn-icon">+</span>
            <span className="btn-text">{t('sidebar.newAdvisors')}</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="sidebar-search">
        <input
          type="text"
          className="search-input"
          placeholder={t('sidebar.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => setSearchQuery('')}
            title={t('sidebar.clearSearch')}
          >
            ×
          </button>
        )}
      </div>

      <div className="conversation-list">
        {filteredConversations.length === 0 ? (
          <div className="sidebar-empty-state">
            {searchQuery ? t('sidebar.noMatches') : t('sidebar.noHistory')}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const mode = getConversationMode(conv);
            const displayTitle = getConversationTitle(conv);
            return (
              <div
                key={conv.id}
                className={`conversation-item conversation-item--${mode} ${conv.id === currentConversationId ? 'active' : ''}`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="conversation-title" title={displayTitle}>
                  <span className={`conv-mode-tag conv-mode-tag--${mode}`}>
                    {mode === 'advisors' ? t('sidebar.advisorsTag') : t('sidebar.councilTag')}
                  </span>
                  <span className="conversation-title-text conversation-item-clamp">{displayTitle}</span>
                </div>
                {conv.run_summary && (
                  <div className="conversation-run-summary conversation-item-clamp" title={conv.run_summary}>
                    {conv.run_summary}
                  </div>
                )}
                <div className="conversation-meta">
                  <div className="conversation-meta__left">
                    {conv.total_cost != null && (
                      <span
                        className="conversation-cost-pill ltr"
                        title={sidebarCostTooltip(conv.total_cost, conv.cost_status, conv.total_calls)}
                      >
                        {formatSidebarCost(conv.total_cost, conv.cost_status)}
                      </span>
                    )}
                    <span className="conversation-timestamp">
                      <span className="conversation-timestamp__date">
                        {formatDatePart(conv.created_at, dateFormat)}
                      </span>
                      <span className="conversation-timestamp__time">
                        {formatTimePart(conv.created_at, dateFormat)}
                      </span>
                    </span>
                  </div>
                  {isLoading && conv.id === currentConversationId ? (
                    <button className="stop-generation-btn small" onClick={handleAbortClick}>
                      {t('sidebar.stop')}
                    </button>
                  ) : confirmingDelete === conv.id ? (
                    <div className="delete-confirm">
                      <button
                        className="confirm-yes-btn"
                        onClick={(e) => handleConfirmDelete(e, conv.id)}
                        title={t('sidebar.confirmDelete')}
                      >
                        ✓
                      </button>
                      <button
                        className="confirm-no-btn"
                        onClick={handleCancelDelete}
                        title={t('sidebar.cancelDelete')}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteClick(e, conv.id)}
                      title={t('sidebar.deleteConversation')}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </>
  );
}
