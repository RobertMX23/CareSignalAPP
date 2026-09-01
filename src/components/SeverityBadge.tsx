import type { AlertSeverity } from '../domain/taxonomy';

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; icon: string }> = {
  yellow: { label: 'Amarilla', icon: '!' },
  red:    { label: 'Roja',     icon: '⛔' },
};

export const SeverityBadge = ({ severity }: { severity: AlertSeverity }): JSX.Element => {
  const { label, icon } = SEVERITY_CONFIG[severity];
  return (
    <span className={`status-badge status-badge--${severity}`}>
      {icon} {label}
    </span>
  );
};
