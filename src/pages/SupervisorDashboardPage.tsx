/**
 * SupervisorDashboardPage.tsx — Vista general de residentes y alertas activas.
 *
 * Solo lectura en Chunk 4: muestra datos reales del repositorio y el estado derivado
 * (`deriveResidentStatus`, puro, nunca persistido). El ciclo de vida completo de
 * alertas (asignar, escalar, verificar, resolver, cerrar) llega en el Chunk 6.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDemoSession } from '../components/DemoSessionContext';
import { StatusBadge } from '../components/StatusBadge';
import { listAlerts, listResidents, listRounds } from '../data/repository';
import { deriveResidentStatus, isAlertActive } from '../domain/rules';

export const SupervisorDashboardPage = (): JSX.Element => {
  const { refreshToken } = useDemoSession();

  const { residents, rounds, alerts } = useMemo(
    () => ({ residents: listResidents(), rounds: listRounds(), alerts: listAlerts() }),
    [refreshToken],
  );

  const activeAlerts = alerts.filter((a) => isAlertActive(a.status));
  const activeRed = activeAlerts.filter((a) => a.severity === 'red').length;
  const activeYellow = activeAlerts.filter((a) => a.severity === 'yellow').length;

  return (
    <section>
      <h1>Dashboard del supervisor</h1>

      <div className="summary-cards">
        <div className="summary-card summary-card--red">
          <span className="summary-card__value">{activeRed}</span>
          <span className="summary-card__label">Alertas rojas activas</span>
        </div>
        <div className="summary-card summary-card--yellow">
          <span className="summary-card__value">{activeYellow}</span>
          <span className="summary-card__label">Alertas amarillas activas</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{residents.length}</span>
          <span className="summary-card__label">Residentes</span>
        </div>
      </div>

      <h2>Residentes</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Residente</th>
            <th>Habitación</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {residents.map((resident) => (
            <tr key={resident.id}>
              <td>
                <Link to={`/residentes/${resident.id}`}>{resident.displayName}</Link>
              </td>
              <td>{resident.room}</td>
              <td>
                <StatusBadge status={deriveResidentStatus(resident.id, rounds, alerts)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Alertas activas</h2>
      {activeAlerts.length === 0 ? (
        <p>No hay alertas activas en este momento.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Alerta</th>
              <th>Residente</th>
              <th>Severidad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {activeAlerts.map((alert) => {
              const resident = residents.find((r) => r.id === alert.residentId);
              return (
                <tr key={alert.id}>
                  <td>
                    <Link to={`/alertas/${alert.id}`}>{alert.id}</Link>
                  </td>
                  <td>{resident?.displayName ?? alert.residentId}</td>
                  <td>{alert.severity === 'red' ? 'Roja' : 'Amarilla'}</td>
                  <td>{alert.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
};
