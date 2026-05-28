import React from 'react';
import { Lang } from '../../App';
import { t } from '../../i18n';
import { IconSearch, IconPlay, IconClose } from '../icons/index';

interface ToolbarProps {
  lang: Lang;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filter: string;
  setFilter: (f: string) => void;
  selectedIds: Set<number>;
  batchRunning: boolean;
  handleBatchRun: () => void;
  isBooking?: boolean;
}

export function Toolbar({
  lang,
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  selectedIds,
  batchRunning,
  handleBatchRun,
  isBooking
}: ToolbarProps) {
  const filters = isBooking
    ? ['ALL', 'NOT_STARTED', 'BOOKED', 'MANUALLY_OVERRIDDEN', 'EXCEPTION']
    : ['ALL', 'NOT_STARTED', 'ASSIGNED', 'MANUALLY_OVERRIDDEN', 'ON_HOLD', 'EXCEPTION'];

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <div className="toolbar-search">
          <IconSearch className="search-icon" />
          <input
            type="text"
            placeholder={t(lang, 'search.placeholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
              }}
              title="Clear search"
            >
              <IconClose />
            </button>
          )}
        </div>
        <div className="toolbar-filter">
          {filters.map(f => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {t(lang, 'filter.' + f)}
            </button>
          ))}
        </div>
        {selectedIds.size > 0 && (
          <span className="selection-info">
            <b>{t(lang, 'selection', { n: selectedIds.size })}</b>
          </span>
        )}
      </div>
      <button
        className="btn btn-orange"
        onClick={handleBatchRun}
        disabled={batchRunning}
      >
        <IconPlay />
        {batchRunning
          ? t(lang, 'btn.running')
          : selectedIds.size > 0
            ? t(lang, 'btn.runSelected', { n: selectedIds.size })
            : t(lang, 'btn.runAll')}
      </button>
    </div>
  );
}