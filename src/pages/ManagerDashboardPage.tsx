import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { closeAlert } from '../features/alerts/alertOperations';
import { getCurrentTime } from '../data/demoClock';
import {
  getResidentById,
  getStaffMemberById,
  listAlerts,
  listIncidents,
  listResidents,
  listRounds,
  listStaffMembers,
} from '../data/repository';
import { deriveResidentStatus } from '../domain/rules';
import { ALERT_STATUS_LABEL, INCIDENT_STATUS_LABEL, VERIFICATION_OUTCOME_LABEL } from '../features/labels';
import type { VerificationOutcome } from '../domain/taxonomy';
import { StaffRosterTable } from '../components/StaffRosterTable';
import { StatusBadge } from '../components/StatusBadge';
import { SeverityBadge } from '../components/SeverityBadge';

export const ManagerDashboardPage = (): JSX.Element => {
  const { activeStaff, refreshToken, refreshDemoData } = useDemoSession();
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | undefined>(undefined);

  const { alerts, incidents, residents, rounds, staffMembers } = useMemo(
    () => ({
      alerts: listAlerts().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      incidents: listIncidents().sort((a, b) => b.openedAt.localeCompare(a.openedAt)),
      residents: listResidents(),
      rounds: listRounds(),
      staffMembers: listStaffMembers(),
    }),
    [refreshToken],
  );

  const metrics = {
    alertsOpen:      alerts.filter((a) => a.status === 'open').length,
    alertsActive:    alerts.filter((a) => !['resolved', 'closed'].includes(a.status)).length,
    alertsResolved:  alerts.filter((a) => a.status === 'resolved').length,
    alertsClosed:    alerts.filter((a) => a.status === 'closed').length,
    incidentsOpen:   incidents.filter((i) => i.status !== 'closed').length,
    residentsRed:    residents.filter((r) => deriveResidentStatus(r.id, rounds, alerts) === 'red').length,
    residentsYellow: residents.filter((r) => deriveResidentStatus(r.id, rounds, alerts) === 'yellow').length,
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
          <span className="summary-card__value">{metrics.residentsRed}</span>
          <span className="summary-card__label">Residentes urgentes</span>
        </div>
        <div className="summary-card summary-card--yellow">
          <span className="summary-card__value">{metrics.residentsYellow}</span>
          <span className="summary-card__label">Residentes en atención</span>
        </div>
        <div className="summary-card summary-card--red">
          <span className="summary-card__value">{metrics.alertsOpen}</span>
          <span className="summary-card__label">Alertas abiertas</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{metrics.alertsActive}</span>
          <span className="summary-card__label">Alertas activas</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{metrics.incidentsOpen}</span>
          <span className="summary-card__label">Incidentes abiertos</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{metrics.alertsResolved}</span>
          <span className="summary-card__label">Alertas resueltas (pendientes de cierre)</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{metrics.alertsClosed}</span>
          <span className="summary-card__label">Alertas cerradas</span>
        </div>
      </div>

      <h2>Residentes — estado actual</h2>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Residente</th>
              <th>Habitación</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {[...residents]
              .sort((a, b) => {
                const p: Record<string, number> = { red: 0, yellow: 1, green: 2 };
                return (p[deriveResidentStatus(a.id, rounds, alerts)] ?? 2) -
                       (p[deriveResidentStatus(b.id, rounds, alerts)] ?? 2);
              })
              .map((resident) => {
                const st = deriveResidentStatus(resident.id, rounds, alerts);
                return (
                  <tr key={resident.id} className={`row-${st}`}>
                    <td><Link to={`/residentes/${resident.id}`}>{resident.displayName}</Link></td>
                    <td>{resident.room}</td>
                    <td><StatusBadge status={st} /></td>
                  </tr>
                );
              })}
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
                <td><Link to={`/alertas/${alert.id}`}>Alerta {alert.severity === 'red' ? 'Roja' : 'Amarilla'} · {new Date(alert.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</Link></td>
                <td>{getResidentById(alert.residentId)?.displayName ?? alert.residentId}</td>
                <td><SeverityBadge severity={alert.severity} /></td>
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
                  <td>
                    <Link to={`/alertas/${incident.alertId}`}>Ver alerta origen</Link>
                  </td>
                  <td>{getResidentById(incident.residentId)?.displayName ?? incident.residentId}</td>
                  <td>{INCIDENT_STATUS_LABEL[incident.status]}</td>
                  <td>{incident.outcome !== undefined ? (VERIFICATION_OUTCOME_LABEL[incident.outcome as VerificationOutcome] ?? incident.outcome) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Plantilla de personal</h2>
      <StaffRosterTable staffMembers={staffMembers} />
    </section>
  );
};
