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
  const result = transitionRound(round, to, { actorId, timestamp, auditEventId: nextAuditId() });
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
  const result = transitionAlert(alert, to, { actorId, timestamp, auditEventId: nextAuditId() }, outcome);
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
  const result = transitionIncident(incident, to, { actorId, timestamp, auditEventId: nextAuditId() }, outcome);
  if (!result.ok) {
    throw new Error(`Semilla inválida: incident ${incident.id} ${incident.status}->${to}: ${result.error.message}`);
  }
  auditEvents.push(result.auditEvent);
  return result.incident as Incident;
};

// --- Residentes (10, ficticios, sin diagnóstico) -----------------------------

export const buildResidents = (): Resident[] => {
  const residents: Resident[] = [
    { id: 'resident-01', displayName: 'Marta Ibáñez', room: '101', careLevel: 'medium', isActive: true },
    { id: 'resident-02', displayName: 'Antonio Salas', room: '102', careLevel: 'medium', isActive: true },
    { id: 'resident-03', displayName: 'Carmen Duarte', room: '103', careLevel: 'high', isActive: true },
    { id: 'resident-04', displayName: 'Luis Peralta', room: '104', careLevel: 'high', isActive: true },
    { id: 'resident-05', displayName: 'Elena Vidal', room: '105', careLevel: 'high', isActive: true },
    { id: 'resident-06', displayName: 'Ramón Ochoa', room: '106', careLevel: 'medium', isActive: true },
    { id: 'resident-07', displayName: 'Sofía Lezama', room: '107', careLevel: 'high', isActive: true },
    { id: 'resident-08', displayName: 'Pedro Andrade', room: '108', careLevel: 'medium', isActive: true },
    { id: 'resident-09', displayName: 'Isabel Correa', room: '109', careLevel: 'low', isActive: true },
    { id: 'resident-10', displayName: 'Manuel Bravo', room: '110', careLevel: 'low', isActive: true },
  ];
  residents.forEach((r) => recordCreation('resident', r.id, 'RESIDENT_CREATED', 'active', SYSTEM_SEED_ACTOR, atOffset(-2880)));
  return residents;
};

// --- Personal: 3 cuidadores + 1 supervisor, 3 turnos -------------------------

export const buildStaffMembers = (): StaffMember[] => {
  const staff: StaffMember[] = [
    { id: 'staff-caregiver-01', displayName: 'Diego Franco', role: 'caregiver', shift: SHIFT.morning, availability: 'available', isActive: true },
    { id: 'staff-caregiver-02', displayName: 'Valeria Núñez', role: 'caregiver', shift: SHIFT.afternoon, availability: 'busy', isActive: true },
    { id: 'staff-caregiver-03', displayName: 'Tomás Reyes', role: 'caregiver', shift: SHIFT.night, availability: 'off_shift', isActive: true },
    { id: 'staff-supervisor-01', displayName: 'Patricia Möller', role: 'supervisor', shift: SHIFT.morning, availability: 'available', isActive: true },
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

  // 1. resident-01 — Escenario 1: residente sin alertas (ronda futura, verde).
  rounds.push(
    createRound('round-01', 'resident-01', 'routine_check', atOffset(120), atOffset(135), atOffset(-1440), 'staff-caregiver-01'),
  );

  // 2. resident-02 — Escenario 2: ronda próxima (vencerá pronto, aún no vencida).
  let r02 = createRound('round-02', 'resident-02', 'hydration_check', atOffset(-15), atOffset(10), atOffset(-1440), 'staff-caregiver-02');
  r02 = applyRound(r02, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-15));
  rounds.push(r02);

  // 3. resident-03 — Escenario 3 + 5: ronda amarilla por retraso, alerta sin asignar.
  let r03 = createRound('round-03', 'resident-03', 'mobility_assistance', atOffset(-90), atOffset(-60), atOffset(-200));
  r03 = applyRound(r03, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-90));
  r03 = applyRound(r03, 'overdue', SYSTEM_CLOCK_ACTOR, atOffset(-60));
  rounds.push(r03);
  const alert01Created: Alert = {
    id: 'alert-01',
    roundId: r03.id,
    residentId: r03.residentId,
    severity: 'yellow',
    status: 'open',
    createdAt: atOffset(-59),
  };
  recordCreation('alert', alert01Created.id, 'ALERT_CREATED', 'open', SYSTEM_CLOCK_ACTOR, atOffset(-59));
  alerts.push(alert01Created);

  // 4. resident-04 — Escenario 4 + 6: ronda roja vencida, alerta asignada.
  let r04 = createRound('round-04', 'resident-04', 'meal_assistance', atOffset(-120), atOffset(-90), atOffset(-240));
  r04 = applyRound(r04, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-120));
  r04 = applyRound(r04, 'overdue', SYSTEM_CLOCK_ACTOR, atOffset(-90));
  rounds.push(r04);
  let alert02: Alert = {
    id: 'alert-02',
    roundId: r04.id,
    residentId: r04.residentId,
    severity: 'red',
    status: 'open',
    createdAt: atOffset(-89),
  };
  recordCreation('alert', alert02.id, 'ALERT_CREATED', 'open', SYSTEM_CLOCK_ACTOR, atOffset(-89));
  alert02 = applyAlert(alert02, 'assigned', 'staff-supervisor-01', atOffset(-80));
  alert02.assignedStaffId = 'staff-caregiver-01';
  alerts.push(alert02);

  // 5. resident-05 — Escenario 7: alerta escalada.
  let r05 = createRound('round-05', 'resident-05', 'custom_operational_check', atOffset(-150), atOffset(-120), atOffset(-260));
  r05 = applyRound(r05, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-150));
  r05 = applyRound(r05, 'overdue', SYSTEM_CLOCK_ACTOR, atOffset(-120));
  rounds.push(r05);
  let alert03: Alert = {
    id: 'alert-03',
    roundId: r05.id,
    residentId: r05.residentId,
    severity: 'red',
    status: 'open',
    createdAt: atOffset(-119),
  };
  recordCreation('alert', alert03.id, 'ALERT_CREATED', 'open', SYSTEM_CLOCK_ACTOR, atOffset(-119));
  alert03 = applyAlert(alert03, 'assigned', 'staff-supervisor-01', atOffset(-110));
  alert03.assignedStaffId = 'staff-caregiver-02';
  alert03 = applyAlert(alert03, 'escalated', 'staff-supervisor-01', atOffset(-95));
  alerts.push(alert03);

  // 6. resident-06 — Escenario 8: verificación en progreso (alerta + incidente).
  let r06 = createRound('round-06', 'resident-06', 'routine_check', atOffset(-180), atOffset(-150), atOffset(-300));
  r06 = applyRound(r06, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-180));
  r06 = applyRound(r06, 'overdue', SYSTEM_CLOCK_ACTOR, atOffset(-150));
  rounds.push(r06);
  let alert04: Alert = {
    id: 'alert-04',
    roundId: r06.id,
    residentId: r06.residentId,
    severity: 'red',
    status: 'open',
    createdAt: atOffset(-149),
  };
  recordCreation('alert', alert04.id, 'ALERT_CREATED', 'open', SYSTEM_CLOCK_ACTOR, atOffset(-149));
  alert04 = applyAlert(alert04, 'assigned', 'staff-supervisor-01', atOffset(-140));
  alert04.assignedStaffId = 'staff-caregiver-03';
  alert04 = applyAlert(alert04, 'in_verification', 'staff-supervisor-01', atOffset(-130));
  alerts.push(alert04);
  let incident01: Incident = {
    id: 'incident-01',
    alertId: alert04.id,
    residentId: r06.residentId,
    status: 'open',
    openedAt: atOffset(-130),
  };
  recordCreation('incident', incident01.id, 'INCIDENT_OPENED', 'open', 'staff-supervisor-01', atOffset(-130));
  incident01 = applyIncident(incident01, 'verification_in_progress', 'staff-supervisor-01', atOffset(-129));
  incidents.push(incident01);

  // 7. resident-07 — Escenario 9: incidente resuelto (alerta amarilla resuelta y cerrada).
  let r07 = createRound('round-07', 'resident-07', 'hydration_check', atOffset(-360), atOffset(-330), atOffset(-480));
  r07 = applyRound(r07, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-360));
  r07 = applyRound(r07, 'overdue', SYSTEM_CLOCK_ACTOR, atOffset(-330));
  rounds.push(r07);
  let alert05: Alert = {
    id: 'alert-05',
    roundId: r07.id,
    residentId: r07.residentId,
    severity: 'yellow',
    status: 'open',
    createdAt: atOffset(-329),
  };
  recordCreation('alert', alert05.id, 'ALERT_CREATED', 'open', SYSTEM_CLOCK_ACTOR, atOffset(-329));
  alert05 = applyAlert(alert05, 'assigned', 'staff-supervisor-01', atOffset(-320));
  alert05.assignedStaffId = 'staff-caregiver-02';
  alert05 = applyAlert(alert05, 'in_verification', 'staff-supervisor-01', atOffset(-310));
  const resolutionOutcome: VerificationOutcome = 'assistance_provided';
  alert05 = applyAlert(alert05, 'resolved', 'staff-supervisor-01', atOffset(-300), resolutionOutcome);
  alert05 = applyAlert(alert05, 'closed', 'staff-supervisor-01', atOffset(-290));
  alerts.push(alert05);
  let incident02: Incident = {
    id: 'incident-02',
    alertId: alert05.id,
    residentId: r07.residentId,
    status: 'open',
    openedAt: atOffset(-310),
  };
  recordCreation('incident', incident02.id, 'INCIDENT_OPENED', 'open', 'staff-supervisor-01', atOffset(-310));
  incident02 = applyIncident(incident02, 'verification_in_progress', 'staff-supervisor-01', atOffset(-309));
  incident02 = applyIncident(incident02, 'resolved', 'staff-supervisor-01', atOffset(-300), resolutionOutcome);
  incident02 = applyIncident(incident02, 'closed', 'staff-supervisor-01', atOffset(-290));
  incidents.push(incident02);

  // 8. resident-08 — Escenario 10: ronda completada.
  let r08 = createRound('round-08', 'resident-08', 'mobility_assistance', atOffset(-100), atOffset(-70), atOffset(-200), 'staff-caregiver-01');
  r08 = applyRound(r08, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-100));
  r08 = applyRound(r08, 'in_progress', 'staff-caregiver-01', atOffset(-95));
  r08 = applyRound(r08, 'completed', 'staff-caregiver-01', atOffset(-80));
  r08.completionNote = 'Asistencia de movilidad realizada sin novedades.';
  rounds.push(r08);

  // 9. resident-09 — otro residente verde (ronda futura, sin alertas).
  rounds.push(
    createRound('round-09', 'resident-09', 'meal_assistance', atOffset(150), atOffset(165), atOffset(-1440), 'staff-caregiver-03'),
  );

  // 10. resident-10 — ronda cancelada (regla 7: no genera alerta).
  let r10 = createRound('round-10', 'resident-10', 'custom_operational_check', atOffset(60), atOffset(75), atOffset(-1440));
  r10 = applyRound(r10, 'cancelled', 'staff-supervisor-01', atOffset(-30));
  rounds.push(r10);

  // 11–20: segunda ronda por residente, para variedad de volumen (sin alertas nuevas).
  let r11 = createRound('round-11', 'resident-01', 'routine_check', atOffset(-1400), atOffset(-1385), atOffset(-1440), 'staff-caregiver-01');
  r11 = applyRound(r11, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-1400));
  r11 = applyRound(r11, 'in_progress', 'staff-caregiver-01', atOffset(-1398));
  r11 = applyRound(r11, 'completed', 'staff-caregiver-01', atOffset(-1390));
  rounds.push(r11);

  let r12 = createRound('round-12', 'resident-02', 'hydration_check', atOffset(-1400), atOffset(-1385), atOffset(-1440), 'staff-caregiver-02');
  r12 = applyRound(r12, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-1400));
  r12 = applyRound(r12, 'in_progress', 'staff-caregiver-02', atOffset(-1397));
  r12 = applyRound(r12, 'completed', 'staff-caregiver-02', atOffset(-1388));
  rounds.push(r12);

  let r13 = createRound('round-13', 'resident-03', 'mobility_assistance', atOffset(-400), atOffset(-385), atOffset(-440), 'staff-caregiver-01');
  r13 = applyRound(r13, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-400));
  r13 = applyRound(r13, 'in_progress', 'staff-caregiver-01', atOffset(-397));
  r13 = applyRound(r13, 'completed', 'staff-caregiver-01', atOffset(-390));
  rounds.push(r13);

  rounds.push(
    createRound('round-14', 'resident-04', 'meal_assistance', atOffset(180), atOffset(195), atOffset(-1440), 'staff-caregiver-02'),
  );

  rounds.push(
    createRound('round-15', 'resident-05', 'custom_operational_check', atOffset(200), atOffset(215), atOffset(-1440), 'staff-caregiver-02'),
  );

  let r16 = createRound('round-16', 'resident-06', 'routine_check', atOffset(-10), atOffset(20), atOffset(-1440), 'staff-caregiver-03');
  r16 = applyRound(r16, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-10));
  rounds.push(r16);

  let r17 = createRound('round-17', 'resident-07', 'hydration_check', atOffset(-500), atOffset(-485), atOffset(-540), 'staff-caregiver-02');
  r17 = applyRound(r17, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-500));
  r17 = applyRound(r17, 'in_progress', 'staff-caregiver-02', atOffset(-497));
  r17 = applyRound(r17, 'completed', 'staff-caregiver-02', atOffset(-490));
  rounds.push(r17);

  let r18 = createRound('round-18', 'resident-08', 'mobility_assistance', atOffset(-20), atOffset(10), atOffset(-1440), 'staff-caregiver-01');
  r18 = applyRound(r18, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-20));
  r18 = applyRound(r18, 'in_progress', 'staff-caregiver-01', atOffset(-5));
  rounds.push(r18);

  let r19 = createRound('round-19', 'resident-09', 'meal_assistance', atOffset(-5), atOffset(25), atOffset(-1440), 'staff-caregiver-03');
  r19 = applyRound(r19, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-5));
  rounds.push(r19);

  let r20 = createRound('round-20', 'resident-10', 'custom_operational_check', atOffset(-600), atOffset(-585), atOffset(-660), 'staff-supervisor-01');
  r20 = applyRound(r20, 'due', SYSTEM_CLOCK_ACTOR, atOffset(-600));
  r20 = applyRound(r20, 'in_progress', 'staff-supervisor-01', atOffset(-597));
  r20 = applyRound(r20, 'completed', 'staff-supervisor-01', atOffset(-590));
  rounds.push(r20);

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
