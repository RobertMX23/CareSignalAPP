/**
 * qa-temporal-engine.spec.ts — Motor temporal y detección de vencimientos.
 *
 * Criterios de aceptación cubiertos (contrato §6 y docs/04-acceptance-tests.md):
 *   Criterio 2  Generar alerta al vencer
 *   Criterio 3  Evitar alerta duplicada (idempotencia del motor)
 *
 * Estrategia de avance de reloj:
 *   `advanceClock(page, N)` selecciona el rol `demo_admin` (staff-demo-admin-01 en la
 *   semilla), navega a `/control-demo` y hace clic en los botones de avance de la UI
 *   real (Avanzar 15 / 5 / 1 minutos) hasta completar N minutos. Cada test navega
 *   a la ruta de destino después de llamar a `advanceClock`.
 *
 * Rondas relevantes de la semilla (src/data/seed.ts):
 *   round-02  Antonio Salas   (res-02)  due   dueAt = T+15 min
 *   round-12  Ernesto Campos  (res-12)  due   dueAt = T+20 min
 *   round-20  Norberto Aguilar (res-20) cancelled  (no debe generar alerta)
 *
 * Constante de la semilla: CRITICAL_DELAY_MINUTES = 15
 *   Retraso < 15 min → alerta amarilla; ≥ 15 min → alerta roja.
 */

import { test, expect } from '@playwright/test';
import { advanceClock, goTo, resetSeed, selectRole } from './helpers';

test.beforeEach(async ({ page }) => {
  await goTo(page, '/dashboard');
  await resetSeed(page);
  await selectRole(page, 'supervisor');
  await page.waitForLoadState('networkidle');
});

// ─── T-M-01 ───────────────────────────────────────────────────────────────────

test('T-M-01 avanzar reloj 15 min vence round-02 y crea alerta amarilla', async ({ page }) => {
  // round-02: dueAt = T+15; con clock en T+15 → delay = 0 min < 15 → amarilla
  await advanceClock(page, 15);
  await selectRole(page, 'supervisor');
  await goTo(page, '/alertas');

  const row = page.locator('table.data-table tbody tr', {
    has: page.locator('td:has-text("Antonio Salas")'),
  });
  await expect(row).toBeVisible();
  // Celda de severidad contiene la badge "Amarilla"
  await expect(row.locator('.status-badge--yellow')).toBeVisible();
});

// ─── T-M-02 ───────────────────────────────────────────────────────────────────

test('T-M-02 retraso ≥ 15 min crea alerta roja directamente (CRITICAL_DELAY_MINUTES)', async ({ page }) => {
  // round-02: dueAt = T+15; con clock en T+30 → delay = 15 min ≥ 15 → roja
  await advanceClock(page, 30);
  await selectRole(page, 'supervisor');
  await goTo(page, '/alertas');

  const row = page.locator('table.data-table tbody tr', {
    has: page.locator('td:has-text("Antonio Salas")'),
  });
  await expect(row).toBeVisible();
  await expect(row.locator('.status-badge--red')).toBeVisible();
});

// ─── T-M-03 ───────────────────────────────────────────────────────────────────

test('T-M-03 motor temporal idempotente — dos avances no duplican la alerta', async ({ page }) => {
  // Primer avance: round-02 → overdue, alerta amarilla creada
  await advanceClock(page, 15);
  // Segundo avance: motor vuelve a correr pero la alerta ya existe → no duplica
  await advanceClock(page, 5);
  await selectRole(page, 'supervisor');
  await goTo(page, '/alertas');

  // Debe haber exactamente 1 fila para Antonio Salas (criterio 3)
  const rows = page.locator('table.data-table tbody tr', {
    has: page.locator('td:has-text("Antonio Salas")'),
  });
  await expect(rows).toHaveCount(1);
});

// ─── T-M-04 ───────────────────────────────────────────────────────────────────

test('T-M-04 ronda cancelada no genera alerta aunque el reloj avance', async ({ page }) => {
  // round-20 (Norberto Aguilar) está cancelled → terminal → motor lo omite
  // Avanzar 90 min supera su dueAt (T+75) — si no fuera cancelled, se vencería
  await advanceClock(page, 90);
  await selectRole(page, 'supervisor');
  await goTo(page, '/alertas');

  // Norberto Aguilar no debe aparecer en ninguna alerta activa
  const row = page.locator('table.data-table tbody tr', {
    has: page.locator('td:has-text("Norberto Aguilar")'),
  });
  await expect(row).not.toBeVisible();
});

// ─── T-M-05 ───────────────────────────────────────────────────────────────────

test('T-M-05 alerta amarilla escala a roja cuando el retraso supera el umbral (path de escalada)', async ({ page }) => {
  // Primera llamada: round-02 → overdue en T+15, delay = 0 min < 15 → alerta amarilla creada
  await advanceClock(page, 15);
  // Segunda llamada: engine corre en T+30; alerta amarilla EXISTENTE escala a roja (delay = 15 ≥ 15)
  // Este es el code path `activeAlert.severity === 'yellow' && delayMinutes >= CRITICAL_DELAY_MINUTES`
  // en temporalEngine.ts, DISTINTO del path de T-M-02 que crea la alerta directamente como roja.
  await advanceClock(page, 15);
  await selectRole(page, 'supervisor');
  await goTo(page, '/alertas');

  const row = page.locator('table.data-table tbody tr', {
    has: page.locator('td:has-text("Antonio Salas")'),
  });
  await expect(row).toBeVisible();
  await expect(row.locator('.status-badge--red')).toBeVisible();
  // La alerta debe ser solo 1 (no se crea una nueva, se escala la existente)
  await expect(row).toHaveCount(1);
});
