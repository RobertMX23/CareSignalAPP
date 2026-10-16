import { useMemo } from 'react';
import { useDemoSession } from '../components/DemoSessionContext';
import { getStaffMemberById, listAuditEvents } from '../data/repository';

export const BitacoraPage = (): JSX.Element => {
  const { refreshToken } = useDemoSession();

  const auditEvents = useMemo(
    () => listAuditEvents().sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [refreshToken],
  );

  return (
    <section>
      <h1 data-tour="audit-log">Bitácora de auditoría</h1>
      <p>Registro inmutable de todas las transiciones y acciones del sistema.</p>

      {auditEvents.length === 0 ? (
        <p>No hay eventos registrados.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Entidad</th>
                <th>Acción</th>
                <th>Transición</th>
                <th>Actor</th>
              </tr>
            </thead>
            <tbody>
              {auditEvents.map((event, i) => (
                <tr key={`${event.id}-${i}`}>
                  <td>{new Date(event.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td>{event.entityType} — {event.entityId}</td>
                  <td>{event.action}</td>
                  <td>
                    {event.previousState !== undefined && event.nextState !== undefined
                      ? `${event.previousState} → ${event.nextState}`
                      : '—'}
                  </td>
                  <td>{getStaffMemberById(event.actorId)?.displayName ?? event.actorId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
