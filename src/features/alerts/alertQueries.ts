/**
 * alertQueries.ts — Lecturas derivadas para el detalle de alerta (contrato Chunk 6).
 *
 * Puro: recibe listas ya cargadas del repositorio, no hace IO. El "historial de
 * asignaciones" y la "línea de tiempo auditable" se construyen a partir del registro
 * de auditoría (append-only), que ya es la fuente de verdad de todo lo ocurrido.
 */

import type { AuditEvent, ID } from '../../domain/types';

export interface AssignmentHistoryEntry {
  timestamp: string;
  actorId: ID;
  staffId: ID;
  action: string;
}

/** Toda asignación/reasignación de la alerta, en orden cronológico. */
export const getAssignmentHistory = (alertId: ID, auditEvents: readonly AuditEvent[]): AssignmentHistoryEntry[] => {
  const entries: AssignmentHistoryEntry[] = [];
  for (const event of auditEvents) {
    if (event.entityType !== 'alert' || event.entityId !== alertId) continue;
    if (event.action === 'ALERT_REASSIGNED' && event.nextState !== undefined) {
      entries.push({ timestamp: event.timestamp, actorId: event.actorId, staffId: event.nextState, action: 'Reasignada' });
    } else if (event.nextState === 'assigned') {
      const staffId = (event.metadata?.assignedStaffId as ID | undefined) ?? undefined;
      if (staffId !== undefined) {
        entries.push({ timestamp: event.timestamp, actorId: event.actorId, staffId, action: 'Asignada' });
      }
    }
  }
  return entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};

export interface TimelineEntry {
  timestamp: string;
  entityType: AuditEvent['entityType'];
  entityId: ID;
  action: string;
  actorId: ID;
  previousState?: string;
  nextState?: string;
}

/** Línea de tiempo combinada de la alerta y su incidente asociado (si existe). */
export const getAlertTimeline = (
  alertId: ID,
  incidentId: ID | undefined,
  auditEvents: readonly AuditEvent[],
): TimelineEntry[] =>
  auditEvents
    .filter(
      (e) =>
        (e.entityType === 'alert' && e.entityId === alertId) ||
        (incidentId !== undefined && e.entityType === 'incident' && e.entityId === incidentId),
    )
    .map((e) => ({
      timestamp: e.timestamp,
      entityType: e.entityType,
      entityId: e.entityId,
      action: e.action,
      actorId: e.actorId,
      previousState: e.previousState,
      nextState: e.nextState,
    }))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
