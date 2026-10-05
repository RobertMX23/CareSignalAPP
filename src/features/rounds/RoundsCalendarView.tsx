import { useMemo } from 'react';
import type { Resident, Round } from '../../domain/types';
import type { RoundStatus } from '../../domain/taxonomy';
import { ROUND_TYPE_LABEL, ROUND_STATUS_LABEL } from '../labels';

export type ShiftKey = 'all' | 'morning' | 'afternoon' | 'night';

const SHIFT_LABEL: Record<Exclude<ShiftKey, 'all'>, string> = {
  morning:   'Turno mañana (06:00–14:00)',
  afternoon: 'Turno tarde (14:00–22:00)',
  night:     'Turno noche (22:00–06:00)',
};

function getShift(scheduledAt: string): Exclude<ShiftKey, 'all'> {
  const h = new Date(scheduledAt).getUTCHours();
  if (h >= 6 && h < 14)  return 'morning';
  if (h >= 14 && h < 22) return 'afternoon';
  return 'night';
}

function statusModifier(status: RoundStatus): string {
  switch (status) {
    case 'overdue':  return 'cal-card--red';
    case 'due':      return 'cal-card--yellow';
    case 'cancelled':
    case 'completed': return 'cal-card--gray';
    default:          return 'cal-card--green';
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  });
}

interface Props {
  rounds:    Round[];
  residents: Resident[];
  shiftFilter: ShiftKey;
}

export const RoundsCalendarView = ({ rounds, residents, shiftFilter }: Props): JSX.Element => {
  const residentMap = useMemo(() => {
    const m = new Map<string, Resident>();
    residents.forEach((r) => m.set(r.id, r));
    return m;
  }, [residents]);

  const groups = useMemo(() => {
    const base = shiftFilter === 'all'
      ? rounds
      : rounds.filter((r) => getShift(r.scheduledAt) === shiftFilter);
    const sorted = [...base].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    const result: Record<Exclude<ShiftKey, 'all'>, Round[]> = { morning: [], afternoon: [], night: [] };
    sorted.forEach((r) => result[getShift(r.scheduledAt)].push(r));
    return result;
  }, [rounds, shiftFilter]);

  const shiftOrder: Exclude<ShiftKey, 'all'>[] = ['morning', 'afternoon', 'night'];
  const visible = shiftFilter === 'all'
    ? shiftOrder.filter((s) => groups[s].length > 0)
    : shiftOrder.filter((s) => s === shiftFilter);

  const totalVisible = visible.reduce((n, s) => n + groups[s].length, 0);
  if (totalVisible === 0) {
    return <p className="empty-state">No hay rondas en este turno.</p>;
  }

  return (
    <div className="cal-view">
      {visible.map((shift) => (
        <section key={shift} className="cal-shift-group">
          <h2 className="cal-shift-header">{SHIFT_LABEL[shift]}</h2>
          {groups[shift].length === 0 ? (
            <p className="cal-empty">Sin rondas programadas.</p>
          ) : (
            <ul className="cal-list" role="list">
              {groups[shift].map((round) => {
                const resident = residentMap.get(round.residentId);
                return (
                  <li key={round.id} className={`cal-card ${statusModifier(round.status)}`}>
                    <time className="cal-card__time" dateTime={round.scheduledAt}>
                      {formatTime(round.scheduledAt)}
                    </time>
                    <div className="cal-card__body">
                      <span className="cal-card__resident">{resident?.displayName ?? round.residentId}</span>
                      <span className="cal-card__meta">
                        Hab. {resident?.room ?? '—'} · {ROUND_TYPE_LABEL[round.type]}
                      </span>
                    </div>
                    <span className="badge cal-card__badge">{ROUND_STATUS_LABEL[round.status]}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
};
