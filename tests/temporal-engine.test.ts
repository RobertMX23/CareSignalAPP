/**
 * temporal-engine.test.ts — Cubre las pruebas obligatorias #2 (generar alerta al
 * vencer) y #3 (evitar alerta duplicada), más las reglas temporales del Chunk 7
 * sobre rondas completadas/canceladas. Usa `vi.resetModules()` para reiniciar el
 * caché en memoria del repositorio entre pruebas (no se modifica `repository.ts`
 * solo para pruebas).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const freshModules = async () => {
  vi.resetModules();
  const repository = await import('../src/data/repository');
  const temporalEngine = await import('../src/data/temporalEngine');
  return { repository, temporalEngine };
};

describe('Motor temporal (contrato Chunk 7)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('#2 transiciona due -> overdue y genera una alerta amarilla al vencer', async () => {
    const { repository, temporalEngine } = await freshModules();
    const round02 = repository.getRoundById('round-02');
    expect(round02?.status).toBe('due');
    if (round02 === undefined) return;

    const justAfterDue = new Date(Date.parse(round02.dueAt) + 60_000).toISOString();
    temporalEngine.runTemporalEngine(justAfterDue);

    expect(repository.getRoundById('round-02')?.status).toBe('overdue');
    const alerts = repository.listAlerts().filter((a) => a.roundId === 'round-02');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('yellow');
  });

  it('#3 no duplica la alerta ni la transición al ejecutarse dos veces para el mismo instante', async () => {
    const { repository, temporalEngine } = await freshModules();
    const round02 = repository.getRoundById('round-02');
    if (round02 === undefined) throw new Error('round-02 missing from seed');

    const justAfterDue = new Date(Date.parse(round02.dueAt) + 60_000).toISOString();
    temporalEngine.runTemporalEngine(justAfterDue);
    temporalEngine.runTemporalEngine(justAfterDue);
    temporalEngine.runTemporalEngine(justAfterDue);

    const alerts = repository.listAlerts().filter((a) => a.roundId === 'round-02');
    expect(alerts).toHaveLength(1);
  });

  it('escala una alerta amarilla existente a roja al superar el umbral crítico, sin duplicar el evento', async () => {
    const { repository, temporalEngine } = await freshModules();
    const round02 = repository.getRoundById('round-02');
    if (round02 === undefined) throw new Error('round-02 missing from seed');

    // Primer paso: justo tras vencer (crea la alerta amarilla, retraso mínimo).
    const justAfterDue = new Date(Date.parse(round02.dueAt) + 60_000).toISOString();
    temporalEngine.runTemporalEngine(justAfterDue);
    expect(repository.listAlerts().find((a) => a.roundId === 'round-02')?.severity).toBe('yellow');

    // Segundo paso: supera el umbral crítico. La alerta YA existía en amarillo, así
    // que aquí sí se genera el evento de escalado por retraso (a diferencia de un
    // salto directo desde el inicio, que crearía la alerta ya en rojo sin ese evento).
    const critical = new Date(
      Date.parse(round02.dueAt) + (temporalEngine.CRITICAL_DELAY_MINUTES + 1) * 60_000,
    ).toISOString();
    temporalEngine.runTemporalEngine(critical);
    temporalEngine.runTemporalEngine(critical); // repetir: no debe duplicar el evento

    const alerts = repository.listAlerts().filter((a) => a.roundId === 'round-02');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('red');

    const escalations = repository
      .listAuditEvents()
      .filter((e) => e.entityId === alerts[0].id && e.action === 'ALERT_SEVERITY_ESCALATED');
    expect(escalations).toHaveLength(1);
  });

  it('un salto directo más allá del umbral crítico crea la alerta ya en rojo (sin evento de escalado)', async () => {
    const { repository, temporalEngine } = await freshModules();
    const round02 = repository.getRoundById('round-02');
    if (round02 === undefined) throw new Error('round-02 missing from seed');

    const critical = new Date(
      Date.parse(round02.dueAt) + (temporalEngine.CRITICAL_DELAY_MINUTES + 1) * 60_000,
    ).toISOString();
    temporalEngine.runTemporalEngine(critical);

    const alerts = repository.listAlerts().filter((a) => a.roundId === 'round-02');
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('red');
  });

  it('una ronda completada nunca vence ni genera alerta', async () => {
    const { repository, temporalEngine } = await freshModules();
    const completedRound = repository.getRoundById('round-08');
    expect(completedRound?.status).toBe('completed');

    temporalEngine.runTemporalEngine('2026-07-25T08:00:00.000Z');

    expect(repository.getRoundById('round-08')?.status).toBe('completed');
    expect(repository.listAlerts().some((a) => a.roundId === 'round-08')).toBe(false);
  });

  it('una ronda cancelada nunca genera alerta', async () => {
    const { repository, temporalEngine } = await freshModules();
    const cancelledRound = repository.getRoundById('round-10');
    expect(cancelledRound?.status).toBe('cancelled');

    temporalEngine.runTemporalEngine('2026-07-25T08:00:00.000Z');

    expect(repository.listAlerts().some((a) => a.roundId === 'round-10')).toBe(false);
  });
});
