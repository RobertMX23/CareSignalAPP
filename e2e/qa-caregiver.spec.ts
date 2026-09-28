/**
 * qa-caregiver.spec.ts — Flujo operacional del cuidador.
 *
 * Cubre:
 *   T1  Completar una ronda en progreso con resultado operacional
 *   T2  Iniciar una ronda pendiente (due → in_progress)
 *   T3  Solicitar apoyo en una ronda sin alerta activa
 *   T4  El modal de completar requiere seleccionar un resultado (botón deshabilitado)
 */

import { test, expect } from '@playwright/test';
import { goTo, resetSeed, selectRole } from './helpers';

test.beforeEach(async ({ page }) => {
  await goTo(page, '/dashboard');
  await resetSeed(page);
  await selectRole(page, 'caregiver');
  await page.locator('nav.app-nav a:has-text("Mis rondas")').click();
  await page.waitForLoadState('networkidle');
});

test('T1 completa una ronda en progreso con resultado "sin novedades"', async ({ page }) => {
  // Busca el primer botón Completar visible (ronda in_progress)
  const completarBtn = page.locator('button:has-text("Completar")').first();
  await expect(completarBtn).toBeVisible();
  await completarBtn.click();

  // El modal debe abrirse
  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();
  await expect(modal.locator('h2')).toContainText('Completar ronda');

  // El botón de confirmar debe estar deshabilitado hasta seleccionar resultado
  const confirmBtn = modal.locator('button:has-text("Confirmar finalización")');
  await expect(confirmBtn).toBeDisabled();

  // Seleccionar resultado "Completada sin novedades"
  await modal.locator('input[type="radio"][value="ok"]').click();
  await expect(confirmBtn).toBeEnabled();

  // Confirmar
  await confirmBtn.click();

  // Modal debe cerrarse y aparecer mensaje de éxito
  await expect(modal).not.toBeVisible();
  await expect(page.locator('.inline-banner--success')).toContainText('Ronda completada');
});

test('T2 inicia una ronda pendiente (due → in_progress)', async ({ page }) => {
  const iniciarBtn = page.locator('button:has-text("Iniciar")').first();
  await expect(iniciarBtn).toBeVisible();
  await iniciarBtn.click();

  await expect(page.locator('.inline-banner--success')).toContainText('Ronda iniciada');
});

test('T3 solicita apoyo amarillo en una ronda activa', async ({ page }) => {
  const apoyoBtn = page.locator('button:has-text("Apoyo")').first();
  await expect(apoyoBtn).toBeVisible();
  await apoyoBtn.click();

  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();

  // Seleccionar severidad amarilla
  await modal.locator('input[type="radio"][value="yellow"]').click();

  const confirmBtn = modal.locator('button:has-text("Enviar solicitud")');
  await expect(confirmBtn).toBeEnabled();
  await confirmBtn.click();

  await expect(modal).not.toBeVisible();
  await expect(page.locator('.inline-banner--success')).toContainText('Alerta creada');
});

test('T4 el modal exige un resultado antes de habilitar confirmar', async ({ page }) => {
  const completarBtn = page.locator('button:has-text("Completar")').first();
  await completarBtn.click();

  const modal = page.locator('[role="dialog"]');
  const confirmBtn = modal.locator('button:has-text("Confirmar finalización")');

  // Sin seleccionar nada, debe estar deshabilitado
  await expect(confirmBtn).toBeDisabled();

  // Cancelar cierra el modal sin cambios
  await modal.locator('button:has-text("Cancelar")').click();
  await expect(modal).not.toBeVisible();
});
