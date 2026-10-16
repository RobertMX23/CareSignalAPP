/**
 * tour-data.test.ts — Integridad de los recorridos guiados (L-05 / B-08).
 *
 *   T-01  existe un tour por rol operativo; demo_admin no tiene tour propio
 *   T-02  entre 4 y 10 pasos por tour (criterio L05-07)
 *   T-03  ids únicos y textos no vacíos
 *   T-04  sin términos prohibidos por el contrato (lenguaje médico)
 *   T-05  cada `target` existe como `data-tour` en el código fuente (anclas no se pudren)
 *   T-06  cada ruta del tour es una ruta real de la app y permitida para ese rol
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_TOURS, getTourForRole, type TourRole } from '../src/features/tour/tours';

const ROOT = resolve(__dirname, '..');
const FORBIDDEN = [
  'paciente',
  'emergencia médica',
  'diagnóstico',
  'evento clínico',
  'visita médica',
  'muerte detectada',
  'monitor cardíaco',
  'expediente',
  'alarma finalizada',
];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const sourceText = walk(join(ROOT, 'src'))
  .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
  .map((f) => readFileSync(f, 'utf-8'))
  .join('\n');

const roles = Object.keys(ALL_TOURS) as TourRole[];

describe('recorridos guiados', () => {
  it('T-01: un tour por rol operativo; demo_admin sin tour', () => {
    expect(roles.sort()).toEqual(['caregiver', 'manager', 'supervisor']);
    expect(getTourForRole('demo_admin')).toBeUndefined();
    for (const role of roles) expect(getTourForRole(role)).toBe(ALL_TOURS[role]);
  });

  it('T-02: entre 4 y 10 pasos por tour', () => {
    for (const role of roles) {
      expect(ALL_TOURS[role].length).toBeGreaterThanOrEqual(4);
      expect(ALL_TOURS[role].length).toBeLessThanOrEqual(10);
    }
  });

  it('T-03: ids únicos y textos no vacíos', () => {
    const ids = roles.flatMap((r) => ALL_TOURS[r].map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const role of roles) {
      for (const step of ALL_TOURS[role]) {
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.body.trim().length).toBeGreaterThan(0);
        expect(step.route.startsWith('/')).toBe(true);
      }
    }
  });

  it('T-04: sin términos prohibidos', () => {
    for (const role of roles) {
      for (const step of ALL_TOURS[role]) {
        const text = `${step.title} ${step.body}`.toLowerCase();
        for (const word of FORBIDDEN) expect(text).not.toContain(word);
      }
    }
  });

  it('T-05: cada target existe como data-tour en el código', () => {
    const targets = new Set(
      roles.flatMap((r) => ALL_TOURS[r].map((s) => s.target).filter((t): t is string => t !== undefined)),
    );
    for (const target of targets) {
      expect(sourceText, `falta data-tour="${target}"`).toContain(`data-tour="${target}"`);
    }
  });

  it('T-06: las rutas existen en App.tsx y su RoleGuard incluye al rol', () => {
    const app = readFileSync(join(ROOT, 'src/App.tsx'), 'utf-8');
    const routeRoles = (path: string): string[] | undefined => {
      const base = path.split('/').filter(Boolean)[0];
      const re = new RegExp(`allowedRoles=\\{\\[([^\\]]*)\\]\\}[^]*?path="${base}[/"]`);
      const m = re.exec(app);
      if (m === null) return undefined;
      // el primer RoleGuard anterior a la ruta; se toma el más cercano
      const before = app.slice(0, app.indexOf(`path="${base}`));
      const guards = [...before.matchAll(/allowedRoles=\{\[([^\]]*)\]\}/g)];
      const last = guards[guards.length - 1];
      return last?.[1].split(',').map((r) => r.replace(/['\s]/g, ''));
    };
    for (const role of roles) {
      for (const step of ALL_TOURS[role]) {
        const allowed = routeRoles(step.route);
        expect(allowed, `ruta sin guardia: ${step.route}`).toBeDefined();
        expect(allowed, `${role} no puede entrar a ${step.route}`).toContain(role);
      }
    }
  });
});
