/**
 * transitions.ts — Máquina de estados CONGELADA (contrato §7) como validadores puros.
 *
 * Enfoque de lista blanca: solo se permiten las transiciones enumeradas; cualquier otra
 * (incluidas las prohibidas de §7) se rechaza con un error controlado. Toda transición
 * válida produce un `AuditEvent` (contrato §6.4, §6.17). Funciones puras: reciben
 * `actorId`, `timestamp` y `auditEventId` como entrada (determinismo, sin IO).
 */

import type {
  Alert,
  AuditEvent,
  ID,
  ISODateTime,
  Incident,
  Round,
} from './types';
import type {
  AlertStatus,
  AuditEventAction,
  EntityType,
  IncidentStatus,
  RoundStatus,
  VerificationOutcome,
} from './taxonomy';
import { alertHasVerificationOutcome, alertWasResolved } from './rules';

// --- Resultado controlado ---------------------------------------------------

export type DomainErrorCode =
  | 'INVALID_TRANSITION'
  | 'MISSING_VERIFICATION_OUTCOME'
  | 'RESOLVE_BEFORE_CLOSE';

export interface DomainError {
  code: DomainErrorCode;
  message: string;
}

export interface TransitionSuccess<S extends string> {
  ok: true;
  nextState: S;
  auditEvent: AuditEvent;
}

export interface TransitionFailure {
  ok: false;
  error: DomainError;
}

export type TransitionResult<S extends string> =
  | TransitionSuccess<S>
  | TransitionFailure;

/** Datos de contexto que toda transición registra (actor, fecha/hora, id de evento). */
export interface TransitionContext {
  actorId: ID;
  residenciaId: ID;
  timestamp: ISODateTime;
  auditEventId: ID;
  metadata?: Record<string, unknown>;
}

// --- Tablas de transición (lista blanca; contrato §7) ----------------------

export const ROUND_TRANSITIONS: Readonly<Record<RoundStatus, readonly RoundStatus[]>> = {
  scheduled: ['due', 'cancelled'],
  due: ['in_progress', 'overdue', 'cancelled'],
  in_progress: ['completed'],
  completed: [],
  overdue: [],
  cancelled: [],
};

export const ALERT_TRANSITIONS: Readonly<Record<AlertStatus, readonly AlertStatus[]>> = {
  open: ['acknowledged', 'assigned'],
  acknowledged: ['assigned'],
  assigned: ['escalated', 'in_verification'],
  escalated: ['assigned', 'in_verification'],
  in_verification: ['resolved'],
  resolved: ['closed'],
  closed: [],
};

export const INCIDENT_TRANSITIONS: Readonly<
  Record<IncidentStatus, readonly IncidentStatus[]>
> = {
  open: ['verification_in_progress'],
  verification_in_progress: ['resolved'],
  resolved: ['closed'],
  closed: [],
};

// --- Consultas de validez ---------------------------------------------------

export const isValidRoundTransition = (from: RoundStatus, to: RoundStatus): boolean =>
  ROUND_TRANSITIONS[from].includes(to);

export const isValidAlertTransition = (from: AlertStatus, to: AlertStatus): boolean =>
  ALERT_TRANSITIONS[from].includes(to);

export const isValidIncidentTransition = (
  from: IncidentStatus,
  to: IncidentStatus,
): boolean => INCIDENT_TRANSITIONS[from].includes(to);

// --- Helpers ----------------------------------------------------------------

const ROUND_ACTIONS: Record<RoundStatus, AuditEventAction> = {
  scheduled: 'ROUND_CREATED',
  due:        'ROUND_DUE',
  in_progress:'ROUND_STARTED',
  completed:  'ROUND_COMPLETED',
  overdue:    'ROUND_OVERDUE',
  cancelled:  'ROUND_CANCELLED',
};

const ALERT_ACTIONS: Record<AlertStatus, AuditEventAction> = {
  open:            'ALERT_CREATED',
  acknowledged:    'ALERT_ACKNOWLEDGED',
  assigned:        'ALERT_ASSIGNED',
  escalated:       'ALERT_ESCALATED',
  in_verification: 'ALERT_VERIFICATION_STARTED',
  resolved:        'ALERT_RESOLVED',
  closed:          'ALERT_CLOSED',
};

const INCIDENT_ACTIONS: Record<IncidentStatus, AuditEventAction> = {
  open:                    'INCIDENT_OPENED',
  verification_in_progress:'INCIDENT_VERIFICATION_STARTED',
  resolved:                'INCIDENT_RESOLVED',
  closed:                  'INCIDENT_CLOSED',
};

const makeAudit = (
  entityType: EntityType,
  entityId: ID,
  action: AuditEventAction,
  previousState: string,
  nextState: string,
  ctx: TransitionContext,
): AuditEvent => ({
  id: ctx.auditEventId,
  residenciaId: ctx.residenciaId,
  entityType,
  entityId,
  action,
  actorId: ctx.actorId,
  previousState,
  nextState,
  timestamp: ctx.timestamp,
  metadata: ctx.metadata,
});

const invalid = (
  entity: EntityType,
  from: string,
  to: string,
): TransitionFailure => ({
  ok: false,
  error: {
    code: 'INVALID_TRANSITION',
    message: `Transición inválida de ${entity}: ${from} → ${to}.`,
  },
});

// --- Aplicadores de transición (puros) -------------------------------------

/** Transiciona una ronda; devuelve la ronda actualizada + AuditEvent, o un error. */
export const transitionRound = (
  round: Round,
  to: RoundStatus,
  ctx: TransitionContext,
): TransitionResult<RoundStatus> & { round?: Round } => {
  if (!isValidRoundTransition(round.status, to)) {
    return invalid('round', round.status, to);
  }
  const auditEvent = makeAudit(
    'round',
    round.id,
    ROUND_ACTIONS[to],
    round.status,
    to,
    ctx,
  );
  const updated: Round = { ...round, status: to, updatedAt: ctx.timestamp };
  if (to === 'in_progress') updated.startedAt = ctx.timestamp;
  if (to === 'completed') updated.completedAt = ctx.timestamp;
  return { ok: true, nextState: to, auditEvent, round: updated };
};

/**
 * Transiciona una alerta. Guardas contractuales:
 *  - in_verification → resolved requiere un `verificationOutcome` (regla 8).
 *  - resolved → closed requiere que la alerta haya sido resuelta (regla 9).
 * `outcome` se aplica cuando la transición es hacia `resolved`.
 */
export const transitionAlert = (
  alert: Alert,
  to: AlertStatus,
  ctx: TransitionContext,
  outcome?: VerificationOutcome,
): TransitionResult<AlertStatus> & { alert?: Alert } => {
  if (!isValidAlertTransition(alert.status, to)) {
    return invalid('alert', alert.status, to);
  }

  if (to === 'resolved') {
    const candidate: Alert =
      outcome !== undefined ? { ...alert, verificationOutcome: outcome } : alert;
    if (!alertHasVerificationOutcome(candidate)) {
      return {
        ok: false,
        error: {
          code: 'MISSING_VERIFICATION_OUTCOME',
          message: 'No se puede resolver una alerta sin resultado de verificación.',
        },
      };
    }
  }

  if (to === 'closed' && !alertWasResolved(alert)) {
    return {
      ok: false,
      error: {
        code: 'RESOLVE_BEFORE_CLOSE',
        message: 'No se puede cerrar una alerta que no fue resuelta.',
      },
    };
  }

  const auditEvent = makeAudit(
    'alert',
    alert.id,
    ALERT_ACTIONS[to],
    alert.status,
    to,
    ctx,
  );
  const updated: Alert = { ...alert, status: to };
  if (to === 'acknowledged') updated.acknowledgedAt = ctx.timestamp;
  if (to === 'escalated') updated.escalatedAt = ctx.timestamp;
  if (to === 'resolved') {
    updated.resolvedAt = ctx.timestamp;
    if (outcome !== undefined) updated.verificationOutcome = outcome;
  }
  if (to === 'closed') updated.closedAt = ctx.timestamp;
  return { ok: true, nextState: to, auditEvent, alert: updated };
};

/** Transiciona un incidente; devuelve el incidente actualizado + AuditEvent, o error. */
export const transitionIncident = (
  incident: Incident,
  to: IncidentStatus,
  ctx: TransitionContext,
  outcome?: VerificationOutcome,
): TransitionResult<IncidentStatus> & { incident?: Incident } => {
  if (!isValidIncidentTransition(incident.status, to)) {
    return invalid('incident', incident.status, to);
  }
  if (to === 'resolved' && incident.outcome === undefined && outcome === undefined) {
    return {
      ok: false,
      error: {
        code: 'MISSING_VERIFICATION_OUTCOME',
        message: 'No se puede resolver un incidente sin resultado de verificación.',
      },
    };
  }
  const auditEvent = makeAudit(
    'incident',
    incident.id,
    INCIDENT_ACTIONS[to],
    incident.status,
    to,
    ctx,
  );
  const updated: Incident = { ...incident, status: to };
  if (to === 'verification_in_progress') updated.verificationStartedAt = ctx.timestamp;
  if (to === 'resolved') {
    updated.resolvedAt = ctx.timestamp;
    if (outcome !== undefined) updated.outcome = outcome;
  }
  if (to === 'closed') updated.closedAt = ctx.timestamp;
  return { ok: true, nextState: to, auditEvent, incident: updated };
};
