import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { closeAlert } from '../features/alerts/alertOperations';
import { getCurrentTime } from '../data/demoClock';
import {
  getResidentById,
  getStaffMemberById,
  listAlerts,
  listAuditEvents,
  listIncidents,
  listResidents,
  listRounds,
  listStaffMembers,
} from '../data/repository';
import { deriveResidentStatus } from '../domain/rules';
import { ALERT_STATUS_LABEL, INCIDENT_STATUS_LABEL } from '../features/labels';
import { StaffRosterTable } from '../components/StaffRosterTable';

export const ManagerDashboardPage = (): JSX.Element => {
  const { activeStaff, refreshToken, refreshDemoData } = useDemoSession();
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | undefined>(undefined);

  const { alerts, incidents, auditEvents, residents, rounds, staffMembers } = useMemo(
    () => ({
      alerts: listAlerts().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      incidents: listIncidents().sort((a, b) => b.openedAt.localeCompare(a.openedAt)),
      auditEvents: listAuditEvents().sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
      residents: listResidents(),
      rounds: listRounds(),
      staffMembers: listStaffMembers(),
    }),
    [refreshToken],
  );

  const metrics = {
    alertsOpen:     alerts.filter((a) => a.status === 'open').length,
    alertsActive:   alerts.filter((a) => !['resolved', 'closed'].includes(a.status)).length,
    alertsResolved: alerts.filter((a) => a.status === 'resolved').length,
    alertsClosed:   alerts.filter((a) => a.status === 'closed').length,
    incidentsOpen:  incidents.filter((i) => i.status !== 'closed').length,
  };

  const handleCloseAlert = (alertId: string): void => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert === undefined) return;
    const result = closeAlert(alert, activeStaff.id, getCurrentTime());
    if (result.ok) {
      setMessage({ kind: 'success', text: `Alerta ${alertId} cerrada.` });
      refreshDemoData();
    } else {
      setMessage({ kind: 'error', text: result.message ?? 'No se pudo cerrar la alerta.' });
    }
  };

  return (
    <section>
      <h1>Vista ejecutiva</h1>

      {message !== undefined && (
        <p className={message.kind === 'success' ? 'inline-banner inline-banner--success' : 'inline-banner inline-banner--error'}>
          {message.text}{' '}
          <button type="button" className="link-button" onClick={() => setMessage(undefined)}>
            Cerrar
          </button>
        </p>
      )}

      <h2>Métricas globales</h2>
      <div className="summary-cards">
        <div className="summary-card summary-card--red">
          <span className="summary-card__value">{metrics.alertsOpen}</span>
          <span className="summary-card__label">Alertas abiertas</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{metrics.alertsActive}</span>
          <span className="summary-card__label">Alertas activas</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{metrics.alertsResolved}</span>
          <span className="summary-card__label">Alertas resueltas (pendientes de cierre)</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{metrics.alertsClosed}</span>
          <span className="summary-card__label">Alertas cerradas</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{metrics.incidentsOpen}</span>
          <span className="summary-card__label">Incidentes abiertos</span>
        </div>
      </div>

      <h2>Residentes — estado actual</h2>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Residente</th>
              <th>Habitación</th>
              <th>Estado derivado</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((resident) => (
              <tr key={resident.id}>
                <td><Link to={`/residentes/${resident.id}`}>{resident.displayName}</Link></td>
                <td>{resident.room}</td>
                <td>{deriveResidentStatus(resident.id, rounds, alerts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Historial completo de alertas</h2>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Alerta</th>
              <th>Residente</th>
              <th>Severidad</th>
              <th>Estado</th>
              <th>Responsable</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td><Link to={`/alertas/${alert.id}`}>{alert.id}</Link></td>
                <td>{getResidentById(alert.residentId)?.displayName ?? alert.residentId}</td>
                <td>{alert.severity === 'red' ? 'Roja' : 'Amarilla'}</td>
                <td>{ALERT_STATUS_LABEL[alert.status]}</td>
                <td>
                  {alert.assignedStaffId === undefined
                    ? <span className="badge badge--unassigned">Sin asignar</span>
                    : getStaffMemberById(alert.assignedStaffId)?.displayName ?? alert.assignedStaffId}
                </td>
                <td>
                  {alert.status === 'resolved' && (
                    <button type="button" className="button button--secondary" onClick={() => handleCloseAlert(alert.id)}>
                      Cerrar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Historial completo de incidentes</h2>
      {incidents.length === 0 ? (
        <p>No hay incidentes registrados.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Incidente</th>
                <th>Alerta origen</th>
                <th>Residente</th>
                <th>Estado</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr key={incident.id}>
                  <td>{incident.id}</td>
                  <td><Link to={`/alertas/${incident.alertId}`}>{incident.alertId}</Link></td>
                  <td>{getResidentById(incident.residentId)?.displayName ?? incident.residentId}</td>
                  <td>{INCIDENT_STATUS_LABEL[incident.status]}</td>
                  <td>{incident.outcome ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Bitácora de auditoría</h2>
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

      <h2>Plantilla de personal</h2>
      <StaffRosterTable staffMembers={staffMembers} />
    </section>
  );
};
