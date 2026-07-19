/**
 * alertOperations.ts — Orquestación del flujo del supervisor (contrato Chunk 6).
 *
 * Cada acción usa `transitionAlert`/`transitionIncident` (dominio, sin modificar) y
 * escribe solo a través de `repository.ts`. "Registrar resultado" y "resolver" son una
 * sola acción de dominio (`in_verification → resolved` exige el resultado como
 * argumento de la misma transición — regla 8), así que `resolveAlert` cubre ambos
 * puntos del contrato. "Reasignar" no cambia el estado de la alerta (sigue
 * `assigned`/`escalated`), por lo que no es una transición de la lista blanca; se
 * registra manualmente para cumplir la regla "toda reasignación genera auditoría".
 */

import type { Alert, ID, ISODateTime, Incident } from '../../domain/types';
import type { VerificationOutcome } from '../../domain/taxonomy';
import { transitionAlert, transitionIncident, type TransitionContext } from '../../domain/transitions';
import { appendAuditEvents, listAuditEvents, listIncidents, saveAlert, saveIncident } from '../../data/repository';

export type OperationResult<T> = { ok: true; value: T } | { ok: false; message: string };

const nextAuditId = (): ID => `audit-live-${listAuditEvents().length + 1}`;

export const acknowledgeAlert = (alert: Alert, actorId: ID, timestamp: ISODateTime): OperationResult<Alert> => {
  const ctx: TransitionContext = { actorId, timestamp, auditEventId: nextAuditId() };
  const result = transitionAlert(alert, 'acknowledged', ctx);
  if (!result.ok) return { ok: false, message: result.error.message };
  const updated = result.alert as Alert;
  saveAlert(updated);
  appendAuditEvents([result.auditEvent]);
  return { ok: true, value: updated };
};

/** Primera asignación (`open`/`acknowledged` → `assigned`). */
export const assignAlert = (alert: Alert, staffId: ID, actorId: ID, timestamp: ISODateTime): OperationResult<Alert> => {
  const ctx: TransitionContext = {
    actorId,
    timestamp,
    auditEventId: nextAuditId(),
    metadata: { assignedStaffId: staffId },
  };
  const result = transitionAlert(alert, 'assigned', ctx);
  if (!result.ok) return { ok: false, message: result.error.message };
  const updated: Alert = { ...(result.alert as Alert), assignedStaffId: staffId };
  saveAlert(updated);
  appendAuditEvents([result.auditEvent]);
  return { ok: true, value: updated };
};

/** Cambiar el responsable sin cambiar el estado (`assigned`/`escalated`). */
export const reassignAlert = (alert: Alert, newStaffId: ID, actorId: ID, timestamp: ISODateTime): OperationResult<Alert> => {
  if (alert.status !== 'assigned' && alert.status !== 'escalated') {
    return { ok: false, message: 'Solo se puede reasignar una alerta asignada o escalada.' };
  }
  if (alert.assignedStaffId === newStaffId) {
    return { ok: false, message: 'La alerta ya está asignada a ese responsable.' };
  }
  const previousStaffId = alert.assignedStaffId ?? 'sin_asignar';
  const updated: Alert = { ...alert, assignedStaffId: newStaffId };
  saveAlert(updated);
  appendAuditEvents([
    {
      id: nextAuditId(),
      entityType: 'alert',
      entityId: alert.id,
      action: 'alert:reassigned',
      actorId,
      previousState: previousStaffId,
      nextState: newStaffId,
      timestamp,
    },
  ]);
  return { ok: true, value: updated };
};

export const escalateAlert = (alert: Alert, actorId: ID, timestamp: ISODateTime): OperationResult<Alert> => {
  const ctx: TransitionContext = { actorId, timestamp, auditEventId: nextAuditId() };
  const result = transitionAlert(alert, 'escalated', ctx);
  if (!result.ok) return { ok: false, message: result.error.message };
  const updated = result.alert as Alert;
  saveAlert(updated);
  appendAuditEvents([result.auditEvent]);
  return { ok: true, value: updated };
};

/** Inicia verificación: transiciona la alerta y abre (o reutiliza) el incidente asociado. */
export const startVerification = (
  alert: Alert,
  actorId: ID,
  timestamp: ISODateTime,
): OperationResult<{ alert: Alert; incident: Incident }> => {
  const alertCtx: TransitionContext = { actorId, timestamp, auditEventId: nextAuditId() };
  const alertResult = transitionAlert(alert, 'in_verification', alertCtx);
  if (!alertResult.ok) return { ok: false, message: alertResult.error.message };
  const updatedAlert = alertResult.alert as Alert;
  saveAlert(updatedAlert);
  appendAuditEvents([alertResult.auditEvent]);

  let incident = listIncidents().find((i) => i.alertId === alert.id);
  if (incident === undefined) {
    incident = {
      id: `incident-live-${listIncidents().length + 1}`,
      alertId: alert.id,
      residentId: alert.residentId,
      status: 'open',
      openedAt: timestamp,
    };
    saveIncident(incident);
    appendAuditEvents([
      {
        id: nextAuditId(),
        entityType: 'incident',
        entityId: incident.id,
        action: 'incident:created',
        actorId,
        nextState: 'open',
        timestamp,
      },
    ]);
  }

  const incidentCtx: TransitionContext = { actorId, timestamp, auditEventId: nextAuditId() };
  const incidentResult = transitionIncident(incident, 'verification_in_progress', incidentCtx);
  if (!incidentResult.ok) return { ok: false, message: incidentResult.error.message };
  const updatedIncident = incidentResult.incident as Incident;
  saveIncident(updatedIncident);
  appendAuditEvents([incidentResult.auditEvent]);

  return { ok: true, value: { alert: updatedAlert, incident: updatedIncident } };
};

/** Registrar resultado + resolver (una sola transición de dominio); resuelve también el incidente asociado. */
export const resolveAlert = (
  alert: Alert,
  outcome: VerificationOutcome,
  actorId: ID,
  timestamp: ISODateTime,
): OperationResult<Alert> => {
  const ctx: TransitionContext = { actorId, timestamp, auditEventId: nextAuditId() };
  const result = transitionAlert(alert, 'resolved', ctx, outcome);
  if (!result.ok) return { ok: false, message: result.error.message };
  const updated = result.alert as Alert;
  saveAlert(updated);
  appendAuditEvents([result.auditEvent]);

  const incident = listIncidents().find((i) => i.alertId === alert.id);
  if (incident !== undefined && incident.status === 'verification_in_progress') {
    const incidentCtx: TransitionContext = { actorId, timestamp, auditEventId: nextAuditId() };
    const incidentResult = transitionIncident(incident, 'resolved', incidentCtx, outcome);
    if (incidentResult.ok) {
      saveIncident(incidentResult.incident as Incident);
      appendAuditEvents([incidentResult.auditEvent]);
    }
  }
  return { ok: true, value: updated };
};

export const closeAlert = (alert: Alert, actorId: ID, timestamp: ISODateTime): OperationResult<Alert> => {
  const ctx: TransitionContext = { actorId, timestamp, auditEventId: nextAuditId() };
  const result = transitionAlert(alert, 'closed', ctx);
  if (!result.ok) return { ok: false, message: result.error.message };
  const updated = result.alert as Alert;
  saveAlert(updated);
  appendAuditEvents([result.auditEvent]);

  const incident = listIncidents().find((i) => i.alertId === alert.id);
  if (incident !== undefined && incident.status === 'resolved') {
    const incidentCtx: TransitionContext = { actorId, timestamp, auditEventId: nextAuditId() };
    const incidentResult = transitionIncident(incident, 'closed', incidentCtx);
    if (incidentResult.ok) {
      saveIncident(incidentResult.incident as Incident);
      appendAuditEvents([incidentResult.auditEvent]);
    }
  }
  return { ok: true, value: updated };
};
