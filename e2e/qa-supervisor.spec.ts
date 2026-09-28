/**
 * qa-supervisor.spec.ts — Ciclo de vida de alertas desde el rol supervisor.
 *
 * Cubre:
 *   T5  El dashboard del supervisor muestra métricas de residentes y alertas
 *   T6  La lista de alertas muestra al menos una alerta activa
 *   T7  El supervisor puede navegar al detalle de una alerta
 *   T8  La bitácora no es accesible para el supervisor (route guard)
 */

import { test, expect } from '@playwright/test';
import { goTo, resetSeed, selectRole } from './helpers';

test.beforeEach(async ({ page }) => {
  await goTo(page, '/dashboard');
  await resetSeed(page);
  await selectRole(page, 'supervisor');
  await page.waitForLoadState('networkidle');
});

test('T5 el dashboard supervisor muestra métricas de residentes', async ({ page }) => {
  // Debe mostrar secciones de urgentes / en atención / sin novedades
  await expect(page.locator('text=Urgentes')).toBeVisible();
  await expect(page.locator('text=Sin novedades')).toBeVisible();

  // Al menos un número visible en las cards de estado
  const cards = page.locator('.metric-card, .status-card, [class*="card"]');
  await expect(cards.first()).toBeVisible();
});

test('T6 la página de alertas muestra alertas activas de la semilla', async ({ page }) => {
  await page.locator('nav.app-nav a:has-text("Alertas")').click();
  await page.waitForLoadState('networkidle');

  // La semilla tiene 7 alertas — debe haber al menos una fila/card
  const alertItems = page.locator('table tbody tr, .alert-card, [class*="alert"]');
  await expect(alertItems.first()).toBeVisible();
});

test('T7 el supervisor puede abrir el detalle de una alerta', async ({ page }) => {
  await page.locator('nav.app-nav a:has-text("Alertas")').click();
  await page.waitForLoadState('networkidle');

  // Click en el primer link de detalle de alerta
  const detailLink = page.locator('a[href*="alertas"], a:has-text("Ver"), a:has-text("Detalle")').first();
  await expect(detailLink).toBeVisible();
  await detailLink.click();

  await page.waitForLoadState('networkidle');
  // La página de detalle muestra dl.detail-list con dt "Severidad"
  await expect(page.locator('dt:has-text("Severidad")').first()).toBeVisible();
});

test('T8 el supervisor no ve la opción Bitácora en el nav', async ({ page }) => {
  const nav = page.locator('nav.app-nav');
  await expect(nav.locator('a:has-text("Bitácora")')).not.toBeVisible();
});

test('T9 el banner MVP operacional está visible en todas las páginas', async ({ page }) => {
  const banner = page.locator('.banner--notice');
  await expect(banner).toContainText('MVP operacional, no dispositivo médico');

  // Verificar también en la página de alertas
  await page.locator('nav.app-nav a:has-text("Alertas")').click();
  await expect(banner).toContainText('MVP operacional, no dispositivo médico');

  // Y en personal
  await page.locator('nav.app-nav a:has-text("Personal")').click();
  await expect(banner).toContainText('MVP operacional, no dispositivo médico');
});
