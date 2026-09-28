/**
 * qa-roles.spec.ts — Verifica que cada rol solo vea los ítems de nav que le corresponden.
 *
 * Regla del contrato: AppLayout filtra NAV_ITEMS por `activeStaff.role`.
 * Estos tests son de solo lectura — no alteran estado.
 */

import { test, expect } from '@playwright/test';
import { goTo, resetSeed, selectRole } from './helpers';

test.beforeEach(async ({ page }) => {
  await goTo(page, '/dashboard');
  await resetSeed(page);
});

test('cuidador solo ve Dashboard y Mis rondas', async ({ page }) => {
  await selectRole(page, 'caregiver');

  const nav = page.locator('nav.app-nav');
  await expect(nav.locator('a:has-text("Dashboard")')).toBeVisible();
  await expect(nav.locator('a:has-text("Mis rondas")')).toBeVisible();

  await expect(nav.locator('a:has-text("Residentes")')).not.toBeVisible();
  await expect(nav.locator('a:has-text("Alertas")')).not.toBeVisible();
  await expect(nav.locator('a:has-text("Personal")')).not.toBeVisible();
  await expect(nav.locator('a:has-text("Bitácora")')).not.toBeVisible();
});

test('supervisor ve Dashboard, Residentes, Alertas y Personal — no Bitácora', async ({ page }) => {
  await selectRole(page, 'supervisor');

  const nav = page.locator('nav.app-nav');
  await expect(nav.locator('a:has-text("Dashboard")')).toBeVisible();
  await expect(nav.locator('a:has-text("Residentes")')).toBeVisible();
  await expect(nav.locator('a:has-text("Alertas")')).toBeVisible();
  await expect(nav.locator('a:has-text("Personal")')).toBeVisible();

  await expect(nav.locator('a:has-text("Mis rondas")')).not.toBeVisible();
  await expect(nav.locator('a:has-text("Bitácora")')).not.toBeVisible();
});

test('gerente ve todas las secciones incluyendo Bitácora', async ({ page }) => {
  await selectRole(page, 'manager');

  const nav = page.locator('nav.app-nav');
  await expect(nav.locator('a:has-text("Dashboard")')).toBeVisible();
  await expect(nav.locator('a:has-text("Residentes")')).toBeVisible();
  await expect(nav.locator('a:has-text("Alertas")')).toBeVisible();
  await expect(nav.locator('a:has-text("Personal")')).toBeVisible();
  await expect(nav.locator('a:has-text("Bitácora")')).toBeVisible();
});

test('el badge de rol muestra el texto correcto para cada rol', async ({ page }) => {
  await selectRole(page, 'caregiver');
  await expect(page.locator('.badge--role-caregiver')).toHaveText('Cuidador/a');

  await selectRole(page, 'supervisor');
  await expect(page.locator('.badge--role-supervisor')).toHaveText('Supervisor/a');

  await selectRole(page, 'manager');
  await expect(page.locator('.badge--role-manager')).toHaveText('Gerente');
});
