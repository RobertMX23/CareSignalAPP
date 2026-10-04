import { useMemo, useState } from 'react';
import { useDemoSession } from '../components/DemoSessionContext';
import { listResidents, listRounds } from '../data/repository';
import { getCurrentTime } from '../data/demoClock';
import { ROUND_TYPE_LABEL, ROUND_STATUS_LABEL } from '../features/labels';
import { RoundsCalendarView, type ShiftKey } from '../features/rounds/RoundsCalendarView';

type ViewMode = 'list' | 'calendar';

const SHIFT_LABEL: Record<ShiftKey, string> = {
  all:       'Todos los turnos',
  morning:   'Mañana',
  afternoon: 'Tarde',
  night:     'Noche',
};

function getShiftHour(scheduledAt: string): number {
  return new Date(scheduledAt).getUTCHours();
}

function matchesShift(scheduledAt: string, filter: ShiftKey): boolean {
  if (filter === 'all') return true;
  const h = getShiftHour(scheduledAt);
  if (filter === 'morning')   return h >= 6 && h < 14;
  if (filter === 'afternoon') return h >= 14 && h < 22;
  return h < 6 || h >= 22;
}

function storedView(): ViewMode {
  try { return (sessionStorage.getItem('rounds-view') as ViewMode) || 'list'; }
  catch { return 'list'; }
}

export const RoundsPage = (): JSX.Element => {
  const { refreshToken } = useDemoSession();
  const [view, setView]           = useState<ViewMode>(storedView);
  const [shiftFilter, setShift]   = useState<ShiftKey>('all');

  const handleView = (v: ViewMode): void => {
    setView(v);
    try { sessionStorage.setItem('rounds-view', v); } catch { /* ignore */ }
  };

  const { rounds, residents } = useMemo(() => ({
    rounds:    listRounds(),
    residents: listResidents(),
  }), [refreshToken]);

  const residentMap = useMemo(() => {
    const m = new Map<string, { name: string; room: string }>();
    residents.forEach((r) => m.set(r.id, { name: r.displayName, room: r.room }));
    return m;
  }, [residents]);

  const listRows = useMemo(
    () => [...rounds]
      .filter((r) => matchesShift(r.scheduledAt, shiftFilter))
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [rounds, shiftFilter],
  );

  const currentTime = getCurrentTime();
  const formattedTime = new Date(currentTime).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  });

  return (
    <section>
      <h1>Rondas del turno</h1>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>
        Hora simulada: <strong>{formattedTime}</strong> · {rounds.length} rondas totales
      </p>

      <div className="rounds-toolbar">
        <label className="session-field">
          <span className="session-field__label">Turno</span>
          <select value={shiftFilter} onChange={(e) => setShift(e.target.value as ShiftKey)}>
            {(Object.keys(SHIFT_LABEL) as ShiftKey[]).map((k) => (
              <option key={k} value={k}>{SHIFT_LABEL[k]}</option>
            ))}
          </select>
        </label>

        <div className="view-toggle" role="group" aria-label="Cambiar vista">
          <button
            type="button"
            className={`view-toggle__btn${view === 'list' ? ' view-toggle__btn--active' : ''}`}
            onClick={() => handleView('list')}
            aria-pressed={view === 'list'}
          >
            Lista
          </button>
          <button
            type="button"
            className={`view-toggle__btn${view === 'calendar' ? ' view-toggle__btn--active' : ''}`}
            onClick={() => handleView('calendar')}
            aria-pressed={view === 'calendar'}
          >
            Calendario
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <RoundsCalendarView rounds={rounds} residents={residents} shiftFilter={shiftFilter} />
      ) : (
        <div className="table-wrapper">
          {listRows.length === 0 ? (
            <p className="empty-state">No hay rondas en este turno.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Residente</th>
                  <th>Hab.</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {listRows.map((round) => {
                  const info = residentMap.get(round.residentId);
                  return (
                    <tr key={round.id}>
                      <td>
                        <time dateTime={round.scheduledAt}>
                          {new Date(round.scheduledAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
                          })}
                        </time>
                      </td>
                      <td>{info?.name ?? round.residentId}</td>
                      <td>{info?.room ?? '—'}</td>
                      <td>{ROUND_TYPE_LABEL[round.type]}</td>
                      <td>
                        <span className="badge">{ROUND_STATUS_LABEL[round.status]}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  );
};
