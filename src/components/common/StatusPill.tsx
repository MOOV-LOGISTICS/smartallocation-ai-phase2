import { Lang } from '../../App';
import { t } from '../../i18n';

const STATUS_TONE: Record<string, string> = {
  ASSIGNED: 'assigned',
  NOT_STARTED: 'pending',
  ON_HOLD: 'onhold',
  EXCEPTION: 'exception',
  RUNNING: 'running',
  CONFIRMED: 'confirmed',
  BOOKED_EXACT: 'booked-exact',
  BOOKED_UPDATED: 'booked-updated',
  MANUALLY_OVERRIDDEN: 'overridden',
};

interface StatusPillProps {
  status: string;
  lang: Lang;
  isBooking?: boolean;
}

export function StatusPill({ status, lang, isBooking }: StatusPillProps) {
  const tone = STATUS_TONE[status] || 'neutral';
  const prefix = isBooking ? 'bookingStatus.' : 'status.';
  return (
    <span className={`pill pill-${tone}`}>
      <span className="pill-dot" />
      {t(lang, prefix + status)}
    </span>
  );
}