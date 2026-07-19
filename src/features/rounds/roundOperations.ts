/**
 * roundOperations.ts — Orquestación del flujo del cuidador (contrato Chunk 5).
 *
 * Cada acción usa `transitionRound`/`transitionAlert` (dominio, sin modificar) y
 * escribe a través de `repository.ts` (única capa de persistencia). No añade estados
 * ni campos nuevos: el "resultado operacional" de completar una ronda se guarda como
 * `metadata` del `AuditEvent` de la transición (docs/03-data-model.md, decisión 6),
 * no como un campo nuevo en `Round`. "Aceptar alerta asignada" se implementa como la
 * transición ya existente `open → assigned` (autoasignación del cuidador), porque el
 * estado congelado no define una transición separada de "aceptar".
 */

import type { Alert, ID, ISODateTime, Round } from '../../domain/types';
import type { AlertSeverity } from '../../domain/taxonomy';
import { hasActiveAlertForRound } from '../../domain/rules';
import { transitionAlert, transitionRound, type TransitionContext } from '../../domain/transitions';
import { appendAuditEvents, listAlerts, listAuditEvents, saveAlert, saveRound } from '../../data/repository';

export type RoundCompletionOutcome =
  | 'completed_without_issue'
  | 'assistance_requested'
  | 'supervisor_verification_required';

export type OperationResult<T> = { ok: true; value: T } | { ok: false; message: string };

const nextAuditId = (): ID => `audit-live-${listAuditEvents().length + 1}`;

/** Regla 7: solo `due → in_progress` es válido (ver `ROUND_TRANSITIONS`). */
export const startRound = (round: Round, actorId: ID, timestamp: ISODateTime): OperationResult<Round> => {
  const ctx: TransitionContext = { actorId, timestamp, auditEventId: nextAuditId() };
  const result = transitionRound(round, 'in_progress', ctx);
  if (!result.ok) return { ok: false, message: result.error.message };

  const updated = result.round as Round;
  saveRound(updated);
  appendAuditEvents([result.auditEvent]);
  return { ok: true, value: updated };
};

export const completeRound = (
  round: Round,
  actorId: ID,
  timestamp: ISODateTime,
  outcome: RoundCompletionOutcome,
  note: string | undefined,
): OperationResult<Round> => {
  const ctx: TransitionContext = {
    actorId,
    timestamp,
    auditEventId: nextAuditId(),
    metadata: { completionOutcome: outcome },
  };
  const result = transitionRound(round, 'completed', ctx);
  if (!result.ok) return { ok: false, message: result.error.message };

  const trimmedNote = note?.trim();
  const updated: Round = { ...(result.round as Round), completionNote: trimmedNote || undefined };
  saveRound(updated);
  appendAuditEvents([result.auditEvent]);
  return { ok: true, value: updated };
};

/** Regla 4: evita alertas activas duplicadas para la misma ronda. */
export const requestSupport = (
  round: Round,
  severity: AlertSeverity,
  actorId: ID,
  timestamp: ISODateTime,
): OperationResult<Alert> => {
  if (hasActiveAlertForRound(round.id, listAlerts())) {
    return { ok: false, message: 'Ya existe una alerta activa para esta ronda.' };
  }

  const alert: Alert = {
    id: `alert-live-${listAlerts().length + 1}`,
    roundId: round.id,
    residentId: round.residentId,
    severity,
    status: 'open',
    createdAt: timestamp,
  };
  saveAlert(alert);
  appendAuditEvents([
    {
      id: nextAuditId(),
      entityType: 'alert',
      entityId: alert.id,
      action: 'alert:created',
      actorId,
      nextState: 'open',
      timestamp,
    },
  ]);
  return { ok: true, value: alert };
};

/** Autoasignación de una alerta abierta (`open → assigned`, único camino válido). */
export const acceptAlert = (alert: Alert, actorId: ID, timestamp: ISODateTime): OperationResult<Alert> => {
  const ctx: TransitionContext = { actorId, timestamp, auditEventId: nextAuditId() };
  const result = transitionAlert(alert, 'assigned', ctx);
  if (!result.ok) return { ok: false, message: result.error.message };

  const updated: Alert = { ...(result.alert as Alert), assignedStaffId: actorId };
  saveAlert(updated);
  appendAuditEvents([result.auditEvent]);
  return { ok: true, value: updated };
};
