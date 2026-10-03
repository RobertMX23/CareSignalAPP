/**
 * seed.ts — Datos ficticios deterministas (contrato Chunk 3).
 *
 * Genera el estado inicial de la demo: 10 residentes, 3 cuidadores, 1 supervisor,
 * 3 turnos, 20 rondas, 5 alertas y los incidentes/eventos de auditoría coherentes con
 * ellas. Todos los datos son inventados; no hay nombres reales, diagnósticos ni
 * información clínica.
 *
 * Este módulo usa `src/domain/{types,taxonomy,transitions}.ts` SIN modificarlos: cada
 * transición de ronda/alerta/incidente se produce llamando a `transitionRound` /
 * `transitionAlert` / `transitionIncident`, de modo que el trazado de auditoría queda
 * garantizado por la propia máquina de estados (lista blanca), no escrito a mano.
 *
 * Puro y determinista: ninguna fecha usa `Date.now()`; todas se derivan de
 * `DEMO_START_TIME` mediante desplazamientos fijos en minutos.
 */

import type {
  Alert,
  AuditEvent,
  ID,
  ISODateTime,
  Incident,
  Resident,
  Round,
  StaffMember,
} from '../domain/types';
import type { AlertStatus, IncidentStatus, RoundStatus, RoundType, VerificationOutcome } from '../domain/taxonomy';
import { transitionAlert, transitionIncident, transitionRound } from '../domain/transitions';

// --- Reloj de semilla (determinista, sin IO) --------------------------------

/** Instante "ahora" al iniciar una demo fresca. Fijo; no proviene de `Date.now()`. */
export const DEMO_START_TIME: ISODateTime = '2026-07-18T08:00:00.000Z';

/** Identificador fijo de la residencia demo (single-tenant). */
export const DEMO_RESIDENCIA_ID = 'residencia-demo-01';

const START_MS = Date.parse(DEMO_START_TIME);

/** ISO derivada de `DEMO_START_TIME` desplazada N minutos (negativo = pasado). */
const atOffset = (minutes: number): ISODateTime =>
  new Date(START_MS + minutes * 60_000).toISOString();

// --- Alias para legibilidad en el seed (los IDs canónicos vienen de taxonomy.ts) ---
const SHIFT = { morning: 'morning', afternoon: 'afternoon', night: 'night' } as const;

// --- Acumulador de auditoría --------------------------------------------------

let auditCounter = 0;
const nextAuditId = (): ID => `audit-${String(++auditCounter).padStart(4, '0')}`;

const auditEvents: AuditEvent[] = [];

const recordCreation = (
  entityType: AuditEvent['entityType'],
  entityId: ID,
  action: AuditEvent['action'],
  nextState: string,
  actorId: ID,
  timestamp: ISODateTime,
): void => {
  auditEvents.push({
    id: nextAuditId(),
    residenciaId: DEMO_RESIDENCIA_ID,
    entityType,
    entityId,
    action,
    actorId,
    nextState,
    timestamp,
  });
};

const SYSTEM_CLOCK_ACTOR: ID = 'system:demo-clock';
const SYSTEM_SEED_ACTOR: ID = 'system:seed';

// --- Helpers de transición (lanzan si la semilla generase un estado inválido) ---

const applyRound = (round: Round, to: RoundStatus, actorId: ID, timestamp: ISODateTime): Round => {
  const result = transitionRound(round, to, { actorId, residenciaId: DEMO_RESIDENCIA_ID, timestamp, auditEventId: nextAuditId() });
  if (!result.ok) {
    throw new Error(`Semilla inválida: round ${round.id} ${round.status}->${to}: ${result.error.message}`);
  }
  auditEvents.push(result.auditEvent);
  return result.round as Round;
};

const applyAlert = (
  alert: Alert,
  to: AlertStatus,
  actorId: ID,
  timestamp: ISODateTime,
  outcome?: VerificationOutcome,
): Alert => {
  const result = transitionAlert(alert, to, { actorId, residenciaId: DEMO_RESIDENCIA_ID, timestamp, auditEventId: nextAuditId() }, outcome);
  if (!result.ok) {
    throw new Error(`Semilla inválida: alert ${alert.id} ${alert.status}->${to}: ${result.error.message}`);
  }
  auditEvents.push(result.auditEvent);
  return result.alert as Alert;
};

const applyIncident = (
  incident: Incident,
  to: IncidentStatus,
  actorId: ID,
  timestamp: ISODateTime,
  outcome?: VerificationOutcome,
): Incident => {
  const result = transitionIncident(incident, to, { actorId, residenciaId: DEMO_RESIDENCIA_ID, timestamp, auditEventId: nextAuditId() }, outcome);
  if (!result.ok) {
    throw new Error(`Semilla inválida: incident ${incident.id} ${incident.status}->${to}: ${result.error.message}`);
  }
  auditEvents.push(result.auditEvent);
  return result.incident as Incident;
};

// --- Residentes (20, ficticios, sin diagnóstico, habitaciones 101-120) -------

export const buildResidents = (): Resident[] => {
  const R = DEMO_RESIDENCIA_ID;
  const residents: Resident[] = [
    { id: 'resident-01', residenciaId: R, displayName: 'Marta Ibáñez',      room: '101', careLevel: 'medium', isActive: true },
    { id: 'resident-02', residenciaId: R, displayName: 'Antonio Salas',     room: '102', careLevel: 'medium', isActive: true },
    { id: 'resident-03', residenciaId: R, displayName: 'Carmen Duarte',     room: '103', careLevel: 'high',   isActive: true },
    { id: 'resident-04', residenciaId: R, displayName: 'Luis Peralta',      room: '104', careLevel: 'high',   isActive: true },
    { id: 'resident-05', residenciaId: R, displayName: 'Elena Vidal',       room: '105', careLevel: 'high',   isActive: true },
    { id: 'resident-06', residenciaId: R, displayName: 'Ramón Ochoa',       room: '106', careLevel: 'medium', isActive: true },
    { id: 'resident-07', residenciaId: R, displayName: 'Sofía Lezama',      room: '107', careLevel: 'high',   isActive: true },
    { id: 'resident-08', residenciaId: R, displayName: 'Pedro Andrade',     room: '108', careLevel: 'medium', isActive: true },
    { id: 'resident-09', residenciaId: R, displayName: 'Isabel Correa',     room: '109', careLevel: 'low',    isActive: true },
    { id: 'resident-10', residenciaId: R, displayName: 'Manuel Bravo',      room: '110', careLevel: 'low',    isActive: true },
    { id: 'resident-11', residenciaId: R, displayName: 'Concepción Ruiz',   room: '111', careLevel: 'high',   isActive: true },
    { id: 'resident-12', residenciaId: R, displayName: 'Ernesto Campos',    room: '112', careLevel: 'medium', isActive: true },
    { id: 'resident-13', residenciaId: R, displayName: 'Graciela Montes',   room: '113', careLevel: 'high',   isActive: true },
    { id: 'resident-14', residenciaId: R, displayName: 'Héctor Ríos',       room: '114', careLevel: 'low',    isActive: true },
    { id: 'resident-15', residenciaId: R, displayName: 'Irene Castellano',  room: '115', careLevel: 'medium', isActive: true },
    { id: 'resident-16', residenciaId: R, displayName: 'Jacinto Fuentes',   room: '116', careLevel: 'high',   isActive: true },
    { id: 'resident-17', residenciaId: R, displayName: 'Karla Mendoza',     room: '117', careLevel: 'medium', isActive: true },
    { id: 'resident-18', residenciaId: R, displayName: 'Lorenzo Peña',      room: '118', careLevel: 'high',   isActive: true },
    { id: 'resident-19', residenciaId: R, displayName: 'Miriam Castillo',   room: '119', careLevel: 'low',    isActive: true },
    { id: 'resident-20', residenciaId: R, displayName: 'Norberto Aguilar',  room: '120', careLevel: 'medium', isActive: true },
  ];
  residents.forEach((r) => recordCreation('resident', r.id, 'RESIDENT_CREATED', 'active', SYSTEM_SEED_ACTOR, atOffset(-2880)));
  return residents;
};

// --- Personal: 9 cuidadores (3/turno) + 3 supervisores (1/turno) + 2 gerentes ---

export const buildStaffMembers = (): StaffMember[] => {
  const R = DEMO_RESIDENCIA_ID;
  const staff: StaffMember[] = [
    // Turno mañana (06:00-14:00)
    { id: 'staff-caregiver-01', residenciaId: R, displayName: 'Diego Franco',      role: 'caregiver',  shift: SHIFT.morning,   availability: 'available',  isActive: true },
    { id: 'staff-caregiver-04', residenciaId: R, displayName: 'Esperanza Ríos',    role: 'caregiver',  shift: SHIFT.morning,   availability: 'available',  isActive: true },
    { id: 'staff-caregiver-05', residenciaId: R, displayName: 'Bernardo Leal',     role: 'caregiver',  shift: SHIFT.morning,   availability: 'busy',       isActive: true },
    { id: 'staff-supervisor-01', residenciaId: R, displayName: 'Patricia Möller',  role: 'supervisor', shift: SHIFT.morning,   availability: 'available',  isActive: true },
    // Turno tarde (14:00-22:00)
    { id: 'staff-caregiver-02', residenciaId: R, displayName: 'Valeria Núñez',     role: 'caregiver',  shift: SHIFT.afternoon, availability: 'off_shift',  isActive: true },
    { id: 'staff-caregiver-06', residenciaId: R, displayName: 'Rosa Pedraza',      role: 'caregiver',  shift: SHIFT.afternoon, availability: 'off_shift',  isActive: true },
    { id: 'staff-caregiver-07', residenciaId: R, displayName: 'Carlos Ibarra',     role: 'caregiver',  shift: SHIFT.afternoon, availability: 'off_shift',  isActive: true },
    { id: 'staff-supervisor-02', residenciaId: R, displayName: 'Jorge Méndez',     role: 'supervisor', shift: SHIFT.afternoon, availability: 'off_shift',  isActive: true },
    // Turno noche (22:00-06:00)
    { id: 'staff-caregiver-03', residenciaId: R, displayName: 'Tomás Reyes',       role: 'caregiver',  shift: SHIFT.night,     availability: 'off_shift',  isActive: true },
    { id: 'staff-caregiver-08', residenciaId: R, displayName: 'Ana Quiroz',        role: 'caregiver',  shift: SHIFT.night,     availability: 'off_shift',  isActive: true },
    { id: 'staff-caregiver-09', residenciaId: R, displayName: 'Miguel Torres',     role: 'caregiver',  shift: SHIFT.night,     availability: 'off_shift',  isActive: true },
    { id: 'staff-supervisor-03', residenciaId: R, displayName: 'Felipe Ruiz',      role: 'supervisor', shift: SHIFT.night,     availability: 'off_shift',  isActive: true },
    // Gerentes (autoridad transversal de turno)
    { id: 'staff-manager-01',  residenciaId: R, displayName: 'Daniela Escobedo',   role: 'manager',    shift: SHIFT.morning,   availability: 'available',  isActive: true },
    { id: 'staff-manager-02',  residenciaId: R, displayName: 'Ricardo Paz',        role: 'manager',    shift: SHIFT.afternoon, availability: 'off_shift',  isActive: true },
    // Admin demo (acceso a /control-demo — reloj simulado y escenarios)
    { id: 'staff-demo-admin-01', residenciaId: R, displayName: 'Admin Demo',       role: 'demo_admin', shift: SHIFT.morning,   availability: 'available',  isActive: true },
  ];
  staff.forEach((s) => recordCreation('staff_member', s.id, 'STAFF_MEMBER_CREATED', 'active', SYSTEM_SEED_ACTOR, atOffset(-2880)));
  return staff;
};

// --- Rondas (20), alertas (5) e incidentes (2) -------------------------------

interface SeedResult {
  rounds: Round[];
  alerts: Alert[];
  incidents: Incident[];
}

const createRound = (
  id: ID,
  residentId: ID,
  type: RoundType,
  scheduledAt: ISODateTime,
  dueAt: ISODateTime,
  createdAt: ISODateTime,
  assignedStaffId?: ID,
): Round => {
  const round: Round = {
    id,
    residenciaId: DEMO_RESIDENCIA_ID,
    residentId,
    assignedStaffId,
    type,
    scheduledAt,
    dueAt,
    status: 'scheduled',
    createdAt,
    updatedAt: createdAt,
  };
  recordCreation('round', id, 'ROUND_CREATED', 'scheduled', SYSTEM_SEED_ACTOR, createdAt);
  return round;
};

export const buildOperationalData = (): SeedResult => {
  const rounds: Round[] = [];
  const alerts: Alert[] = [];
  const incidents: Incident[] = [];
  const R = DEMO_RESIDENCIA_ID;

  // ── Rondas 01-20: primera ronda por residente, cubre todos los estados ────

  // 1. res-01 (101, medium) — scheduled futuro → verde
  rounds.push(
    createRound('round-01', 'resident-01', 'routine_check', atOffset(180), atOffset(195), atOffset(-1440), 'staff-caregiver-01'),
  );

  // 2. res-02 (102, medium) — due próximo → amarillo
  let r02 = createRound('round-02', 'resident-02', 'hydration_check', atOffset(-15), atOffset(15), atOffset(-1440), 'staff-caregiver-01');
  r02 = applyRound(r02, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-15));
  rounds.push(r02);

  // 3. res-03 (103, high) — in_progress → verde
  let r03 = createRound('round-03', 'resident-03', 'mobility_assistance', atOffset(-50), atOffset(-20), atOffset(-200), 'staff-caregiver-04');
  r03 = applyRound(r03, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-50));
  r03 = applyRound(r03, 'in_progress', 'staff-caregiver-04', atOffset(-40));
  rounds.push(r03);

  // 4. res-04 (104, high) — scheduled futuro → verde (segunda ronda del día)
  rounds.push(
    createRound('round-04', 'resident-04', 'meal_assistance', atOffset(180), atOffset(195), atOffset(-1440), 'staff-caregiver-05'),
  );

  // 5. res-05 (105, high) — overdue → alert-01 open RED → rojo
  let r05 = createRound('round-05', 'resident-05', 'routine_check', atOffset(-150), atOffset(-120), atOffset(-260));
  r05 = applyRound(r05, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-150));
  r05 = applyRound(r05, 'overdue', SYSTEM_CLOCK_ACTOR, atOffset(-120));
  rounds.push(r05);
  const alert01: Alert = {
    id: 'alert-01',
    residenciaId: R,
    roundId: r05.id,
    residentId: r05.residentId,
    severity: 'red',
    status: 'open',
    createdAt: atOffset(-119),
  };
  recordCreation('alert', alert01.id, 'ALERT_CREATED', 'open', SYSTEM_CLOCK_ACTOR, atOffset(-119));
  alerts.push(alert01);

  // 6. res-06 (106, medium) — overdue → alert-02 assigned → rojo
  let r06 = createRound('round-06', 'resident-06', 'hydration_check', atOffset(-120), atOffset(-90), atOffset(-240));
  r06 = applyRound(r06, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-120));
  r06 = applyRound(r06, 'overdue', SYSTEM_CLOCK_ACTOR, atOffset(-90));
  rounds.push(r06);
  let alert02: Alert = {
    id: 'alert-02',
    residenciaId: R,
    roundId: r06.id,
    residentId: r06.residentId,
    severity: 'red',
    status: 'open',
    createdAt: atOffset(-89),
  };
  recordCreation('alert', alert02.id, 'ALERT_CREATED', 'open', SYSTEM_CLOCK_ACTOR, atOffset(-89));
  alert02 = applyAlert(alert02, 'assigned', 'staff-supervisor-01', atOffset(-80));
  alert02.assignedStaffId = 'staff-caregiver-01';
  alerts.push(alert02);

  // 7. res-07 (107, high) — overdue → alert-03 escalated → rojo
  let r07 = createRound('round-07', 'resident-07', 'routine_check', atOffset(-180), atOffset(-150), atOffset(-300));
  r07 = applyRound(r07, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-180));
  r07 = applyRound(r07, 'overdue', SYSTEM_CLOCK_ACTOR, atOffset(-150));
  rounds.push(r07);
  let alert03: Alert = {
    id: 'alert-03',
    residenciaId: R,
    roundId: r07.id,
    residentId: r07.residentId,
    severity: 'red',
    status: 'open',
    createdAt: atOffset(-149),
  };
  recordCreation('alert', alert03.id, 'ALERT_CREATED', 'open', SYSTEM_CLOCK_ACTOR, atOffset(-149));
  alert03 = applyAlert(alert03, 'assigned', 'staff-supervisor-01', atOffset(-140));
  alert03.assignedStaffId = 'staff-caregiver-04';
  alert03 = applyAlert(alert03, 'escalated', 'staff-supervisor-01', atOffset(-125));
  alerts.push(alert03);

  // 8. res-08 (108, medium) — completed(ok) → verde [round-08 requerido por tests]
  let r08 = createRound('round-08', 'resident-08', 'routine_check', atOffset(-120), atOffset(-90), atOffset(-200), 'staff-caregiver-05');
  r08 = applyRound(r08, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-120));
  r08 = applyRound(r08, 'in_progress', 'staff-caregiver-05', atOffset(-115));
  r08 = applyRound(r08, 'completed', 'staff-caregiver-05', atOffset(-100));
  r08.completionNote = 'Ronda de verificación completada sin novedades.';
  r08.completionOutcome = 'ok';
  rounds.push(r08);

  // 8b. res-08 — overdue → alert-04 in_verification + incident-01 → rojo
  let r08b = createRound('round-08b', 'resident-08', 'mobility_assistance', atOffset(-200), atOffset(-170), atOffset(-320));
  r08b = applyRound(r08b, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-200));
  r08b = applyRound(r08b, 'overdue', SYSTEM_CLOCK_ACTOR, atOffset(-170));
  rounds.push(r08b);
  let alert04: Alert = {
    id: 'alert-04',
    residenciaId: R,
    roundId: r08b.id,
    residentId: r08b.residentId,
    severity: 'red',
    status: 'open',
    createdAt: atOffset(-169),
  };
  recordCreation('alert', alert04.id, 'ALERT_CREATED', 'open', SYSTEM_CLOCK_ACTOR, atOffset(-169));
  alert04 = applyAlert(alert04, 'assigned', 'staff-supervisor-01', atOffset(-160));
  alert04.assignedStaffId = 'staff-caregiver-05';
  alert04 = applyAlert(alert04, 'in_verification', 'staff-supervisor-01', atOffset(-150));
  alerts.push(alert04);
  let incident01: Incident = {
    id: 'incident-01',
    residenciaId: R,
    alertId: alert04.id,
    residentId: r08b.residentId,
    status: 'open',
    openedAt: atOffset(-150),
  };
  recordCreation('incident', incident01.id, 'INCIDENT_OPENED', 'open', 'staff-supervisor-01', atOffset(-150));
  incident01 = applyIncident(incident01, 'verification_in_progress', 'staff-supervisor-01', atOffset(-149));
  incidents.push(incident01);

  // 9. res-09 (109, low) — overdue → alert-05 resolved + incident-02 resolved → verde
  let r09 = createRound('round-09', 'resident-09', 'routine_check', atOffset(-360), atOffset(-330), atOffset(-480));
  r09 = applyRound(r09, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-360));
  r09 = applyRound(r09, 'overdue', SYSTEM_CLOCK_ACTOR, atOffset(-330));
  rounds.push(r09);
  let alert05: Alert = {
    id: 'alert-05',
    residenciaId: R,
    roundId: r09.id,
    residentId: r09.residentId,
    severity: 'yellow',
    status: 'open',
    createdAt: atOffset(-329),
  };
  recordCreation('alert', alert05.id, 'ALERT_CREATED', 'open', SYSTEM_CLOCK_ACTOR, atOffset(-329));
  alert05 = applyAlert(alert05, 'assigned', 'staff-supervisor-01', atOffset(-320));
  alert05.assignedStaffId = 'staff-caregiver-01';
  alert05 = applyAlert(alert05, 'in_verification', 'staff-supervisor-01', atOffset(-310));
  const outcome09: VerificationOutcome = 'assistance_provided';
  alert05 = applyAlert(alert05, 'resolved', 'staff-supervisor-01', atOffset(-300), outcome09);
  alerts.push(alert05);
  let incident02: Incident = {
    id: 'incident-02',
    residenciaId: R,
    alertId: alert05.id,
    residentId: r09.residentId,
    status: 'open',
    openedAt: atOffset(-310),
  };
  recordCreation('incident', incident02.id, 'INCIDENT_OPENED', 'open', 'staff-supervisor-01', atOffset(-310));
  incident02 = applyIncident(incident02, 'verification_in_progress', 'staff-supervisor-01', atOffset(-309));
  incident02 = applyIncident(incident02, 'resolved', 'staff-supervisor-01', atOffset(-300), outcome09);
  incidents.push(incident02);

  // 10. res-10 (110, low) — cancelled [round-10 requerido por tests]
  let r10 = createRound('round-10', 'resident-10', 'hydration_check', atOffset(60), atOffset(75), atOffset(-1440));
  r10 = applyRound(r10, 'cancelled', 'staff-supervisor-01', atOffset(-30));
  rounds.push(r10);

  // 10b. res-10 — overdue → alert-06 closed + incident-03 closed → verde
  let r10b = createRound('round-10b', 'resident-10', 'hydration_check', atOffset(-420), atOffset(-390), atOffset(-540));
  r10b = applyRound(r10b, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-420));
  r10b = applyRound(r10b, 'overdue', SYSTEM_CLOCK_ACTOR, atOffset(-390));
  rounds.push(r10b);
  let alert06: Alert = {
    id: 'alert-06',
    residenciaId: R,
    roundId: r10b.id,
    residentId: r10b.residentId,
    severity: 'yellow',
    status: 'open',
    createdAt: atOffset(-389),
  };
  recordCreation('alert', alert06.id, 'ALERT_CREATED', 'open', SYSTEM_CLOCK_ACTOR, atOffset(-389));
  alert06 = applyAlert(alert06, 'assigned', 'staff-supervisor-01', atOffset(-380));
  alert06.assignedStaffId = 'staff-caregiver-04';
  alert06 = applyAlert(alert06, 'in_verification', 'staff-supervisor-01', atOffset(-370));
  const outcome10: VerificationOutcome = 'resident_confirmed_ok';
  alert06 = applyAlert(alert06, 'resolved', 'staff-supervisor-01', atOffset(-360), outcome10);
  alert06 = applyAlert(alert06, 'closed', 'staff-manager-01', atOffset(-350));
  alerts.push(alert06);
  let incident03: Incident = {
    id: 'incident-03',
    residenciaId: R,
    alertId: alert06.id,
    residentId: r10b.residentId,
    status: 'open',
    openedAt: atOffset(-370),
  };
  recordCreation('incident', incident03.id, 'INCIDENT_OPENED', 'open', 'staff-supervisor-01', atOffset(-370));
  incident03 = applyIncident(incident03, 'verification_in_progress', 'staff-supervisor-01', atOffset(-369));
  incident03 = applyIncident(incident03, 'resolved', 'staff-supervisor-01', atOffset(-360), outcome10);
  incident03 = applyIncident(incident03, 'closed', 'staff-manager-01', atOffset(-350));
  incidents.push(incident03);

  // 11. res-11 (111, high) — scheduled futuro → verde
  rounds.push(
    createRound('round-11', 'resident-11', 'routine_check', atOffset(240), atOffset(255), atOffset(-1440), 'staff-caregiver-01'),
  );

  // 12. res-12 (112, medium) — due → amarillo
  let r12 = createRound('round-12', 'resident-12', 'hydration_check', atOffset(-10), atOffset(20), atOffset(-1440), 'staff-caregiver-04');
  r12 = applyRound(r12, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-10));
  rounds.push(r12);

  // 13. res-13 (113, high) — in_progress → verde
  let r13 = createRound('round-13', 'resident-13', 'mobility_assistance', atOffset(-60), atOffset(-30), atOffset(-200), 'staff-caregiver-05');
  r13 = applyRound(r13, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-60));
  r13 = applyRound(r13, 'in_progress', 'staff-caregiver-05', atOffset(-50));
  rounds.push(r13);

  // 14. res-14 (114, low) — completed(needs_follow_up) → verde
  let r14 = createRound('round-14', 'resident-14', 'meal_assistance', atOffset(-200), atOffset(-170), atOffset(-280), 'staff-caregiver-01');
  r14 = applyRound(r14, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-200));
  r14 = applyRound(r14, 'in_progress', 'staff-caregiver-01', atOffset(-195));
  r14 = applyRound(r14, 'completed', 'staff-caregiver-01', atOffset(-180));
  r14.completionNote = 'Requiere seguimiento nutricional operativo.';
  r14.completionOutcome = 'needs_follow_up';
  rounds.push(r14);

  // 15. res-15 (115, medium) — in_progress + alerta amarilla manual → amarillo
  //   La ronda está en curso pero el cuidador levantó una alerta amarilla.
  //   No hay ronda overdue → deriveResidentStatus devuelve yellow.
  let r15 = createRound('round-15', 'resident-15', 'routine_check', atOffset(-30), atOffset(30), atOffset(-200), 'staff-caregiver-04');
  r15 = applyRound(r15, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-30));
  r15 = applyRound(r15, 'in_progress', 'staff-caregiver-04', atOffset(-25));
  rounds.push(r15);
  const alert07: Alert = {
    id: 'alert-07',
    residenciaId: R,
    roundId: r15.id,
    residentId: r15.residentId,
    severity: 'yellow',
    status: 'open',
    createdAt: atOffset(-24),
  };
  recordCreation('alert', alert07.id, 'ALERT_CREATED', 'open', 'staff-caregiver-04', atOffset(-24));
  alerts.push(alert07);

  // 16. res-16 (116, high) — in_progress → verde
  let r16 = createRound('round-16', 'resident-16', 'custom_operational_check', atOffset(-30), atOffset(0), atOffset(-200), 'staff-caregiver-04');
  r16 = applyRound(r16, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-30));
  r16 = applyRound(r16, 'in_progress', 'staff-caregiver-04', atOffset(-20));
  rounds.push(r16);

  // 17. res-17 (117, medium) — due → verde (dentro del plazo)
  let r17 = createRound('round-17', 'resident-17', 'routine_check', atOffset(-5), atOffset(25), atOffset(-1440), 'staff-caregiver-05');
  r17 = applyRound(r17, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-5));
  rounds.push(r17);

  // 18. res-18 (118, high) — in_progress (para compatibilidad tests round-18)
  let r18 = createRound('round-18', 'resident-18', 'mobility_assistance', atOffset(-20), atOffset(10), atOffset(-1440), 'staff-caregiver-01');
  r18 = applyRound(r18, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-20));
  r18 = applyRound(r18, 'in_progress', 'staff-caregiver-01', atOffset(-5));
  rounds.push(r18);

  // 19. res-19 (119, low) — scheduled futuro → verde
  rounds.push(
    createRound('round-19', 'resident-19', 'meal_assistance', atOffset(150), atOffset(165), atOffset(-1440), 'staff-caregiver-01'),
  );

  // 20. res-20 (120, medium) — cancelled (regla 7: no genera alerta) → verde
  let r20 = createRound('round-20', 'resident-20', 'routine_check', atOffset(60), atOffset(75), atOffset(-1440));
  r20 = applyRound(r20, 'cancelled', 'staff-supervisor-01', atOffset(-30));
  rounds.push(r20);

  // ── Rondas 21-40: segunda ronda histórica por residente (todas completadas) ─

  const hist = (
    id: string, residentId: string, type: RoundType,
    staffId: string, baseOffset: number,
  ): void => {
    let r = createRound(id, residentId, type, atOffset(baseOffset), atOffset(baseOffset + 15), atOffset(baseOffset - 30), staffId);
    r = applyRound(r, 'due', SYSTEM_CLOCK_ACTOR, atOffset(baseOffset));
    r = applyRound(r, 'in_progress', staffId, atOffset(baseOffset + 5));
    r = applyRound(r, 'completed', staffId, atOffset(baseOffset + 12));
    r.completionOutcome = 'ok';
    rounds.push(r);
  };

  hist('round-21', 'resident-01', 'routine_check',        'staff-caregiver-01', -1400);
  hist('round-22', 'resident-02', 'hydration_check',      'staff-caregiver-04', -1400);
  hist('round-23', 'resident-03', 'routine_check',        'staff-caregiver-05', -400);
  hist('round-24', 'resident-04', 'hydration_check',      'staff-caregiver-01', -600);
  hist('round-25', 'resident-05', 'mobility_assistance',  'staff-caregiver-04', -480);
  hist('round-26', 'resident-06', 'routine_check',        'staff-caregiver-05', -500);
  hist('round-27', 'resident-07', 'hydration_check',      'staff-caregiver-01', -600);
  hist('round-28', 'resident-08', 'routine_check',        'staff-caregiver-04', -700);
  hist('round-29', 'resident-09', 'meal_assistance',      'staff-caregiver-05', -720);
  hist('round-30', 'resident-10', 'routine_check',        'staff-caregiver-01', -800);
  hist('round-31', 'resident-11', 'hydration_check',      'staff-caregiver-04', -500);
  hist('round-32', 'resident-12', 'mobility_assistance',  'staff-caregiver-05', -450);
  hist('round-33', 'resident-13', 'routine_check',        'staff-caregiver-01', -400);
  hist('round-34', 'resident-14', 'hydration_check',      'staff-caregiver-04', -350);
  hist('round-35', 'resident-15', 'routine_check',        'staff-caregiver-05', -480);
  hist('round-36', 'resident-16', 'hydration_check',      'staff-caregiver-01', -550);
  hist('round-37', 'resident-17', 'mobility_assistance',  'staff-caregiver-04', -400);
  hist('round-38', 'resident-18', 'routine_check',        'staff-caregiver-05', -600);
  hist('round-39', 'resident-19', 'meal_assistance',      'staff-caregiver-01', -720);
  hist('round-40', 'resident-20', 'custom_operational_check', 'staff-caregiver-04', -500);

  return { rounds, alerts, incidents };
};

// --- Punto de entrada: construye el snapshot completo de la semilla ---------

export interface SeedSnapshot {
  residents: Resident[];
  staffMembers: StaffMember[];
  rounds: Round[];
  alerts: Alert[];
  incidents: Incident[];
  auditEvents: AuditEvent[];
  clockStartTime: ISODateTime;
}

/**
 * Construye un snapshot fresco y determinista de la semilla. Reinicia el contador
 * de auditoría interno para que dos llamadas sucesivas produzcan IDs idénticos
 * (determinismo exigido por el gate C3).
 */
export const buildSeedSnapshot = (): SeedSnapshot => {
  auditCounter = 0;
  auditEvents.length = 0;

  const residents = buildResidents();
  const staffMembers = buildStaffMembers();
  const { rounds, alerts, incidents } = buildOperationalData();

  return {
    residents,
    staffMembers,
    rounds,
    alerts,
    incidents,
    auditEvents: [...auditEvents],
    clockStartTime: DEMO_START_TIME,
  };
};

// --- Validación de integridad referencial (contrato Chunk 3, salida esperada) ---

/** Devuelve la lista de problemas encontrados; vacía significa integridad correcta. */
export const validateReferentialIntegrity = (snapshot: SeedSnapshot): string[] => {
  const problems: string[] = [];
  const residentIds = new Set(snapshot.residents.map((r) => r.id));
  const staffIds = new Set(snapshot.staffMembers.map((s) => s.id));
  const roundIds = new Set(snapshot.rounds.map((r) => r.id));
  const alertIds = new Set(snapshot.alerts.map((a) => a.id));

  for (const round of snapshot.rounds) {
    if (!residentIds.has(round.residentId)) {
      problems.push(`Round ${round.id} referencia residentId inexistente: ${round.residentId}`);
    }
    if (round.assignedStaffId !== undefined && !staffIds.has(round.assignedStaffId)) {
      problems.push(`Round ${round.id} referencia assignedStaffId inexistente: ${round.assignedStaffId}`);
    }
  }
  for (const alert of snapshot.alerts) {
    if (!roundIds.has(alert.roundId)) {
      problems.push(`Alert ${alert.id} referencia roundId inexistente: ${alert.roundId}`);
    }
    if (!residentIds.has(alert.residentId)) {
      problems.push(`Alert ${alert.id} referencia residentId inexistente: ${alert.residentId}`);
    }
    if (alert.assignedStaffId !== undefined && !staffIds.has(alert.assignedStaffId)) {
      problems.push(`Alert ${alert.id} referencia assignedStaffId inexistente: ${alert.assignedStaffId}`);
    }
  }
  for (const incident of snapshot.incidents) {
    if (!alertIds.has(incident.alertId)) {
      problems.push(`Incident ${incident.id} referencia alertId inexistente: ${incident.alertId}`);
    }
    if (!residentIds.has(incident.residentId)) {
      problems.push(`Incident ${incident.id} referencia residentId inexistente: ${incident.residentId}`);
    }
  }
  const knownEntityIds: Record<AuditEvent['entityType'], Set<ID>> = {
    resident: residentIds,
    staff_member: staffIds,
    round: roundIds,
    alert: alertIds,
    incident: new Set(snapshot.incidents.map((i) => i.id)),
    audit_event: new Set(snapshot.auditEvents.map((e) => e.id)),
  };
  for (const event of snapshot.auditEvents) {
    if (!knownEntityIds[event.entityType].has(event.entityId)) {
      problems.push(`AuditEvent ${event.id} referencia ${event.entityType} inexistente: ${event.entityId}`);
    }
  }

  return problems;
};
