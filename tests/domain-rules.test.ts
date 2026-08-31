/**
 * domain-rules.test.ts — Cubre la prueba obligatoria #12 (derivar estado del
 * residente) y refuerza la #3 (evitar alerta duplicada) a nivel de regla pura.
 */

import { describe, expect, it } from 'vitest';
import { canRaiseAlertForRound, deriveResidentStatus, hasActiveAlertForRound } from '../src/domain/rules';
import type { Alert, Round } from '../src/domain/types';

const TEST_RESIDENCIA = 'residencia-demo-01';

const round = (overrides: Partial<Round>): Round => ({
  id: 'r1',
  residenciaId: TEST_RESIDENCIA,
  residentId: 'res-1',
  type: 'routine_check',
  scheduledAt: '2026-07-18T08:00:00.000Z',
  dueAt: '2026-07-18T08:15:00.000Z',
  status: 'scheduled',
  createdAt: '2026-07-18T07:00:00.000Z',
  updatedAt: '2026-07-18T07:00:00.000Z',
  ...overrides,
});

const alert = (overrides: Partial<Alert>): Alert => ({
  id: 'a1',
  residenciaId: TEST_RESIDENCIA,
  roundId: 'r1',
  residentId: 'res-1',
  severity: 'yellow',
  status: 'open',
  createdAt: '2026-07-18T08:15:00.000Z',
  ...overrides,
});

describe('#12 deriveResidentStatus', () => {
  it('es green sin rondas vencidas ni alertas activas', () => {
    const status = deriveResidentStatus('res-1', [round({ status: 'completed' })], []);
    expect(status).toBe('green');
  });

  it('es yellow con una alerta amarilla activa (ronda no vencida)', () => {
    const status = deriveResidentStatus('res-1', [round({ status: 'due' })], [alert({ severity: 'yellow', status: 'assigned' })]);
    expect(status).toBe('yellow');
  });

  it('es red con una ronda vencida', () => {
    const status = deriveResidentStatus('res-1', [round({ status: 'overdue' })], []);
    expect(status).toBe('red');
  });

  it('es red con una alerta roja activa, aunque la ronda esté al día', () => {
    const status = deriveResidentStatus('res-1', [round({ status: 'due' })], [alert({ severity: 'red', status: 'escalated' })]);
    expect(status).toBe('red');
  });

  it('red tiene prioridad sobre yellow', () => {
    const status = deriveResidentStatus(
      'res-1',
      [round({ status: 'overdue' })],
      [alert({ severity: 'yellow', status: 'open' })],
    );
    expect(status).toBe('red');
  });

  it('ignora alertas ya resueltas/cerradas', () => {
    const status = deriveResidentStatus(
      'res-1',
      [round({ status: 'completed' })],
      [alert({ severity: 'red', status: 'closed' })],
    );
    expect(status).toBe('green');
  });
});

describe('#3 evitar alerta duplicada (regla 4)', () => {
  it('no permite una segunda alerta activa para la misma ronda vencida', () => {
    const overdueRound = round({ status: 'overdue' });
    const existingAlert = alert({ status: 'open' });
    expect(hasActiveAlertForRound('r1', [existingAlert])).toBe(true);
    expect(canRaiseAlertForRound(overdueRound, [existingAlert])).toBe(false);
  });

  it('sí permite generar la alerta cuando no existe una activa', () => {
    const overdueRound = round({ status: 'overdue' });
    expect(canRaiseAlertForRound(overdueRound, [])).toBe(true);
  });

  it('una alerta ya cerrada no cuenta como activa', () => {
    const overdueRound = round({ status: 'overdue' });
    const closedAlert = alert({ status: 'closed' });
    expect(canRaiseAlertForRound(overdueRound, [closedAlert])).toBe(true);
  });
});
