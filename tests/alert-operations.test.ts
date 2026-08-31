/**
 * alert-operations.test.ts — Cubre las pruebas obligatorias del flujo del
 * supervisor: #5 (reasignar), #6 (escalar), #7 (iniciar verificación), #10 (cerrar
 * correctamente) y #11 (conservar auditoría).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const freshModules = async () => {
  vi.resetModules();
  const repository = await import('../src/data/repository');
  const alertOperations = await import('../src/features/alerts/alertOperations');
  return { repository, alertOperations };
};

describe('Flujo del supervisor (contrato Chunk 6)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('ciclo completo: asignar -> reasignar -> escalar -> verificar -> resolver -> cerrar', async () => {
    const { repository, alertOperations } = await freshModules();
    let alert = repository.getAlertById('alert-01');
    expect(alert?.status).toBe('open');
    if (alert === undefined) return;

    const assigned = alertOperations.assignAlert(alert, 'staff-caregiver-01', 'staff-supervisor-01', '2026-07-18T08:00:00.000Z');
    expect(assigned.ok).toBe(true);
    if (!assigned.ok) return;
    alert = assigned.value;

    // #5 reasignar
    const reassigned = alertOperations.reassignAlert(alert, 'staff-caregiver-02', 'staff-supervisor-01', '2026-07-18T08:01:00.000Z');
    expect(reassigned.ok).toBe(true);
    if (!reassigned.ok) return;
    alert = reassigned.value;
    expect(alert.assignedStaffId).toBe('staff-caregiver-02');

    // #6 escalar
    const escalated = alertOperations.escalateAlert(alert, 'staff-supervisor-01', '2026-07-18T08:02:00.000Z');
    expect(escalated.ok).toBe(true);
    if (!escalated.ok) return;
    alert = escalated.value;
    expect(alert.status).toBe('escalated');

    // #7 iniciar verificación (crea el incidente asociado)
    const verified = alertOperations.startVerification(alert, 'staff-supervisor-01', '2026-07-18T08:03:00.000Z');
    expect(verified.ok).toBe(true);
    if (!verified.ok) return;
    alert = verified.value.alert;
    expect(alert.status).toBe('in_verification');
    expect(verified.value.incident.status).toBe('verification_in_progress');

    const resolved = alertOperations.resolveAlert(alert, 'assistance_provided', 'staff-supervisor-01', '2026-07-18T08:04:00.000Z');
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    alert = resolved.value;

    // #10 cerrar correctamente
    const closed = alertOperations.closeAlert(alert, 'staff-supervisor-01', '2026-07-18T08:05:00.000Z');
    expect(closed.ok).toBe(true);
    if (!closed.ok) return;
    expect(closed.value.status).toBe('closed');

    const closedIncident = repository.listIncidents().find((i) => i.alertId === 'alert-01');
    expect(closedIncident?.status).toBe('closed');

    // #11 conservar auditoría: cada paso del ciclo dejó su propio evento
    const auditActions = repository
      .listAuditEvents()
      .filter((e) => e.entityId === 'alert-01')
      .map((e) => e.action);
    expect(auditActions).toContain('ALERT_CREATED');
    expect(auditActions).toContain('ALERT_ASSIGNED');
    expect(auditActions).toContain('ALERT_REASSIGNED');
    expect(auditActions).toContain('ALERT_ESCALATED');
    expect(auditActions).toContain('ALERT_VERIFICATION_STARTED');
    expect(auditActions).toContain('ALERT_RESOLVED');
    expect(auditActions).toContain('ALERT_CLOSED');
  });

  it('reasignar registra su propio evento de auditoría aunque el estado no cambie', async () => {
    const { repository, alertOperations } = await freshModules();
    const alert02 = repository.getAlertById('alert-02');
    expect(alert02?.status).toBe('assigned');
    if (alert02 === undefined) return;

    const before = repository.listAuditEvents().length;
    const result = alertOperations.reassignAlert(alert02, 'staff-caregiver-03', 'staff-supervisor-01', '2026-07-18T08:00:00.000Z');
    expect(result.ok).toBe(true);

    const after = repository.listAuditEvents().length;
    expect(after).toBe(before + 1);
    const event = repository.listAuditEvents().find((e) => e.action === 'ALERT_REASSIGNED' && e.entityId === 'alert-02');
    expect(event?.previousState).toBe('staff-caregiver-01');
    expect(event?.nextState).toBe('staff-caregiver-03');
  });
});
