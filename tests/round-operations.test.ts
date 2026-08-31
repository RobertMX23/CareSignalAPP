/**
 * round-operations.test.ts — Cubre las pruebas obligatorias #1 (completar una
 * ronda), #3 (evitar alerta duplicada vía "solicitar apoyo") y #4 (aceptar alerta).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const freshModules = async () => {
  vi.resetModules();
  const repository = await import('../src/data/repository');
  const roundOperations = await import('../src/features/rounds/roundOperations');
  return { repository, roundOperations };
};

describe('Flujo del cuidador (contrato Chunk 5)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('#1 completa una ronda en curso, guarda la nota y el resultado operacional en la auditoría', async () => {
    const { repository, roundOperations } = await freshModules();
    const round18 = repository.getRoundById('round-18');
    expect(round18?.status).toBe('in_progress');
    if (round18 === undefined) return;

    const result = roundOperations.completeRound(
      round18,
      'staff-caregiver-01',
      '2026-07-18T08:05:00.000Z',
      'needs_follow_up',
      'Nota de prueba',
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe('completed');
    expect(result.value.completionOutcome).toBe('needs_follow_up');
    expect(result.value.completionNote).toBe('Nota de prueba');

    const auditEvent = repository
      .listAuditEvents()
      .find((e) => e.entityId === 'round-18' && e.action === 'ROUND_COMPLETED');
    expect(auditEvent?.metadata?.completionOutcome).toBe('needs_follow_up');
  });

  it('rechaza completar una ronda dos veces sin corromper los datos', async () => {
    const { repository, roundOperations } = await freshModules();
    const round18 = repository.getRoundById('round-18');
    if (round18 === undefined) throw new Error('round-18 missing from seed');

    const first = roundOperations.completeRound(round18, 'staff-caregiver-01', '2026-07-18T08:05:00.000Z', 'ok', undefined);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = roundOperations.completeRound(first.value, 'staff-caregiver-01', '2026-07-18T08:06:00.000Z', 'ok', undefined);
    expect(second.ok).toBe(false);

    expect(repository.getRoundById('round-18')?.status).toBe('completed');
  });

  it('#3 impide una segunda solicitud de apoyo si ya hay una alerta activa para la ronda', async () => {
    const { repository, roundOperations } = await freshModules();
    const round01 = repository.getRoundById('round-01');
    if (round01 === undefined) throw new Error('round-01 missing from seed');

    const first = roundOperations.requestSupport(round01, 'yellow', 'staff-caregiver-01', '2026-07-18T08:00:00.000Z');
    expect(first.ok).toBe(true);

    const second = roundOperations.requestSupport(round01, 'red', 'staff-caregiver-01', '2026-07-18T08:01:00.000Z');
    expect(second.ok).toBe(false);

    const alertsForRound = repository.listAlerts().filter((a) => a.roundId === 'round-01');
    expect(alertsForRound).toHaveLength(1);
  });

  it('#4 un cuidador puede aceptar (autoasignarse) una alerta abierta', async () => {
    const { repository, roundOperations } = await freshModules();
    const alert01 = repository.getAlertById('alert-01');
    expect(alert01?.status).toBe('open');
    if (alert01 === undefined) return;

    const result = roundOperations.acceptAlert(alert01, 'staff-caregiver-02', '2026-07-18T08:00:00.000Z');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe('assigned');
    expect(result.value.assignedStaffId).toBe('staff-caregiver-02');
  });
});
