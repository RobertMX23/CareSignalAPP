/**
 * StatusBadge.tsx — Estado visual derivado del residente (verde/amarillo/rojo).
 *
 * Diseño: nunca depende solo del color (regla de diseño Chunk 4). Cada estado se
 * acompaña de texto y de un ícono textual, para legibilidad y accesibilidad.
 */

import type { ResidentDerivedStatus } from '../domain/types';

const STATUS_CONFIG: Record<ResidentDerivedStatus, { label: string; icon: string; className: string }> = {
  green: { label: 'Sin novedades', icon: '✓', className: 'status-badge status-badge--green' },
  yellow: { label: 'Atención requerida', icon: '!', className: 'status-badge status-badge--yellow' },
  red: { label: 'Urgente', icon: '⛔', className: 'status-badge status-badge--red' },
};

export const StatusBadge = ({ status }: { status: ResidentDerivedStatus }): JSX.Element => {
  const config = STATUS_CONFIG[status];
  return (
    <span className={config.className}>
      <span aria-hidden="true">{config.icon}</span> {config.label}
    </span>
  );
};
