/**
 * domain-transitions.test.ts — Cubre las pruebas obligatorias del Chunk 8 relativas a
 * la máquina de estados: #8 (impedir cierre sin resolución), #9 (resolver con
 * resultado), #19 (rechazar transiciones inválidas). Domain puro, sin repositorio.
 */

import { describe, expect, it } from 'vitest';
import { transitionAlert, transitionIncident, transitionRound } from '../src/domain/transitions';
import type { Alert, Incident, Round } from '../src/domain/types';

const ctx = (auditEventId: string) => ({
  actorId: 'test-actor',
  timestamp: '2026-07-18T08:00:00.000Z',
  auditEventId,
});

const baseRound: Round = {
  id: 'round-x',
  residentId: 'resident-x',
  type: 'routine_check',
  scheduledAt: '2026-07-18T08:00:00.000Z',
  dueAt: '2026-07-18T08:15:00.000Z',
  status: 'due',
  createdAt: '2026-07-18T07:00:00.000Z',
  updatedAt: '2026-07-18T07:00:00.000Z',
};

const baseAlert: Alert = {
  id: 'alert-x',
  roundId: 'round-x',
  residentId: 'resident-x',
  severity: 'yellow',
  status: 'in_verification',
  createdAt: '2026-07-18T08:00:00.000Z',
};

const baseIncident: Incident = {
  id: 'incident-x',
  alertId: 'alert-x',
  residentId: 'resident-x',
  status: 'verification_in_progress',
  openedAt: '2026-07-18T08:00:00.000Z',
};

describe('Round transitions', () => {
  it('permite due -> in_progress -> completed', () => {
    const started = transitionRound(baseRound, 'in_progress', ctx('a1'));
    expect(started.ok).toBe(true);
    if (!started.ok) return;
    const completed = transitionRound(started.round as Round, 'completed', ctx('a2'));
    expect(completed.ok).toBe(true);
  });

  it('rechaza completed -> overdue (una ronda completada no puede vencerse)', () => {
    const completedRound: Round = { ...baseRound, status: 'completed' };
    const result = transitionRound(completedRound, 'overdue', ctx('a3'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('INVALID_TRANSITION');
  });

  it('rechaza completar dos veces (completed -> completed)', () => {
    const completedRound: Round = { ...baseRound, status: 'completed' };
    const result = transitionRound(completedRound, 'completed', ctx('a4'));
    expect(result.ok).toBe(false);
  });

  it('rechaza cancelled -> due (una ronda cancelada es terminal)', () => {
    const cancelledRound: Round = { ...baseRound, status: 'cancelled' };
    const result = transitionRound(cancelledRound, 'due', ctx('a5'));
    expect(result.ok).toBe(false);
  });
});

describe('Alert transitions — pruebas obligatorias #8, #9, #19', () => {
  it('#19 rechaza resolver una alerta que no está en verificación', () => {
    const assignedAlert: Alert = { ...baseAlert, status: 'assigned' };
    const result = transitionAlert(assignedAlert, 'resolved', ctx('b1'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('INVALID_TRANSITION');
  });

  it('#9 rechaza resolver sin resultado de verificación', () => {
    const result = transitionAlert(baseAlert, 'resolved', ctx('b2'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('MISSING_VERIFICATION_OUTCOME');
  });

  it('#9 permite resolver con resultado', () => {
    const result = transitionAlert(baseAlert, 'resolved', ctx('b3'), 'resident_confirmed_ok');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.alert?.verificationOutcome).toBe('resident_confirmed_ok');
    expect(result.alert?.resolvedAt).toBeDefined();
  });

  it('#8 impide cerrar una alerta que no fue resuelta', () => {
    // Nota (hallazgo QA Chunk 8, severidad low): la lista blanca de ALERT_TRANSITIONS
    // solo permite `resolved -> closed`, y ese único estado ya satisface
    // `alertWasResolved()`, así que el código `RESOLVE_BEFORE_CLOSE` es inalcanzable
    // en la práctica; cualquier intento de cerrar desde otro estado cae primero en
    // `INVALID_TRANSITION`. La regla 8 (no cerrar sin resolver) igual se cumple en
    // todos los casos observables; no se modifica `transitions.ts` (dominio congelado)
    // para esto. Ver docs/04-acceptance-tests.md.
    const assignedAlert: Alert = { ...baseAlert, status: 'assigned' };
    const result = transitionAlert(assignedAlert, 'closed', ctx('b4'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('INVALID_TRANSITION');
  });

  it('#8 permite cerrar una alerta ya resuelta', () => {
    const resolvedAlert: Alert = { ...baseAlert, status: 'resolved', resolvedAt: '2026-07-18T08:10:00.000Z' };
    const result = transitionAlert(resolvedAlert, 'closed', ctx('b5'));
    expect(result.ok).toBe(true);
  });

  it('rechaza closed -> open (una alerta cerrada es terminal)', () => {
    const closedAlert: Alert = { ...baseAlert, status: 'closed' };
    const result = transitionAlert(closedAlert, 'open', ctx('b6'));
    expect(result.ok).toBe(false);
  });
});

describe('Incident transitions', () => {
  it('rechaza resolver un incidente sin resultado', () => {
    const result = transitionIncident(baseIncident, 'resolved', ctx('c1'));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('MISSING_VERIFICATION_OUTCOME');
  });

  it('permite resolver un incidente con resultado', () => {
    const result = transitionIncident(baseIncident, 'resolved', ctx('c2'), 'assistance_provided');
    expect(result.ok).toBe(true);
  });
});
