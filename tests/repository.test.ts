/**
 * repository.test.ts — Pruebas unitarias del repositorio de datos.
 *
 * Cubre:
 *   U-10  saveRound → getRoundById: round-trip completo (todos los campos)
 *   U-11  saveAlert → getAlertById: serializa verificationOutcome y resolvedAt
 *   U-12  appendAuditEvents: append-only, acumula todos los eventos
 *   U-13  listAlerts: filtra por residenciaId manualmente (API no tiene parámetro)
 *   U-14  fresh localStorage: load() auto-inicializa la semilla con los conteos del contrato
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Alert, AuditEvent, Round } from '../src/domain/types';

const TEST_RESIDENCIA = 'residencia-demo-01';

const makeRound = (overrides: Partial<Round> = {}): Round => ({
  id: 'round-repo-test',
  residenciaId: TEST_RESIDENCIA,
  residentId: 'resident-01',
  type: 'routine_check',
  scheduledAt: '2026-07-18T08:00:00.000Z',
  dueAt: '2026-07-18T08:15:00.000Z',
  status: 'scheduled',
  createdAt: '2026-07-18T07:00:00.000Z',
  updatedAt: '2026-07-18T07:00:00.000Z',
  ...overrides,
});

const makeAlert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'alert-repo-test',
  residenciaId: TEST_RESIDENCIA,
  roundId: 'round-repo-test',
  residentId: 'resident-01',
  severity: 'yellow',
  status: 'open',
  createdAt: '2026-07-18T08:15:00.000Z',
  ...overrides,
});

const makeAuditEvent = (overrides: Partial<AuditEvent> = {}): AuditEvent => ({
  id: `audit-${Date.now()}-${Math.random()}`,
  residenciaId: TEST_RESIDENCIA,
  entityId: 'round-repo-test',
  entityType: 'round',
  actorId: 'staff-caregiver-01',
  action: 'ROUND_STARTED',
  timestamp: '2026-07-18T08:00:00.000Z',
  ...overrides,
});

describe('Repository — round-trip de rondas (U-10)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('guarda y recupera una ronda con todos sus campos opcionales vacíos', async () => {
    const { saveRound, getRoundById } = await import('../src/data/repository');
    const round = makeRound();
    saveRound(round);
    const retrieved = getRoundById('round-repo-test');
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(round.id);
    expect(retrieved?.status).toBe('scheduled');
    expect(retrieved?.assignedStaffId).toBeUndefined();
    expect(retrieved?.completedAt).toBeUndefined();
  });

  it('guarda y recupera una ronda completada con campos opcionales', async () => {
    const { saveRound, getRoundById } = await import('../src/data/repository');
    const round = makeRound({
      status: 'completed',
      assignedStaffId: 'staff-caregiver-01',
      startedAt: '2026-07-18T08:05:00.000Z',
      completedAt: '2026-07-18T08:12:00.000Z',
      completionOutcome: 'ok',
    });
    saveRound(round);
    const retrieved = getRoundById('round-repo-test');
    expect(retrieved?.status).toBe('completed');
    expect(retrieved?.assignedStaffId).toBe('staff-caregiver-01');
    expect(retrieved?.completedAt).toBe('2026-07-18T08:12:00.000Z');
    expect(retrieved?.completionOutcome).toBe('ok');
  });

  it('sobreescribe una ronda existente con un nuevo estado', async () => {
    const { saveRound, getRoundById } = await import('../src/data/repository');
    saveRound(makeRound({ status: 'due' }));
    saveRound(makeRound({ status: 'in_progress', startedAt: '2026-07-18T08:05:00.000Z' }));
    const retrieved = getRoundById('round-repo-test');
    expect(retrieved?.status).toBe('in_progress');
  });
});

describe('Repository — round-trip de alertas (U-11)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('guarda y recupera una alerta en estado open', async () => {
    const { saveAlert, getAlertById } = await import('../src/data/repository');
    const alert = makeAlert();
    saveAlert(alert);
    const retrieved = getAlertById('alert-repo-test');
    expect(retrieved).toBeDefined();
    expect(retrieved?.severity).toBe('yellow');
    expect(retrieved?.status).toBe('open');
    expect(retrieved?.verificationOutcome).toBeUndefined();
    expect(retrieved?.resolvedAt).toBeUndefined();
  });

  it('guarda y recupera una alerta resuelta con verificationOutcome y resolvedAt', async () => {
    const { saveAlert, getAlertById } = await import('../src/data/repository');
    const alert = makeAlert({
      status: 'resolved',
      assignedStaffId: 'staff-caregiver-01',
      verificationOutcome: 'resident_confirmed_ok',
      resolvedAt: '2026-07-18T09:00:00.000Z',
    });
    saveAlert(alert);
    const retrieved = getAlertById('alert-repo-test');
    expect(retrieved?.status).toBe('resolved');
    expect(retrieved?.verificationOutcome).toBe('resident_confirmed_ok');
    expect(retrieved?.resolvedAt).toBe('2026-07-18T09:00:00.000Z');
  });
});

describe('Repository — auditoría append-only (U-12)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('múltiples appendAuditEvents conserva todos los eventos (no sobreescribe)', async () => {
    const { appendAuditEvents, listAuditEvents } = await import('../src/data/repository');
    const e1 = makeAuditEvent({ id: 'audit-1', action: 'ROUND_STARTED' });
    const e2 = makeAuditEvent({ id: 'audit-2', action: 'ROUND_COMPLETED' });
    const e3 = makeAuditEvent({ id: 'audit-3', action: 'ALERT_CREATED' });
    appendAuditEvents([e1]);
    appendAuditEvents([e2]);
    appendAuditEvents([e3]);
    const all = listAuditEvents();
    expect(all.length).toBeGreaterThanOrEqual(3);
    const ids = all.map((e) => e.id);
    expect(ids).toContain('audit-1');
    expect(ids).toContain('audit-2');
    expect(ids).toContain('audit-3');
  });

  it('appendAuditEvents acepta múltiples eventos en una sola llamada', async () => {
    const { appendAuditEvents, listAuditEvents } = await import('../src/data/repository');
    const events = [
      makeAuditEvent({ id: 'audit-batch-1', action: 'ROUND_STARTED' }),
      makeAuditEvent({ id: 'audit-batch-2', action: 'ROUND_COMPLETED' }),
    ];
    appendAuditEvents(events);
    const all = listAuditEvents();
    const ids = all.map((e) => e.id);
    expect(ids).toContain('audit-batch-1');
    expect(ids).toContain('audit-batch-2');
  });
});

describe('Repository — filtrado por residenciaId (U-13)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('listAlerts devuelve todas las alertas; el filtro por residenciaId se aplica en el llamador', async () => {
    const { saveAlert, listAlerts } = await import('../src/data/repository');
    saveAlert(makeAlert({ id: 'alert-res-a',   residenciaId: 'residencia-a' }));
    saveAlert(makeAlert({ id: 'alert-res-b',   residenciaId: 'residencia-b' }));
    saveAlert(makeAlert({ id: 'alert-res-a-2', residenciaId: 'residencia-a' }));

    const alertsA = listAlerts().filter((a) => a.residenciaId === 'residencia-a');
    expect(alertsA.every((a) => a.residenciaId === 'residencia-a')).toBe(true);
    expect(alertsA.map((a) => a.id)).toContain('alert-res-a');
    expect(alertsA.map((a) => a.id)).toContain('alert-res-a-2');
    expect(alertsA.map((a) => a.id)).not.toContain('alert-res-b');
  });
});

describe('Repository — fresh localStorage inicializa semilla (U-14)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('con localStorage vacío, load() auto-inicializa la semilla con los conteos del contrato', async () => {
    const { listResidents, listRounds, listAlerts } = await import('../src/data/repository');

    const residents = listResidents();
    const rounds    = listRounds();
    const alerts    = listAlerts();

    expect(residents.length).toBeGreaterThanOrEqual(20);
    expect(rounds.length).toBeGreaterThanOrEqual(42);
    expect(alerts.length).toBeGreaterThanOrEqual(7);
  });
});
