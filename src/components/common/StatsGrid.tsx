import { Lang } from '../../App';
import { t } from '../../i18n';

interface StatsGridProps {
  lang: Lang;
  counts: {
    total: number;
    not_started: number;
    assigned: number;
    overridden: number;
    on_hold: number;
    exception: number;
  };
  filter: string;
  setFilter: (filter: string) => void;
  isBooking?: boolean;
}

const STAT_DEFS = [
  { tone: 'total', countKey: 'total', activeFilter: 'ALL' },
  { tone: 'not_started', countKey: 'not_started', activeFilter: 'NOT_STARTED' },
  { tone: 'assigned', countKey: 'assigned', activeFilter: 'ASSIGNED' },
  { tone: 'on_hold', countKey: 'on_hold', activeFilter: 'ON_HOLD' },
  { tone: 'exception', countKey: 'exception', activeFilter: 'EXCEPTION' },
  { tone: 'overridden', countKey: 'overridden', activeFilter: 'MANUALLY_OVERRIDDEN' }
] as const;

export function StatsGrid({ lang, counts, filter, setFilter, isBooking }: StatsGridProps) {
  const overrideTotal = counts.assigned + counts.overridden;
  const overrideRate = overrideTotal > 0 ? Math.round((counts.overridden / overrideTotal) * 100) : 0;

  return (
    <div className="stats-grid">
      {STAT_DEFS.map(s => {
        const isOverridden = s.tone === 'overridden';
        const trendKey = (isBooking ? 'bookingStats.trend.' : 'stats.trend.') + s.tone;
        const mainValue = isOverridden ? `${overrideRate}%` : counts[s.countKey];
        const trendText = isOverridden
          ? t(lang, trendKey, { count: counts.overridden, total: overrideTotal })
          : t(lang, trendKey);
        return (
          <div
            key={s.tone}
            data-tone={s.tone}
            className={`stat-card ${filter === s.activeFilter && filter !== 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter(filter === s.activeFilter ? 'ALL' : s.activeFilter)}
          >
            <div className="stat-value">{mainValue}</div>
            <div className="stat-label">{t(lang, (isBooking ? 'bookingStats.' : 'stats.') + s.tone)}</div>
            <div className="stat-trend">{trendText}</div>
          </div>
        );
      })}
    </div>
  );
}