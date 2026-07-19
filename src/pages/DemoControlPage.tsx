/**
 * DemoControlPage.tsx — Control del reloj simulado, escenarios y restablecimiento
 * (contrato Chunk 7).
 *
 * El reloj solo avanza cuando se pulsa un botón (sin esperas reales). Desde el
 * Chunk 7, cada avance ejecuta el motor temporal (`temporalEngine.ts`): las rondas
 * pasan de `scheduled`→`due`→`overdue` y se generan/escalan alertas automáticamente.
 * Los tres escenarios (`features/demo/scenarios.ts`) son atajos deterministas sobre
 * ese mismo motor, para poder mostrar el ciclo completo de una alerta en segundos.
 */

import { useMemo, useState } from 'react';
import { useDemoSession } from '../components/DemoSessionContext';
import {
  advanceFifteenMinutes,
  advanceFiveMinutes,
  advanceOneMinute,
  getCurrentTime,
  resetClock,
} from '../data/demoClock';
import { resetDemo } from '../data/resetDemo';
import { runEscalatedAlertScenario, runFullResolutionScenario, runMissedRoundScenario, type ScenarioResult } from '../features/demo/scenarios';
import { listAlerts, listAuditEvents, listIncidents, listResidents, listRounds, listStaffMembers } from '../data/repository';

export const DemoControlPage = (): JSX.Element => {
  const { refreshToken, refreshDemoData } = useDemoSession();
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | undefined>(undefined);

  const counts = useMemo(
    () => ({
      residents: listResidents().length,
      staffMembers: listStaffMembers().length,
      rounds: listRounds().length,
      alerts: listAlerts().length,
      incidents: listIncidents().length,
      auditEvents: listAuditEvents().length,
    }),
    [refreshToken],
  );

  const recentAudit = useMemo(() => listAuditEvents().slice(-10).reverse(), [refreshToken]);

  const currentTime = getCurrentTime();
  const formattedTime = new Date(currentTime).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'medium' });

  const advance = (fn: () => string): void => {
    fn();
    refreshDemoData();
  };

  const handleResetClock = (): void => advance(resetClock);

  const handleResetDemo = (): void => {
    const confirmed = window.confirm(
      'Esto restablece todos los datos ficticios y el reloj simulado a su estado inicial. ¿Continuar?',
    );
    if (!confirmed) return;
    resetDemo();
    setMessage(undefined);
    refreshDemoData();
  };

  const runScenario = (scenario: () => ScenarioResult): void => {
    const result = scenario();
    setMessage(result.ok ? { kind: 'success', text: result.summary } : { kind: 'error', text: result.message });
    refreshDemoData();
  };

  return (
    <section>
      <h1>Control de demo</h1>

      <h2>Reloj simulado</h2>
      <p className="clock-indicator clock-indicator--large">{formattedTime}</p>
      <div className="button-row">
        <button type="button" className="button" onClick={() => advance(advanceOneMinute)}>
          Avanzar 1 minuto
        </button>
        <button type="button" className="button" onClick={() => advance(advanceFiveMinutes)}>
          Avanzar 5 minutos
        </button>
        <button type="button" className="button" onClick={() => advance(advanceFifteenMinutes)}>
          Avanzar 15 minutos
        </button>
        <button type="button" className="button button--secondary" onClick={handleResetClock}>
          Restablecer reloj
        </button>
      </div>
      <p className="hint">
        El reloj solo avanza al pulsar un botón; no representa tiempo real. Cada avance
        sincroniza automáticamente rondas y alertas con la nueva hora (motor temporal).
      </p>

      <h2>Escenarios de demostración</h2>
      <p className="hint">
        Los tres escenarios operan siempre sobre la misma ronda de demostración
        (Marta Ibáñez, <code>round-01</code>). Cada uno revisa el estado actual antes
        de actuar: ejecutarlos más de una vez o fuera de orden no duplica alertas ni
        repite transiciones.
      </p>
      <div className="button-row">
        <button type="button" className="button" onClick={() => runScenario(runMissedRoundScenario)}>
          Escenario: ronda omitida
        </button>
        <button type="button" className="button" onClick={() => runScenario(runEscalatedAlertScenario)}>
          Escenario: alerta escalada
        </button>
        <button type="button" className="button" onClick={() => runScenario(runFullResolutionScenario)}>
          Escenario: resolución completa
        </button>
      </div>

      {message !== undefined && (
        <p className={message.kind === 'success' ? 'inline-banner inline-banner--success' : 'inline-banner inline-banner--error'}>
          {message.text}{' '}
          <button type="button" className="link-button" onClick={() => setMessage(undefined)}>
            Cerrar
          </button>
        </p>
      )}

      <h2>Datos de la demo</h2>
      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-card__value">{counts.residents}</span>
          <span className="summary-card__label">Residentes</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{counts.staffMembers}</span>
          <span className="summary-card__label">Personal</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{counts.rounds}</span>
          <span className="summary-card__label">Rondas</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{counts.alerts}</span>
          <span className="summary-card__label">Alertas</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{counts.incidents}</span>
          <span className="summary-card__label">Incidentes</span>
        </div>
        <div className="summary-card">
          <span className="summary-card__value">{counts.auditEvents}</span>
          <span className="summary-card__label">Eventos de auditoría</span>
        </div>
      </div>

      <button type="button" className="button button--danger" onClick={handleResetDemo}>
        Restablecer demo completa
      </button>

      <h2>Últimos eventos de auditoría</h2>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cuándo</th>
              <th>Entidad</th>
              <th>Acción</th>
              <th>Actor</th>
            </tr>
          </thead>
          <tbody>
            {recentAudit.map((event) => (
              <tr key={event.id}>
                <td>{new Date(event.timestamp).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>
                  {event.entityType} · {event.entityId}
                </td>
                <td>{event.action}</td>
                <td>{event.actorId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
