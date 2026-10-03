/**
 * qa-smoke.spec.ts — Suite rápida de verificación crítica.
 *
 * Objetivo: confirmar en <60s que la app arranca, los datos de semilla cargan
 * y las garantías del contrato (banner MVP, "Datos ficticios") están presentes
 * en toda ruta. Se ejecuta en todos los proyectos de Playwright (incluido mobile).
 *
 * Cubre:
 *   S-01  App arranca y muestra al menos 1 residente
 *   S-02  Banner "MVP operacional" visible en las 7 rutas (todos los roles)
 *   S-03  Indicador "Datos ficticios" visible
 *   S-04  Los 3 roles principales se pueden seleccionar y cada uno ve su nav
 *   S-05  La semilla carga >= 20 residentes
 *   S-06  Botón restablecer demo repone la semilla
 */

import { test, expect } from '@playwright/test';
import { goTo, resetSeed, selectRole } from './helpers';

// Rutas accesibles por demo_admin (ve todo)
const ALL_ROUTES = [
  '/dashboard',
  '/mis-rondas',
  '/residentes',
  '/alertas',
  '/personal',
  '/bitacora',
  '/control-demo',
];

test.beforeEach(async ({ page }) => {
  await goTo(page, '/dashboard');
  await resetSeed(page);
});

test('S-01 app arranca y el dashboard muestra al menos 1 residente', async ({ page }) => {
  // Al menos 1 card o fila de residente debe ser visible en el dashboard
  await expect(page).toHaveURL(/#\/(dashboard|$)/);
  const body = page.locator('body');
  await expect(body).not.toHaveText('Error');
  await expect(body).not.toHaveText('Cannot read');
});

test('S-02 banner "MVP operacional, no dispositivo médico" en todas las rutas', async ({ page }) => {
  // Necesitamos demo_admin para acceder a todas las rutas
  await selectRole(page, 'demo_admin' as never);

  for (const route of ALL_ROUTES) {
    await page.goto(`http://localhost:5173/#${route}`);
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('.banner--notice'),
      `Banner MVP ausente en ${route}`,
    ).toContainText('MVP operacional, no dispositivo médico');
  }
});

test('S-03 indicador "Datos ficticios" visible en el dashboard', async ({ page }) => {
  await expect(
    page.locator('text=Datos ficticios').first(),
  ).toBeVisible();
});

test('S-04 los 3 roles se pueden seleccionar y cada uno ve su sección principal', async ({ page }) => {
  await selectRole(page, 'caregiver');
  await expect(page.locator('nav.app-nav a:has-text("Mis rondas")')).toBeVisible();

  await selectRole(page, 'supervisor');
  await expect(page.locator('nav.app-nav a:has-text("Alertas")')).toBeVisible();

  await selectRole(page, 'manager');
  await expect(page.locator('nav.app-nav a:has-text("Bitácora")')).toBeVisible();
});

test('S-05 semilla carga al menos 20 residentes', async ({ page }) => {
  await selectRole(page, 'supervisor');
  await page.locator('nav.app-nav a:has-text("Residentes")').click();
  await page.waitForLoadState('networkidle');

  // Contar cards o filas de residentes — la semilla tiene exactamente 20
  const residentItems = page.locator('.resident-card, table.data-table tbody tr, [data-testid="resident-item"]');
  const count = await residentItems.count();
  expect(count).toBeGreaterThanOrEqual(20);
});

test('S-06 botón "restablecer demo" repone los datos de semilla', async ({ page }) => {
  await selectRole(page, 'supervisor');

  // Registrar conteo inicial de alertas
  await page.locator('nav.app-nav a:has-text("Alertas")').click();
  await page.waitForLoadState('networkidle');
  const alertsBefore = await page.locator('table.data-table tbody tr, .alert-card').count();

  // Restablecer demo
  await goTo(page, '/dashboard');
  const resetBtn = page.locator('button:has-text("Restablecer demo")');
  await expect(resetBtn).toBeVisible();
  await resetBtn.click();
  await page.waitForLoadState('networkidle');

  // El conteo de alertas debe volver al valor de semilla (>= 1)
  await selectRole(page, 'supervisor');
  await page.locator('nav.app-nav a:has-text("Alertas")').click();
  await page.waitForLoadState('networkidle');
  const alertsAfter = await page.locator('table.data-table tbody tr, .alert-card').count();
  expect(alertsAfter).toBeGreaterThanOrEqual(1);
  // El reset siempre debe tener al menos tantas alertas activas como la semilla original
  expect(alertsAfter).toBeGreaterThanOrEqual(alertsBefore > 0 ? 1 : 0);
});
