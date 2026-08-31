/**
 * dashboardMetrics.ts — Métricas del dashboard del supervisor (contrato Chunk 6).
 *
 * Puro: no hace IO, solo agrega datos ya leídos del repositorio. El color de cada
 * residente se recalcula aquí con `deriveResidentStatus` (nunca se persiste, §6.10).
 * "Tiempo mediano de respuesta" se deriva de la auditoría (primer evento de la alerta
 * distinto de su creación), porque `Alert` (§8.4) no tiene un campo `assignedAt`
 * propio; usar la auditoría evita añadir un campo nuevo al modelo congelado.
 */

import type { Alert, AuditEvent, Incident, Resident, Round } from '../../domain/types';
import { deriveResidentStatus, isAlertActive } from '../../domain/rules';

export interface DashboardMetrics {
  residentsGreen: number;
  residentsYellow: number;
  residentsRed: number;
  roundsUpcoming: number;
  roundsOverdue: number;
  alertsOpen: number;
  alertsUnassigned: number;
  alertsEscalated: number;
  verificationsInProgress: number;
  medianResponseMinutes: number | undefined;
}

const median = (sortedValues: readonly number[]): number => {
  const mid = Math.floor(sortedValues.length / 2);
  return sortedValues.length % 2 === 0 ? (sortedValues[mid - 1] + sortedValues[mid]) / 2 : sortedValues[mid];
};

const computeMedianResponseMinutes = (alerts: readonly Alert[], auditEvents: readonly AuditEvent[]): number | undefined => {
  const responseMinutes: number[] = [];
  for (const alert of alerts) {
    const alertEvents = auditEvents
      .filter((e) => e.entityType === 'alert' && e.entityId === alert.id)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const firstResponse = alertEvents.find((e) => e.action !== 'ALERT_CREATED');
    if (firstResponse === undefined) continue;
    const minutes = (Date.parse(firstResponse.timestamp) - Date.parse(alert.createdAt)) / 60_000;
    if (minutes >= 0) responseMinutes.push(minutes);
  }
  if (responseMinutes.length === 0) return undefined;
  responseMinutes.sort((a, b) => a - b);
  return median(responseMinutes);
};

export const computeDashboardMetrics = (
  residents: readonly Resident[],
  rounds: readonly Round[],
  alerts: readonly Alert[],
  incidents: readonly Incident[],
  auditEvents: readonly AuditEvent[],
): DashboardMetrics => {
  let residentsGreen = 0;
  let residentsYellow = 0;
  let residentsRed = 0;
  for (const resident of residents) {
    const status = deriveResidentStatus(resident.id, rounds, alerts);
    if (status === 'green') residentsGreen += 1;
    else if (status === 'yellow') residentsYellow += 1;
    else residentsRed += 1;
  }

  return {
    residentsGreen,
    residentsYellow,
    residentsRed,
    roundsUpcoming: rounds.filter((r) => r.status === 'scheduled' || r.status === 'due').length,
    roundsOverdue: rounds.filter((r) => r.status === 'overdue').length,
    alertsOpen: alerts.filter((a) => a.status === 'open').length,
    alertsUnassigned: alerts.filter((a) => isAlertActive(a.status) && a.assignedStaffId === undefined).length,
    alertsEscalated: alerts.filter((a) => a.status === 'escalated').length,
    verificationsInProgress: incidents.filter((i) => i.status === 'verification_in_progress').length,
    medianResponseMinutes: computeMedianResponseMinutes(alerts, auditEvents),
  };
};
