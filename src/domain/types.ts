/**
 * types.ts — Modelo de datos mínimo CONGELADO (contrato §8).
 *
 * Interfaces en TypeScript estricto. Prohibido `any`. Fechas en ISO 8601 (string).
 * Identificadores como cadenas estables. No se persiste información derivable (p. ej.
 * el color del residente). Este módulo es puro: sin IO ni dependencias de interfaz.
 *
 * Los tipos literales del vocabulario provienen de ./taxonomy (fuente única) y se
 * re-exportan aquí por conveniencia para el resto del dominio.
 */

import type {
  Role,
  Shift,
  CareLevel,
  AuditEventAction,
  RoundType,
  RoundStatus,
  AlertStatus,
  AlertSeverity,
  IncidentStatus,
  StaffAvailability,
  ResidentDerivedStatus,
  VerificationOutcome,
  EntityType,
} from './taxonomy';

export type {
  Role,
  Shift,
  CareLevel,
  AuditEventAction,
  RoundType,
  RoundStatus,
  AlertStatus,
  AlertSeverity,
  IncidentStatus,
  StaffAvailability,
  ResidentDerivedStatus,
  VerificationOutcome,
  EntityType,
};

/** Identificador estable (cadena). */
export type ID = string;

/** Marca de tiempo en formato ISO 8601 (p. ej. "2026-07-18T09:30:00.000Z"). */
export type ISODateTime = string;

// --- Entidades -------------------------------------------------------------

/** §8.1 — Persona ficticia asociada con rondas y alertas. No contiene diagnóstico. */
export interface Resident {
  id: ID;
  displayName: string;
  room: string;
  careLevel: CareLevel;
  notes?: string;
  isActive: boolean;
}

/** §8.2 — Usuario ficticio con rol, turno y disponibilidad. */
export interface StaffMember {
  id: ID;
  displayName: string;
  role: Role;
  shift: Shift;
  availability: StaffAvailability;
  isActive: boolean;
}

/** §8.3 — Actividad operacional programada para verificar o asistir a un residente. */
export interface Round {
  id: ID;
  residentId: ID;
  assignedStaffId?: ID;
  type: RoundType;
  scheduledAt: ISODateTime;
  dueAt: ISODateTime;
  startedAt?: ISODateTime;
  completedAt?: ISODateTime;
  status: RoundStatus;
  completionNote?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** §8.4 — Señal operacional que requiere asignación, atención y verificación. */
export interface Alert {
  id: ID;
  roundId: ID;
  residentId: ID;
  severity: AlertSeverity;
  status: AlertStatus;
  assignedStaffId?: ID;
  createdAt: ISODateTime;
  acknowledgedAt?: ISODateTime;
  escalatedAt?: ISODateTime;
  resolvedAt?: ISODateTime;
  closedAt?: ISODateTime;
  verificationOutcome?: VerificationOutcome;
  resolutionNote?: string;
}

/** §8.5 — Registro formal abierto cuando una alerta entra en verificación. */
export interface Incident {
  id: ID;
  alertId: ID;
  residentId: ID;
  status: IncidentStatus;
  openedAt: ISODateTime;
  verificationStartedAt?: ISODateTime;
  resolvedAt?: ISODateTime;
  closedAt?: ISODateTime;
  outcome?: VerificationOutcome;
  notes?: string;
}

/** §8.6 — Registro inmutable (append-only) de una acción o transición. */
export interface AuditEvent {
  id: ID;
  entityType: EntityType;
  entityId: ID;
  action: AuditEventAction;
  actorId: ID;
  previousState?: string;
  nextState?: string;
  timestamp: ISODateTime;
  metadata?: Record<string, unknown>;
}
