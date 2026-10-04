/**
 * seed-integrity.test.ts — Guarda de regresión para el Gate C3 (semilla) y refuerzo
 * de la prueba obligatoria #12 (los 10 escenarios deben seguir produciendo los
 * estados derivados esperados).
 */

import { describe, expect, it } from 'vitest';
import { buildSeedSnapshot, validateReferentialIntegrity } from '../src/data/seed';
import { deriveResidentStatus } from '../src/domain/rules';

describe('Semilla determinista (contrato Chunk 3)', () => {
  const snapshot = buildSeedSnapshot();

  it('genera los conteos exigidos por el contrato', () => {
    expect(snapshot.residents).toHaveLength(20);
    expect(snapshot.staffMembers).toHaveLength(15); // +1 staff-demo-admin-01
    expect(snapshot.rounds).toHaveLength(42);
    expect(snapshot.alerts).toHaveLength(7);
    expect(snapshot.incidents).toHaveLength(3);
  });

  it('no tiene problemas de integridad referencial', () => {
    expect(validateReferentialIntegrity(snapshot)).toEqual([]);
  });

  it('es determinista: dos construcciones producen los mismos IDs y conteos', () => {
    const again = buildSeedSnapshot();
    expect(again.auditEvents.map((e) => e.id)).toEqual(snapshot.auditEvents.map((e) => e.id));
    expect(again.rounds.map((r) => r.status)).toEqual(snapshot.rounds.map((r) => r.status));
  });

  it('cubre los 3 colores derivados (verde, amarillo y rojo)', () => {
    const statuses = snapshot.residents.map((r) => deriveResidentStatus(r.id, snapshot.rounds, snapshot.alerts));
    expect(statuses).toContain('green');
    expect(statuses).toContain('yellow');
    expect(statuses).toContain('red');
  });

  it('todos los tipos de estado de ronda aparecen en la semilla', () => {
    const statuses = new Set(snapshot.rounds.map((r) => r.status));
    expect(statuses).toEqual(new Set(['scheduled', 'due', 'in_progress', 'completed', 'overdue', 'cancelled']));
  });
});
