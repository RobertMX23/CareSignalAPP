/**
 * taxonomy.ts — Vocabulario canónico CONGELADO del dominio CareSignal.
 *
 * Fuente de verdad: docs/01-domain-taxonomy.yaml (contrato §5). Estos valores NO se
 * renombran ni se amplían sin una solicitud formal de cambio y una nueva versión del
 * contrato (§13). Las listas `as const` son la única fuente en tiempo de ejecución;
 * los tipos literales se derivan de ellas para evitar duplicación (contrato §8.7).
 *
 * Este módulo es puro: sin IO, sin acceso a localStorage, sin dependencias de interfaz.
 */

// --- Roles -----------------------------------------------------------------
export const ROLES = ['caregiver', 'supervisor', 'demo_admin'] as const;
export type Role = (typeof ROLES)[number];

// --- Entidades -------------------------------------------------------------
export const ENTITY_TYPES = [
  'resident',
  'staff_member',
  'round',
  'alert',
  'incident',
  'audit_event',
] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

// --- Tipos de ronda (operativos y ficticios, NO médicos) -------------------
export const ROUND_TYPES = [
  'routine_check',
  'hydration_check',
  'mobility_assistance',
  'meal_assistance',
  'custom_operational_check',
] as const;
export type RoundType = (typeof ROUND_TYPES)[number];

// --- Estados de ronda ------------------------------------------------------
export const ROUND_STATUSES = [
  'scheduled',
  'due',
  'in_progress',
  'completed',
  'overdue',
  'cancelled',
] as const;
export type RoundStatus = (typeof ROUND_STATUSES)[number];

// --- Estados de alerta -----------------------------------------------------
export const ALERT_STATUSES = [
  'open',
  'acknowledged',
  'assigned',
  'escalated',
  'in_verification',
  'resolved',
  'closed',
] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

// --- Severidad de alerta ---------------------------------------------------
export const ALERT_SEVERITIES = ['yellow', 'red'] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

// --- Estados de incidente --------------------------------------------------
export const INCIDENT_STATUSES = [
  'open',
  'verification_in_progress',
  'resolved',
  'closed',
] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

// --- Disponibilidad del personal -------------------------------------------
export const STAFF_AVAILABILITIES = ['available', 'busy', 'off_shift'] as const;
export type StaffAvailability = (typeof STAFF_AVAILABILITIES)[number];

// --- Estado visual DERIVADO del residente (nunca se persiste) --------------
export const RESIDENT_DERIVED_STATUSES = ['green', 'yellow', 'red'] as const;
export type ResidentDerivedStatus = (typeof RESIDENT_DERIVED_STATUSES)[number];

/**
 * Resultados de verificación permitidos (contrato, Chunk 6). Vocabulario operacional,
 * NO clínico. Referenciado por Alert.verificationOutcome e Incident.outcome (§8).
 */
export const VERIFICATION_OUTCOMES = [
  'resident_confirmed_ok',
  'assistance_provided',
  'caregiver_support_required',
  'supervisor_follow_up_required',
  'false_alert',
  'other_operational_result',
] as const;
export type VerificationOutcome = (typeof VERIFICATION_OUTCOMES)[number];

/**
 * Sinónimos prohibidos como estados/entidades/identificadores (contrato §5.12).
 * En texto de interfaz solo se permite ALLOWED_UI_PHRASE.
 */
export const FORBIDDEN_SYNONYMS = [
  'paciente',
  'emergencia médica',
  'diagnóstico',
  'evento clínico',
  'visita médica',
  'muerte detectada',
  'monitor cardíaco',
  'expediente',
  'alarma finalizada',
] as const;

export const ALLOWED_UI_PHRASE = 'evento que requiere verificación' as const;

// --- Type guards (validación en tiempo de ejecución) -----------------------
const includes = <T extends readonly string[]>(
  list: T,
  value: string,
): value is T[number] => (list as readonly string[]).includes(value);

export const isRole = (v: string): v is Role => includes(ROLES, v);
export const isEntityType = (v: string): v is EntityType => includes(ENTITY_TYPES, v);
export const isRoundType = (v: string): v is RoundType => includes(ROUND_TYPES, v);
export const isRoundStatus = (v: string): v is RoundStatus => includes(ROUND_STATUSES, v);
export const isAlertStatus = (v: string): v is AlertStatus => includes(ALERT_STATUSES, v);
export const isAlertSeverity = (v: string): v is AlertSeverity =>
  includes(ALERT_SEVERITIES, v);
export const isIncidentStatus = (v: string): v is IncidentStatus =>
  includes(INCIDENT_STATUSES, v);
export const isStaffAvailability = (v: string): v is StaffAvailability =>
  includes(STAFF_AVAILABILITIES, v);
export const isVerificationOutcome = (v: string): v is VerificationOutcome =>
  includes(VERIFICATION_OUTCOMES, v);
