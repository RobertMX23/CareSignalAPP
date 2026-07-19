/**
 * scenarios.ts — Escenarios deterministas de demostración (contrato Chunk 7).
 *
 * Los tres escenarios operan siempre sobre el mismo residente/ronda fijos
 * (`resident-01` / `round-01`, verde y sin alerta en la semilla) para que sean
 * reproducibles: presionar el mismo botón produce siempre el mismo resultado. Cada
 * uno revisa el estado actual antes de actuar, de modo que ejecutarlo más de una vez
 * (o ejecutar los escenarios fuera de orden) no duplica alertas ni repite
 * transiciones — reutilizan las mismas guardas que ya usan el motor temporal y
 * `alertOperations`.
 */

import { advanceByMinutes, getCurrentTime } from '../../data/demoClock';
import { getRoundById, listAlerts } from '../../data/repository';
import { CRITICAL_DELAY_MINUTES } from '../../data/temporalEngine';
import { assignAlert, closeAlert, escalateAlert, resolveAlert, startVerification } from '../alerts/alertOperations';
import type { Alert, ID } from '../../domain/types';
import type { VerificationOutcome } from '../../domain/taxonomy';

export const SCENARIO_ROUND_ID: ID = 'round-01';
const SCENARIO_CAREGIVER_ID: ID = 'staff-caregiver-01';
const SCENARIO_SUPERVISOR_ID: ID = 'staff-supervisor-01';
const SCENARIO_OUTCOME: VerificationOutcome = 'assistance_provided';

export type ScenarioResult = { ok: true; summary: string } | { ok: false; message: string };

const getScenarioAlert = (): Alert | undefined => {
  const candidates = listAlerts().filter((a) => a.roundId === SCENARIO_ROUND_ID);
  if (candidates.length === 0) return undefined;
  return candidates.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
};

/** Escenario 1: la ronda del demo vence sin iniciarse y se genera la alerta inicial. */
export const runMissedRoundScenario = (): ScenarioResult => {
  const round = getRoundById(SCENARIO_ROUND_ID);
  if (round === undefined) return { ok: false, message: 'No se encontró la ronda del escenario.' };
  if (round.status === 'completed' || round.status === 'cancelled') {
    return {
      ok: false,
      message: 'La ronda del escenario ya no está disponible (completada o cancelada). Restablece la demo para repetir el escenario.',
    };
  }
  if (round.status === 'overdue') {
    return { ok: true, summary: 'La ronda ya estaba vencida y con alerta generada; no se repitió ninguna transición.' };
  }

  const targetMs = Date.parse(round.dueAt) + 60_000;
  const deltaMinutes = Math.max(1, Math.ceil((targetMs - Date.parse(getCurrentTime())) / 60_000));
  advanceByMinutes(deltaMinutes);

  const alert = getScenarioAlert();
  return {
    ok: true,
    summary: `Reloj avanzado ${deltaMinutes} min: la ronda quedó vencida y se generó la alerta ${alert?.id ?? '—'} (${alert?.severity ?? '—'}).`,
  };
};

/** Escenario 2: el retraso supera el umbral crítico (alerta roja), se asigna y se escala. */
export const runEscalatedAlertScenario = (): ScenarioResult => {
  const missed = runMissedRoundScenario();
  if (!missed.ok) return missed;

  const round = getRoundById(SCENARIO_ROUND_ID);
  if (round === undefined) return { ok: false, message: 'No se encontró la ronda del escenario.' };

  const targetMs = Date.parse(round.dueAt) + CRITICAL_DELAY_MINUTES * 60_000 + 60_000;
  const deltaMinutes = Math.ceil((targetMs - Date.parse(getCurrentTime())) / 60_000);
  if (deltaMinutes > 0) advanceByMinutes(deltaMinutes);

  let alert = getScenarioAlert();
  if (alert === undefined) return { ok: false, message: 'No se encontró la alerta del escenario.' };

  if (alert.assignedStaffId === undefined) {
    const assignResult = assignAlert(alert, SCENARIO_CAREGIVER_ID, SCENARIO_SUPERVISOR_ID, getCurrentTime());
    if (!assignResult.ok) return { ok: false, message: assignResult.message };
    alert = assignResult.value;
  }

  if (alert.status === 'assigned') {
    const escalateResult = escalateAlert(alert, SCENARIO_SUPERVISOR_ID, getCurrentTime());
    if (!escalateResult.ok) return { ok: false, message: escalateResult.message };
    alert = escalateResult.value;
  }

  return {
    ok: true,
    summary: `Alerta ${alert.id}: severidad ${alert.severity}, estado actual "${alert.status}".`,
  };
};

/** Escenario 3: verificación, resultado, resolución y cierre — ciclo completo. */
export const runFullResolutionScenario = (): ScenarioResult => {
  const escalated = runEscalatedAlertScenario();
  if (!escalated.ok) return escalated;

  let alert = getScenarioAlert();
  if (alert === undefined) return { ok: false, message: 'No se encontró la alerta del escenario.' };

  if (alert.status === 'assigned' || alert.status === 'escalated') {
    const verifyResult = startVerification(alert, SCENARIO_SUPERVISOR_ID, getCurrentTime());
    if (!verifyResult.ok) return { ok: false, message: verifyResult.message };
    alert = verifyResult.value.alert;
  }

  if (alert.status === 'in_verification') {
    const resolveResult = resolveAlert(alert, SCENARIO_OUTCOME, SCENARIO_SUPERVISOR_ID, getCurrentTime());
    if (!resolveResult.ok) return { ok: false, message: resolveResult.message };
    alert = resolveResult.value;
  }

  if (alert.status === 'resolved') {
    const closeResult = closeAlert(alert, SCENARIO_SUPERVISOR_ID, getCurrentTime());
    if (!closeResult.ok) return { ok: false, message: closeResult.message };
    alert = closeResult.value;
  }

  const totalMinutes = Math.round((Date.parse(alert.closedAt ?? getCurrentTime()) - Date.parse(alert.createdAt)) / 60_000);
  return {
    ok: true,
    summary: `Ciclo completo: alerta ${alert.id} cerrada. Tiempo total desde la creación hasta el cierre: ${totalMinutes} min.`,
  };
};
