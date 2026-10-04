/**
 * qa-accessibility.spec.ts — Validación WCAG 2.1 AA con @axe-core/playwright
 *
 * Objetivo: detectar violaciones de accesibilidad en las 8 páginas principales.
 * Usa tags wcag2a + wcag2aa + wcag21a + wcag21aa (WCAG 2.1 Level AA completo).
 *
 * Gate E6.4: cero violaciones en todas las rutas cubiertas.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { goTo, resetSeed, selectRole } from './helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

type Violation = { id: string; impact: string | null; help: string; nodes: { html: string }[] };

function violationSummary(violations: Violation[]): string {
  if (!violations.length) return '';
  return violations
    .map(v =>
      `[${v.impact ?? 'unknown'}] ${v.id}: ${v.help}\n` +
      v.nodes.slice(0, 2).map(n => `  → ${n.html.slice(0, 120)}`).join('\n'),
    )
    .join('\n\n');
}

test.describe('A11Y — WCAG 2.1 AA (todas las páginas)', () => {
  test.beforeEach(async ({ page }) => {
    await goTo(page, '/dashboard');
    await resetSeed(page);
  });

  test('A-01 /dashboard — supervisor', async ({ page }) => {
    await selectRole(page, 'supervisor');
    await goTo(page, '/dashboard');
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });

  test('A-02 /mis-rondas — caregiver', async ({ page }) => {
    await selectRole(page, 'caregiver');
    await goTo(page, '/mis-rondas');
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });

  test('A-03 /residentes — supervisor', async ({ page }) => {
    await selectRole(page, 'supervisor');
    await goTo(page, '/residentes');
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });

  test('A-04 /alertas — supervisor', async ({ page }) => {
    await selectRole(page, 'supervisor');
    await goTo(page, '/alertas');
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });

  test('A-05 /personal — supervisor', async ({ page }) => {
    await selectRole(page, 'supervisor');
    await goTo(page, '/personal');
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });

  test('A-06 /bitacora — manager', async ({ page }) => {
    await selectRole(page, 'manager');
    await goTo(page, '/bitacora');
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });

  test('A-07 /metricas — supervisor', async ({ page }) => {
    await selectRole(page, 'supervisor');
    await goTo(page, '/metricas');
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });

  test('A-08 /control-demo — demo_admin', async ({ page }) => {
    await selectRole(page, 'demo_admin');
    await goTo(page, '/control-demo');
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, violationSummary(violations)).toHaveLength(0);
  });
});
