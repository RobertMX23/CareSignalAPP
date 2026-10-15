/**
 * firestoreRepository.ts — Implementación de producción del repositorio.
 *
 * Exporta las mismas funciones que repository.ts (capa demo) pero persiste en
 * Firestore via Cloud Run API en lugar de localStorage.
 *
 * Integración: en App.tsx (modo producción) reemplazar:
 *   import { listRounds, ... } from './data/repository'
 * con:
 *   import { listRounds, ... } from './data/firestoreRepository'
 *
 * Requiere que el usuario esté autenticado (AuthContext) y que VITE_CLOUD_RUN_URL
 * esté configurada. El token JWT se obtiene de firebase/auth.currentUser.
 */

import { getAuth } from 'firebase/auth';
import type { Alert, AuditEvent, Incident, Resident, Round, StaffMember } from '../domain/types';

const BASE_URL = (import.meta.env.VITE_CLOUD_RUN_URL as string | undefined) ?? '';

async function getToken(): Promise<string> {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ── Residentes ──────────────────────────────────────────────────────────────

export const listResidents = (): Promise<Resident[]> =>
  apiFetch<Resident[]>('/residents');

// ── Staff ───────────────────────────────────────────────────────────────────

export const listStaffMembers = (): Promise<StaffMember[]> =>
  apiFetch<StaffMember[]>('/staff');

// ── Rondas ──────────────────────────────────────────────────────────────────

export const listRounds = (): Promise<Round[]> =>
  apiFetch<Round[]>('/rounds');

export const saveRound = (round: Round): Promise<void> =>
  apiFetch<void>(`/rounds/${round.id}`, {
    method: 'PUT',
    body: JSON.stringify(round),
  });

// ── Alertas ─────────────────────────────────────────────────────────────────

export const listAlerts = (): Promise<Alert[]> =>
  apiFetch<Alert[]>('/alerts');

export const saveAlert = (alert: Alert): Promise<void> =>
  apiFetch<void>(`/alerts/${alert.id}`, {
    method: 'PUT',
    body: JSON.stringify(alert),
  });

// ── Incidentes ──────────────────────────────────────────────────────────────

export const listIncidents = (): Promise<Incident[]> =>
  apiFetch<Incident[]>('/incidents');

export const saveIncident = (incident: Incident): Promise<void> =>
  apiFetch<void>(`/incidents/${incident.id}`, {
    method: 'PUT',
    body: JSON.stringify(incident),
  });

// ── Audit log ───────────────────────────────────────────────────────────────

export const listAuditEvents = (): Promise<AuditEvent[]> =>
  apiFetch<AuditEvent[]>('/audit');

export const appendAuditEvents = (events: AuditEvent[]): Promise<void> =>
  Promise.all(
    events.map((e) =>
      apiFetch<void>('/audit', { method: 'POST', body: JSON.stringify(e) })
    )
  ).then(() => undefined);
