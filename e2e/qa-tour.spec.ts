/**
 * qa-tour.spec.ts — Recorrido guiado por rol (L-05 / B-08).
 *
 * La suite corre con VITE_TOUR_AUTOSTART=off (ver playwright.config.ts): el tour no se
 * dispara solo al elegir perfil; aquí se inicia con el botón "Ver recorrido".
 *
 *   TG-01  cuidador: recorre todos los pasos y termina
 *   TG-02  supervisor: llega a la alerta en verificación
 *   TG-03  gerente: pasa por métricas, bitácora y la alerta resuelta
 *   TG-04  Esc cierra el recorrido; los avisos del contrato siguen visibles
 *   TG-05  "Saltar recorrido" cierra y deja la app usable
 */

import { expect, test, type Page } from '@playwright/test';
import { goTo } from './helpers';

const NOTICE = 'MVP operacional, no dispositivo médico';

async function startTourAs(page: Page, role: 'caregiver' | 'supervisor' | 'manager'): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await goTo(page, '/login');
  await page.getByTestId(`guest-profile-${role}`).click();
  await expect(page).toHaveURL(/#\/dashboard/);
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Ver recorrido' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

async function walkToEnd(page: Page): Promise<number> {
  let steps = 1;
  for (;;) {
    const finish = page.getByRole('button', { name: 'Finalizar' });
    if (await finish.isVisible()) {
      await finish.click();
      return steps;
    }
    await page.getByRole('button', { name: 'Siguiente' }).click();
    steps += 1;
    expect(steps).toBeLessThan(15);
  }
}

test('TG-01: cuidador completa el recorrido', async ({ page }) => {
  await startTourAs(page, 'caregiver');
  await expect(page.getByRole('heading', { name: 'Tus rondas del turno' })).toBeVisible();
  await expect(page).toHaveURL(/#\/mis-rondas/);
  const total = await walkToEnd(page);
  expect(total).toBeGreaterThanOrEqual(4);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('TG-02: supervisor llega a la alerta en verificación', async ({ page }) => {
  await startTourAs(page, 'supervisor');
  await expect(page).toHaveURL(/#\/dashboard/);
  for (let i = 0; i < 3; i += 1) await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/#\/alertas\/alert-04/);
  await expect(page.getByRole('heading', { name: 'Verifica y resuelve' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Registrar resultado y resolver' })).toBeVisible();
});

test('TG-03: gerente recorre métricas, bitácora y cierre', async ({ page }) => {
  await startTourAs(page, 'manager');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/#\/metricas/);
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/#\/bitacora/);
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await expect(page).toHaveURL(/#\/alertas\/alert-05/);
  await expect(page.getByRole('button', { name: 'Cerrar', exact: true })).toBeVisible();
});

test('TG-04: Esc cierra y los avisos del contrato siguen visibles', async ({ page }) => {
  await startTourAs(page, 'supervisor');
  await expect(page.getByText(NOTICE)).toBeVisible();
  await expect(page.locator('.badge--fictional')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('TG-05: saltar el recorrido deja la app usable', async ({ page }) => {
  await startTourAs(page, 'caregiver');
  await page.getByRole('button', { name: 'Saltar recorrido' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Restablecer demo' })).toBeEnabled();
});
