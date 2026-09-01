/**
 * SupervisorDashboardPage.tsx — Dashboard del supervisor (contrato Chunk 6).
 *
 * Solo tarjetas numéricas. Cada tarjeta enlaza a la página dedicada.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { computeDashboardMetrics } from '../features/dashboard/dashboardMetrics';
import { listAlerts, listAuditEvents, listIncidents, listResidents, listRounds } from '../data/repository';

export const SupervisorDashboardPage = (): JSX.Element => {
  const { refreshToken } = useDemoSession();

  const metrics = useMemo(() => {
    const residents = listResidents();
    const rounds = listRounds();
    const alerts = listAlerts();
    const incidents = listIncidents();
    const auditEvents = listAuditEvents();
    return computeDashboardMetrics(residents, rounds, alerts, incidents, auditEvents);
  }, [refreshToken]);

  return (
    <section>
      <h1>Dashboard del supervisor</h1>

      <h2>Alertas y verificaciones</h2>
      <div className="summary-cards">
        <Link to="/alertas" className="summary-card summary-card--red summary-card--link">
          <span className="summary-card__value">{metrics.alertsOpen}</span>
          <span className="summary-card__label">Alertas abiertas</span>
        </Link>
        <Link to="/alertas" className="summary-card summary-card--red summary-card--link">
          <span className="summary-card__value">{metrics.alertsUnassigned}</span>
          <span className="summary-card__label">Sin asignar</span>
        </Link>
        <Link to="/alertas" className="summary-card summary-card--link">
          <span className="summary-card__value">{metrics.verificationsInProgress}</span>
          <span className="summary-card__label">Verificaciones en progreso</span>
        </Link>
        <Link to="/alertas" className="summary-card summary-card--link">
          <span className="summary-card__value">{metrics.alertsEscalated}</span>
          <span className="summary-card__label">Alertas escaladas</span>
        </Link>
        <div className="summary-card">
          <span className="summary-card__value">
            {metrics.medianResponseMinutes === undefined ? '—' : `${Math.round(metrics.medianResponseMinutes)} min`}
          </span>
          <span className="summary-card__label">Tiempo mediano de respuesta</span>
        </div>
      </div>

      <h2>Residentes por estado</h2>
      <div className="summary-cards">
        <Link to="/residentes" className="summary-card summary-card--red summary-card--link">
          <span className="summary-card__value">{metrics.residentsRed}</span>
          <span className="summary-card__label">Urgentes</span>
        </Link>
        <Link to="/residentes" className="summary-card summary-card--yellow summary-card--link">
          <span className="summary-card__value">{metrics.residentsYellow}</span>
          <span className="summary-card__label">En atención</span>
        </Link>
        <Link to="/residentes" className="summary-card summary-card--green summary-card--link">
          <span className="summary-card__value">{metrics.residentsGreen}</span>
          <span className="summary-card__label">Sin novedades</span>
        </Link>
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
