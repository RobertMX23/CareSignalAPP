import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { computeDashboardMetrics } from '../features/dashboard/dashboardMetrics';
import { listAlerts, listAuditEvents, listIncidents, listResidents, listRounds } from '../data/repository';
import { deriveResidentStatus } from '../domain/rules';

// ── Cuidador ────────────────────────────────────────────────────────────────

const CaregiverDashboard = (): JSX.Element => {
  const { activeStaff, refreshToken } = useDemoSession();

  const counts = useMemo(() => {
    const rounds = listRounds().filter((r) => r.assignedStaffId === activeStaff.id);
    return {
      pending:     rounds.filter((r) => r.status === 'scheduled' || r.status === 'due').length,
      inProgress:  rounds.filter((r) => r.status === 'in_progress').length,
      overdue:     rounds.filter((r) => r.status === 'overdue').length,
      completed:   rounds.filter((r) => r.status === 'completed').length,
      total:       rounds.length,
    };
  }, [refreshToken, activeStaff.id]);

  return (
    <section data-tour="dashboard-main">
      <h1>Mi turno</h1>

      <h2>Mis rondas</h2>
      <div className="summary-cards">
        <Link to="/mis-rondas?filter=overdue" className="summary-card summary-card--red summary-card--link">
          <span className="summary-card__value">{counts.overdue}</span>
          <span className="summary-card__label">Vencidas</span>
        </Link>
        <Link to="/mis-rondas?filter=in_progress" className="summary-card summary-card--link">
          <span className="summary-card__value">{counts.inProgress}</span>
          <span className="summary-card__label">En progreso</span>
        </Link>
        <Link to="/mis-rondas?filter=pending" className="summary-card summary-card--link">
          <span className="summary-card__value">{counts.pending}</span>
          <span className="summary-card__label">Pendientes</span>
        </Link>
        <Link to="/mis-rondas?filter=completed" className="summary-card summary-card--green summary-card--link">
          <span className="summary-card__value">{counts.completed}</span>
          <span className="summary-card__label">Completadas</span>
        </Link>
      </div>
    </section>
  );
};

// ── Supervisor ───────────────────────────────────────────────────────────────

const SupervisorDashboard = (): JSX.Element => {
  const { refreshToken } = useDemoSession();

  const metrics = useMemo(() => {
    const residents = listResidents();
    const rounds    = listRounds();
    const alerts    = listAlerts();
    const incidents = listIncidents();
    const auditEvents = listAuditEvents();
    return computeDashboardMetrics(residents, rounds, alerts, incidents, auditEvents);
  }, [refreshToken]);

  return (
    <section data-tour="dashboard-main">
      <h1>Dashboard</h1>

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

// ── Gerente ──────────────────────────────────────────────────────────────────

const ManagerDashboard = (): JSX.Element => {
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
    <section data-tour="dashboard-main">
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

// ── Entry point ──────────────────────────────────────────────────────────────

export const DashboardPage = (): JSX.Element => {
  const { activeStaff } = useDemoSession();
  if (activeStaff.role === 'caregiver') return <CaregiverDashboard />;
  if (activeStaff.role === 'manager')   return <ManagerDashboard />;
  return <SupervisorDashboard />;
};
