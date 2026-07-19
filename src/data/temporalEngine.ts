/**
 * temporalEngine.ts — Motor temporal determinista (contrato Chunk 7).
 *
 * Sincroniza rondas y alertas con el reloj simulado. Reglas del contrato:
 *  - antes de `scheduledAt`: `scheduled`; desde `scheduledAt` hasta `dueAt`: `due`;
 *    después de `dueAt` sin iniciar: `overdue` (transiciones vía `transitionRound`,
 *    dominio sin modificar);
 *  - retraso inicial → alerta amarilla; retraso ≥ `CRITICAL_DELAY_MINUTES` → roja
 *    (la severidad se actualiza directamente, no es parte de la máquina de estados);
 *  - una ronda completada/cancelada nunca se toca aquí (regla: no puede vencerse /
 *    no genera alerta);
 *  - nunca más de una alerta activa por ronda (`hasActiveAlertForRound`);
 *  - nunca cierra ni resuelve alertas automáticamente (requiere verificación humana,
 *    ver `features/alerts/alertOperations.ts`).
 *
 * Idempotente: ejecutarlo varias veces para el mismo instante no repite transiciones
 * ya aplicadas ni duplica alertas (confirmación de no duplicidad, salida esperada
 * del Chunk 7).
 */

import type { Alert, ID, ISODateTime, Round } from '../domain/types';
import { hasActiveAlertForRound, isAlertActive, isRoundTerminal } from '../domain/rules';
import { transitionRound, type TransitionContext } from '../domain/transitions';
import { appendAuditEvents, listAlerts, listAuditEvents, listRounds, saveAlert, saveRound } from './repository';

/** Umbral de retraso (minutos) a partir del cual una alerta pasa de amarilla a roja. */
export const CRITICAL_DELAY_MINUTES = 15;

const SYSTEM_CLOCK_ACTOR: ID = 'system:demo-clock';

const nextAuditId = (): ID => `audit-live-${listAuditEvents().length + 1}`;

export interface TemporalEngineResult {
  roundsTransitioned: { roundId: ID; from: string; to: string }[];
  alertsCreated: ID[];
  alertsEscalatedBySeverity: ID[];
}

export const runTemporalEngine = (currentTime: ISODateTime): TemporalEngineResult => {
  const result: TemporalEngineResult = { roundsTransitioned: [], alertsCreated: [], alertsEscalatedBySeverity: [] };
  const nowMs = Date.parse(currentTime);

  for (const round of listRounds()) {
    if (isRoundTerminal(round.status) || round.status === 'overdue') continue;
    let current: Round = round;

    if (current.status === 'scheduled' && nowMs >= Date.parse(current.scheduledAt)) {
      const ctx: TransitionContext = { actorId: SYSTEM_CLOCK_ACTOR, timestamp: currentTime, auditEventId: nextAuditId() };
      const transition = transitionRound(current, 'due', ctx);
      if (transition.ok) {
        current = transition.round as Round;
        saveRound(current);
        appendAuditEvents([transition.auditEvent]);
        result.roundsTransitioned.push({ roundId: current.id, from: 'scheduled', to: 'due' });
      }
    }

    if (current.status === 'due' && nowMs >= Date.parse(current.dueAt)) {
      const ctx: TransitionContext = { actorId: SYSTEM_CLOCK_ACTOR, timestamp: currentTime, auditEventId: nextAuditId() };
      const transition = transitionRound(current, 'overdue', ctx);
      if (transition.ok) {
        current = transition.round as Round;
        saveRound(current);
        appendAuditEvents([transition.auditEvent]);
        result.roundsTransitioned.push({ roundId: current.id, from: 'due', to: 'overdue' });
      }
    }
  }

  for (const round of listRounds()) {
    if (round.status !== 'overdue') continue;
    const alerts = listAlerts();
    const activeAlert = alerts.find((a) => a.roundId === round.id && isAlertActive(a.status));
    const delayMinutes = (nowMs - Date.parse(round.dueAt)) / 60_000;

    if (activeAlert === undefined) {
      if (hasActiveAlertForRound(round.id, alerts)) continue;
      const alert: Alert = {
        id: `alert-live-${alerts.length + 1}`,
        roundId: round.id,
        residentId: round.residentId,
        severity: delayMinutes >= CRITICAL_DELAY_MINUTES ? 'red' : 'yellow',
        status: 'open',
        createdAt: currentTime,
      };
      saveAlert(alert);
      appendAuditEvents([
        {
          id: nextAuditId(),
          entityType: 'alert',
          entityId: alert.id,
          action: 'alert:created',
          actorId: SYSTEM_CLOCK_ACTOR,
          nextState: 'open',
          timestamp: currentTime,
        },
      ]);
      result.alertsCreated.push(alert.id);
    } else if (activeAlert.severity === 'yellow' && delayMinutes >= CRITICAL_DELAY_MINUTES) {
      const updated: Alert = { ...activeAlert, severity: 'red' };
      saveAlert(updated);
      appendAuditEvents([
        {
          id: nextAuditId(),
          entityType: 'alert',
          entityId: updated.id,
          action: 'alert:severity_escalated_by_delay',
          actorId: SYSTEM_CLOCK_ACTOR,
          previousState: 'yellow',
          nextState: 'red',
          timestamp: currentTime,
        },
      ]);
      result.alertsEscalatedBySeverity.push(updated.id);
    }
  }

  return result;
};
