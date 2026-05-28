import React from 'react';
import { Lang } from '../../App';
import { t } from '../../i18n';

interface BookingCounts {
  total: number;
  not_started: number;
  booked: number;
  overridden: number;
  exception: number;
  accuracy: number;
}

interface BookingStatsGridProps {
  lang: Lang;
  counts: BookingCounts;
  filter: string;
  setFilter: (f: string) => void;
}

export function BookingStatsGrid({ lang, counts, filter, setFilter }: BookingStatsGridProps) {
  const overrideRate = counts.booked > 0 ? Math.round((counts.overridden / counts.booked) * 100) : 0;

  const cards = [
    { key: 'total',       filter: 'ALL',         value: counts.total,       tone: 'total' },
    { key: 'not_started', filter: 'NOT_STARTED',  value: counts.not_started, tone: 'not_started' },
    { key: 'booked',      filter: 'BOOKED',       value: counts.booked,      tone: 'assigned' },
    { key: 'exception',   filter: 'EXCEPTION',    value: counts.exception,   tone: 'exception' },
  ];

  return (
    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
      {cards.map(c => (
        <div
          key={c.key}
          data-tone={c.tone}
          className={`stat-card ${filter === c.filter && c.filter !== 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter(filter === c.filter ? 'ALL' : c.filter)}
        >
          <div className="stat-value">{c.value}</div>
          <div className="stat-label">{t(lang, 'bookingStats.' + c.key)}</div>
          <div className="stat-trend">{t(lang, 'bookingStats.trend.' + c.key)}</div>
        </div>
      ))}

      {/* Overridden — rate % as headline, detail count as trend */}
      <div
        data-tone="overridden"
        className={`stat-card ${filter === 'MANUALLY_OVERRIDDEN' ? 'active' : ''}`}
        onClick={() => setFilter(filter === 'MANUALLY_OVERRIDDEN' ? 'ALL' : 'MANUALLY_OVERRIDDEN')}
      >
        <div className="stat-value">{overrideRate}%</div>
        <div className="stat-label">{t(lang, 'bookingStats.overridden')}</div>
        <div className="stat-trend">{t(lang, 'bookingStats.trend.overridden', { count: counts.overridden, total: counts.booked })}</div>
      </div>

      {/* Pre-assign Accuracy — display only, no filter */}
      <div data-tone="accuracy" className="stat-card stat-card-accuracy">
        <div className="stat-value" style={{ color: 'var(--accent)' }}>
          {counts.accuracy}<span style={{ fontSize: '0.6em', marginLeft: 1 }}>%</span>
        </div>
        <div className="stat-label">{t(lang, 'bookingStats.accuracy')}</div>
        <div className="stat-trend">{t(lang, 'bookingStats.trend.accuracy')}</div>
      </div>
    </div>
  );
}
