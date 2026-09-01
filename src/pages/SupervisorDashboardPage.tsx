/**
 * SupervisorDashboardPage.tsx — Dashboard del supervisor (contrato Chunk 6).
 *
 * Solo lectura: agrega datos reales del repositorio vía `computeDashboardMetrics`
 * (puro). El color de cada residente se recalcula en cada render con
 * `deriveResidentStatus`, nunca se persiste.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { computeDashboardMetrics } from '../features/dashboard/dashboardMetrics';
import { getStaffMemberById, listAlerts, listAuditEvents, listIncidents, listResidents, listRounds } from '../data/repository';
import { isAlertActive } from '../domain/rules';
import { ALERT_STATUS_LABEL } from '../features/labels';
import { SeverityBadge } from '../components/SeverityBadge';

export const SupervisorDashboardPage = (): JSX.Element => {
  const { refreshToken } = useDemoSession();

  const { residents, alerts, metrics } = useMemo(() => {
    const residents = listResidents();
    const rounds = listRounds();
    const alerts = listAlerts();
    const incidents = listIncidents();
    const auditEvents = listAuditEvents();
    return { residents, alerts, metrics: computeDashboardMetrics(residents, rounds, alerts, incidents, auditEvents) };
  }, [refreshToken]);

  const activeAlerts = alerts
    .filter((a) => isAlertActive(a.status))
    .sort((a, b) => {
      const p: Record<string, number> = { red: 0, yellow: 1 };
      return (p[a.severity] ?? 1) - (p[b.severity] ?? 1);
    });

  return (
    <section>
      <h1>Dashboard del supervisor</h1>

      <h2>Alertas activas</h2>
      {activeAlerts.length === 0 ? (
        <p>No hay alertas activas en este momento.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alerta</th>
                <th>Residente</th>
                <th>Severidad</th>
                <th>Estado</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {activeAlerts.map((alert) => {
                const resident = residents.find((r) => r.id === alert.residentId);
                return (
                  <tr key={alert.id}>
                    <td>
                      <Link to={`/alertas/${alert.id}`}>
                        Alerta {alert.severity === 'red' ? 'Roja' : 'Amarilla'} · {new Date(alert.createdAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                      </Link>
                    </td>
                    <td>{resident?.displayName ?? alert.residentId}</td>
                    <td><SeverityBadge severity={alert.severity} /></td>
                    <td>{ALERT_STATUS_LABEL[alert.status]}</td>
                    <td>
                      {alert.assignedStaffId === undefined ? (
                        <span className="badge badge--unassigned">Sin asignar</span>
                      ) : (
                        getStaffMemberById(alert.assignedStaffId)?.displayName ?? alert.assignedStaffId
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2>Alertas y verificaciones</h2>
      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-card__value">{metrics.alertsOpen}</span>
          <span className="summary-card__label">Alertas abiertas</span>
        </div>
        <div className="summary-card summary-card--red">
          <span className="summary-card__value">{metrics.alertsUnassigned}</span>
          <span className="summary-card__label">Alertas sin asignar</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{metrics.verificationsInProgress}</span>
          <span className="summary-card__label">Verificaciones en progreso</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{metrics.alertsEscalated}</span>
          <span className="summary-card__label">Alertas escaladas</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">
            {metrics.medianResponseMinutes === undefined ? '—' : `${Math.round(metrics.medianResponseMinutes)} min`}
          </span>
          <span className="summary-card__label">Tiempo mediano de respuesta</span>
        </div>
      </div>

      <h2>Residentes por estado</h2>
      <div className="summary-cards">
        <div className="summary-card summary-card--red">
          <span className="summary-card__value">{metrics.residentsRed}</span>
          <span className="summary-card__label">Residentes en rojo</span>
        </div>
        <div className="summary-card summary-card--yellow">
          <span className="summary-card__value">{metrics.residentsYellow}</span>
          <span className="summary-card__label">Residentes en amarillo</span>
        </div>
        <div className="summary-card summary-card--green">
          <span className="summary-card__value">{metrics.residentsGreen}</span>
          <span className="summary-card__label">Residentes en verde</span>
        </div>
      </div>

      <h2>Rondas</h2>
      <div className="summary-cards">
        <div className="summary-card summary-card--red">
          <span className="summary-card__value">{metrics.roundsOverdue}</span>
          <span className="summary-card__label">Rondas vencidas</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{metrics.roundsUpcoming}</span>
          <span className="summary-card__label">Rondas próximas</span>
        </div>
      </div>

    </section>
  );
};
