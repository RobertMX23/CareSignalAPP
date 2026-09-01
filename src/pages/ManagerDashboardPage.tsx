/**
 * ManagerDashboardPage.tsx — Vista ejecutiva del gerente.
 *
 * Solo tarjetas KPI. Cada tarjeta enlaza a la página dedicada.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { listAlerts, listIncidents, listResidents, listRounds } from '../data/repository';
import { deriveResidentStatus } from '../domain/rules';

export const ManagerDashboardPage = (): JSX.Element => {
  const { refreshToken } = useDemoSession();

  const { alerts, incidents, residents, rounds } = useMemo(
    () => ({
      alerts:    listAlerts(),
      incidents: listIncidents(),
      residents: listResidents(),
      rounds:    listRounds(),
    }),
    [refreshToken],
  );

  const metrics = {
    residentsRed:    residents.filter((r) => deriveResidentStatus(r.id, rounds, alerts) === 'red').length,
    residentsYellow: residents.filter((r) => deriveResidentStatus(r.id, rounds, alerts) === 'yellow').length,
    residentsGreen:  residents.filter((r) => deriveResidentStatus(r.id, rounds, alerts) === 'green').length,
    alertsOpen:      alerts.filter((a) => a.status === 'open').length,
    alertsActive:    alerts.filter((a) => !['resolved', 'closed'].includes(a.status)).length,
    alertsResolved:  alerts.filter((a) => a.status === 'resolved').length,
    alertsClosed:    alerts.filter((a) => a.status === 'closed').length,
    incidentsOpen:   incidents.filter((i) => i.status !== 'closed').length,
  };

  return (
    <section>
      <h1>Vista ejecutiva</h1>

      <h2>Residentes</h2>
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

      <h2>Alertas</h2>
      <div className="summary-cards">
        <Link to="/alertas" className="summary-card summary-card--red summary-card--link">
          <span className="summary-card__value">{metrics.alertsOpen}</span>
          <span className="summary-card__label">Abiertas</span>
        </Link>
        <Link to="/alertas" className="summary-card summary-card--link">
          <span className="summary-card__value">{metrics.alertsActive}</span>
          <span className="summary-card__label">Activas</span>
        </Link>
        <Link to="/alertas" className="summary-card summary-card--link">
          <span className="summary-card__value">{metrics.alertsResolved}</span>
          <span className="summary-card__label">Resueltas (pendientes de cierre)</span>
        </Link>
        <Link to="/alertas" className="summary-card summary-card--link">
          <span className="summary-card__value">{metrics.alertsClosed}</span>
          <span className="summary-card__label">Cerradas</span>
        </Link>
      </div>

      <h2>Incidentes</h2>
      <div className="summary-cards">
        <Link to="/alertas" className="summary-card summary-card--link">
          <span className="summary-card__value">{metrics.incidentsOpen}</span>
          <span className="summary-card__label">Incidentes abiertos</span>
        </Link>
      </div>
    </section>
  );
};
