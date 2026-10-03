/**
 * qa-manager.spec.ts — Flujo del gerente.
 *
 * Cubre:
 *   T-10  Dashboard del gerente muestra métricas globales
 *   T-11  Gerente puede navegar y abrir la Bitácora
 *   T-12  Bitácora es solo lectura (sin botones de edición ni eliminación)
 *   T-13  Bitácora muestra eventos de auditoría de la semilla
 *   T-14  DemoControlPage es accesible solo para demo_admin
 *   T-15  Supervisor redirige al intentar acceder a /bitacora directamente
 *   T-16  Cuidador redirige al intentar acceder a /residentes directamente
 */

import { test, expect } from '@playwright/test';
import { goTo, resetSeed, selectRole } from './helpers';

test.beforeEach(async ({ page }) => {
  await goTo(page, '/dashboard');
  await resetSeed(page);
  await selectRole(page, 'manager');
  await page.waitForLoadState('networkidle');
});

test('T-10 el dashboard del gerente muestra métricas del turno', async ({ page }) => {
  // El gerente ve la vista de gerente (ManagerDashboardPage)
  // Debe mostrar alguna sección de métricas (residentes urgentes, alertas activas, etc.)
  const hasUrgent = page.locator('text=Urgentes').first();
  const hasMetric = page.locator('.metric-card, .status-card, [class*="card"]').first();
  const hasAlert  = page.locator('text=Alertas activas, text=alertas').first();

  // Al menos una de estas secciones debe ser visible
  const urgentVisible = await hasUrgent.isVisible().catch(() => false);
  const metricVisible = await hasMetric.isVisible().catch(() => false);
  const alertVisible  = await hasAlert.isVisible().catch(() => false);

  expect(urgentVisible || metricVisible || alertVisible).toBe(true);
});

test('T-11 el gerente puede navegar a la Bitácora', async ({ page }) => {
  const bitacoraLink = page.locator('nav.app-nav a:has-text("Bitácora")');
  await expect(bitacoraLink).toBeVisible();
  await bitacoraLink.click();
  await page.waitForLoadState('networkidle');

  // Verificar que estamos en la bitácora
  await expect(page).toHaveURL(/#\/bitacora/);
  // Debe haber algún contenido de bitácora
  const heading = page.locator('h1, h2, .page-title').first();
  await expect(heading).toBeVisible();
});

test('T-12 la Bitácora no tiene botones de edición ni eliminación', async ({ page }) => {
  await page.locator('nav.app-nav a:has-text("Bitácora")').click();
  await page.waitForLoadState('networkidle');

  // El contrato §6 regla 10: la auditoría es append-only; no puede editarse desde el MVP UI
  const editButtons = page.locator('button:has-text("Editar"), button:has-text("Eliminar"), button:has-text("Borrar"), [data-testid="edit-btn"], [data-testid="delete-btn"]');
  const editCount = await editButtons.count();
  expect(editCount).toBe(0);
});

test('T-13 la Bitácora muestra registros de auditoría de la semilla', async ({ page }) => {
  await page.locator('nav.app-nav a:has-text("Bitácora")').click();
  await page.waitForLoadState('networkidle');

  // La semilla tiene audit events — debe haber al menos una fila/item
  const auditItems = page.locator('table tbody tr, .audit-event, .audit-row, [class*="audit"]');
  const count = await auditItems.count();
  expect(count).toBeGreaterThan(0);
});

test('T-14 DemoControlPage solo es accesible para demo_admin, no para manager', async ({ page }) => {
  // El gerente NO debe ver "Control de demo" en su nav
  const nav = page.locator('nav.app-nav');
  await expect(nav.locator('a:has-text("Control de demo")')).not.toBeVisible();

  // Navegar directamente a /control-demo como manager debe redirigir
  await page.goto('http://localhost:5173/#/control-demo');
  await page.waitForLoadState('networkidle');

  // Debe haber redirigido al dashboard (RoleGuard lo bloquea)
  await expect(page).toHaveURL(/#\/(dashboard|$)/);
});

test('T-15 supervisor es redirigido al intentar acceder a /bitacora directamente', async ({ page }) => {
  // Cambiar a supervisor primero
  await selectRole(page, 'supervisor');
  await page.waitForLoadState('networkidle');

  // Navegar directamente a /bitacora — debe ser bloqueado por RoleGuard
  await page.goto('http://localhost:5173/#/bitacora');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(/#\/(dashboard|$)/);
});

test('T-16 cuidador es redirigido al intentar acceder a /alertas directamente', async ({ page }) => {
  // Cambiar a caregiver
  await selectRole(page, 'caregiver');
  await page.waitForLoadState('networkidle');

  // /alertas permite solo supervisor, manager, demo_admin — caregiver debe ser bloqueado
  await page.goto('http://localhost:5173/#/alertas');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(/#\/(dashboard|$)/);
});
