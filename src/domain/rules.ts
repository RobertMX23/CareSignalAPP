/**
 * rules.ts — Reglas de negocio puras del dominio (contrato §6).
 *
 * Funciones puras y deterministas: sin IO, sin localStorage, sin dependencias de UI.
 * El color del residente se DERIVA aquí y nunca se persiste (contrato §6.10, §8.7).
 */

import type { Alert, Round, ResidentDerivedStatus, ID } from './types';
import type { AlertStatus, RoundStatus } from './taxonomy';

// --- Clasificación de estados activos --------------------------------------

/** Estados de alerta que se consideran "activos" (aún requieren atención). */
export const ACTIVE_ALERT_STATUSES: readonly AlertStatus[] = [
  'open',
  'acknowledged',
  'assigned',
  'escalated',
  'in_verification',
];

/** Una alerta está activa si no está resuelta ni cerrada. */
export const isAlertActive = (status: AlertStatus): boolean =>
  ACTIVE_ALERT_STATUSES.includes(status);

/** Estados de ronda que "consumen" la ronda (no puede vencerse ni alertar más). */
export const isRoundTerminal = (status: RoundStatus): boolean =>
  status === 'completed' || status === 'cancelled';

// --- Regla 4: unicidad de alerta activa por ronda --------------------------

/** ¿Existe ya una alerta activa para esta ronda? */
export const hasActiveAlertForRound = (
  roundId: ID,
  alerts: readonly Alert[],
): boolean =>
  alerts.some((a) => a.roundId === roundId && isAlertActive(a.status));

/**
 * Regla 3 + 4: una ronda vencida (`overdue`) puede originar una alerta, siempre que no
 * exista ya una alerta activa para la misma ronda. Devuelve `true` si se puede crear.
 * La severidad (yellow/red) la decide el motor temporal (Chunk 7), no esta función.
 */
export const canRaiseAlertForRound = (
  round: Round,
  alerts: readonly Alert[],
): boolean => round.status === 'overdue' && !hasActiveAlertForRound(round.id, alerts);

// --- Reglas 8 y 9: resolver requiere resultado; cerrar requiere resolver ----

/** Regla 8: una alerta solo puede resolverse si tiene un resultado de verificación. */
export const alertHasVerificationOutcome = (alert: Alert): boolean =>
  alert.verificationOutcome !== undefined;

/** Regla 9: una alerta solo puede cerrarse si previamente fue resuelta. */
export const alertWasResolved = (alert: Alert): boolean =>
  alert.status === 'resolved' || alert.resolvedAt !== undefined;

// --- Regla 6/10: estado visual DERIVADO del residente ----------------------

/**
 * `deriveResidentStatus` — función pura (contrato §6.10, §8.7).
 * NUNCA se persiste el resultado; se recalcula a partir de rondas y alertas.
 *
 * Reglas (docs/01-domain-taxonomy.yaml → resident_status_derived):
 *  - red    : existe alerta roja activa (no resuelta) O una ronda `overdue`.
 *  - yellow : (no red) y existe alerta amarilla activa.
 *  - green  : no existen rondas vencidas ni alertas activas relevantes.
 *
 * Nota de alcance: el matiz "retraso inicial" (yellow por ronda tardía pero no vencida)
 * depende del motor temporal (Chunk 7), que levantará una alerta amarilla; por eso aquí
 * el amarillo por rondas se expresa vía alertas y no vía un estado de ronda inexistente.
 */
export const deriveResidentStatus = (
  residentId: ID,
  rounds: readonly Round[],
  alerts: readonly Alert[],
): ResidentDerivedStatus => {
  const residentRounds = rounds.filter((r) => r.residentId === residentId);
  const residentAlerts = alerts.filter((a) => a.residentId === residentId);

  const hasOverdueRound = residentRounds.some((r) => r.status === 'overdue');
  const hasActiveRedAlert = residentAlerts.some(
    (a) => a.severity === 'red' && isAlertActive(a.status),
  );
  if (hasActiveRedAlert || hasOverdueRound) {
    return 'red';
  }

  const hasActiveYellowAlert = residentAlerts.some(
    (a) => a.severity === 'yellow' && isAlertActive(a.status),
  );
  if (hasActiveYellowAlert) {
    return 'yellow';
  }

  return 'green';
};
