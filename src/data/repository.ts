/**
 * repository.ts — Única capa de persistencia de la demo (contrato Chunk 3, regla 15/16).
 *
 * Es el único módulo que llama a `localStorage`. Los componentes de React nunca deben
 * acceder a `localStorage` directamente: toda lectura/escritura pasa por las funciones
 * exportadas aquí. Guarda un único documento JSON versionado (`DemoStore`) bajo una
 * clave estable; si el documento almacenado es incompatible o está corrupto, se
 * descarta y se reemplaza por una semilla fresca (migración mínima para el MVP).
 *
 * La auditoría es append-only: `appendAuditEvents` solo concatena, nunca reescribe ni
 * elimina eventos existentes (contrato §6.18).
 */

import type { Alert, AuditEvent, ID, Incident, Resident, Round, StaffMember } from '../domain/types';
import { buildSeedSnapshot } from './seed';

const STORAGE_KEY = 'caresignal:demo-store:v1';
const SCHEMA_VERSION = 1;

export interface DemoStore {
  schemaVersion: number;
  residents: Resident[];
  staffMembers: StaffMember[];
  rounds: Round[];
  alerts: Alert[];
  incidents: Incident[];
  auditEvents: AuditEvent[];
  clockStartTime: string;
  clockOffsetMinutes: number;
}

// --- Construcción y validación de forma ---------------------------------------

const isDemoStoreShape = (value: unknown): value is DemoStore => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.schemaVersion === SCHEMA_VERSION &&
    Array.isArray(v.residents) &&
    Array.isArray(v.staffMembers) &&
    Array.isArray(v.rounds) &&
    Array.isArray(v.alerts) &&
    Array.isArray(v.incidents) &&
    Array.isArray(v.auditEvents) &&
    typeof v.clockStartTime === 'string' &&
    typeof v.clockOffsetMinutes === 'number'
  );
};

const buildFreshStore = (): DemoStore => {
  const seed = buildSeedSnapshot();
  return {
    schemaVersion: SCHEMA_VERSION,
    residents: seed.residents,
    staffMembers: seed.staffMembers,
    rounds: seed.rounds,
    alerts: seed.alerts,
    incidents: seed.incidents,
    auditEvents: seed.auditEvents,
    clockStartTime: seed.clockStartTime,
    clockOffsetMinutes: 0,
  };
};

// --- Carga / persistencia con migración mínima --------------------------------

let cachedStore: DemoStore | undefined;

const persist = (store: DemoStore): void => {
  cachedStore = store;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

/**
 * Carga el documento desde `localStorage`. Si no existe, está corrupto (JSON inválido)
 * o pertenece a un `schemaVersion` distinto (dato incompatible), se limpia y se
 * reemplaza por una semilla fresca.
 */
const load = (): DemoStore => {
  if (cachedStore !== undefined) return cachedStore;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isDemoStoreShape(parsed)) {
        cachedStore = parsed;
        return cachedStore;
      }
    } catch {
      // JSON corrupto: se trata igual que un esquema incompatible, ver abajo.
    }
  }

  const fresh = buildFreshStore();
  persist(fresh);
  return fresh;
};

/** Reinicia toda la demo (datos + auditoría) a la semilla determinista de origen. */
export const resetToSeed = (): DemoStore => {
  const fresh = buildFreshStore();
  persist(fresh);
  return fresh;
};

// --- Residentes ----------------------------------------------------------------

export const listResidents = (): Resident[] => load().residents;
export const getResidentById = (id: ID): Resident | undefined =>
  load().residents.find((r) => r.id === id);

// --- Personal --------------------------------------------------------------------

export const listStaffMembers = (): StaffMember[] => load().staffMembers;
export const getStaffMemberById = (id: ID): StaffMember | undefined =>
  load().staffMembers.find((s) => s.id === id);

// --- Rondas ----------------------------------------------------------------------

export const listRounds = (): Round[] => load().rounds;
export const getRoundById = (id: ID): Round | undefined =>
  load().rounds.find((r) => r.id === id);

/** Reemplaza una ronda existente por su versión actualizada y persiste. */
export const saveRound = (round: Round): void => {
  const store = load();
  const index = store.rounds.findIndex((r) => r.id === round.id);
  if (index === -1) {
    store.rounds.push(round);
  } else {
    store.rounds[index] = round;
  }
  persist(store);
};

// --- Alertas ---------------------------------------------------------------------

export const listAlerts = (): Alert[] => load().alerts;
export const getAlertById = (id: ID): Alert | undefined =>
  load().alerts.find((a) => a.id === id);

export const saveAlert = (alert: Alert): void => {
  const store = load();
  const index = store.alerts.findIndex((a) => a.id === alert.id);
  if (index === -1) {
    store.alerts.push(alert);
  } else {
    store.alerts[index] = alert;
  }
  persist(store);
};

// --- Incidentes ------------------------------------------------------------------

export const listIncidents = (): Incident[] => load().incidents;
export const getIncidentById = (id: ID): Incident | undefined =>
  load().incidents.find((i) => i.id === id);

export const saveIncident = (incident: Incident): void => {
  const store = load();
  const index = store.incidents.findIndex((i) => i.id === incident.id);
  if (index === -1) {
    store.incidents.push(incident);
  } else {
    store.incidents[index] = incident;
  }
  persist(store);
};

// --- Auditoría (append-only) ------------------------------------------------------

export const listAuditEvents = (): AuditEvent[] => load().auditEvents;

/** Añade eventos nuevos al final del registro. Nunca edita ni elimina existentes. */
export const appendAuditEvents = (events: readonly AuditEvent[]): void => {
  if (events.length === 0) return;
  const store = load();
  store.auditEvents = [...store.auditEvents, ...events];
  persist(store);
};

// --- Reloj de demostración (offset en minutos desde `clockStartTime`) -------------

export const getClockStartTime = (): string => load().clockStartTime;
export const getClockOffsetMinutes = (): number => load().clockOffsetMinutes;

export const setClockOffsetMinutes = (minutes: number): void => {
  const store = load();
  store.clockOffsetMinutes = minutes;
  persist(store);
};
