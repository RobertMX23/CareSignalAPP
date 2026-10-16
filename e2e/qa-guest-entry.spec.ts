/**
 * qa-guest-entry.spec.ts — Entrada de invitado por perfil (B-06).
 *
 * La suite corre en modo invitado con entrada "auto" (ver playwright.config.ts), de modo
 * que el resto de specs no pasan por la pantalla de perfiles. Aquí se abre /login a mano
 * para ejercitar el selector, que un invitado también puede usar para cambiar de perfil.
 */

import { expect, test } from '@playwright/test';
import { goTo, openNav } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('GE-01: el selector ofrece los tres perfiles y los avisos del contrato', async ({ page }) => {
  await goTo(page, '/login');
  await expect(page.getByTestId('guest-profile-caregiver')).toBeVisible();
  await expect(page.getByTestId('guest-profile-supervisor')).toBeVisible();
  await expect(page.getByTestId('guest-profile-manager')).toBeVisible();
  await expect(page.getByText('datos ficticios', { exact: false })).toBeVisible();
  await expect(page.getByText('no dispositivo médico', { exact: false })).toBeVisible();
  // En modo invitado no se ofrece Google.
  await expect(page.getByText('Continuar con Google')).toHaveCount(0);
});

test('GE-02: elegir supervisor entra al dashboard con ese rol', async ({ page }) => {
  await goTo(page, '/login');
  await page.getByTestId('guest-profile-supervisor').click();
  await expect(page).toHaveURL(/#\/dashboard/);
  await expect(page.locator('.badge--role-supervisor')).toHaveText('Supervisor/a');
});

test('GE-03: gerente ve Bitácora; cuidador no', async ({ page }) => {
  await goTo(page, '/login');
  await page.getByTestId('guest-profile-manager').click();
  await openNav(page);
  await expect(page.locator('nav.app-nav').getByText('Bitácora')).toBeVisible();

  await goTo(page, '/login');
  await page.getByTestId('guest-profile-caregiver').click();
  await openNav(page);
  await expect(page.locator('nav.app-nav').getByText('Bitácora')).toHaveCount(0);
});

test('GE-04: el perfil elegido se conserva al recargar', async ({ page }) => {
  await goTo(page, '/login');
  await page.getByTestId('guest-profile-manager').click();
  await expect(page.locator('.badge--role-manager')).toBeVisible();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('.badge--role-manager')).toBeVisible();
});

test('GE-05: cerrar sesión vuelve al selector', async ({ page }) => {
  await goTo(page, '/dashboard');
  await openNav(page);
  await page.getByRole('button', { name: /Cerrar sesión/ }).click();
  await expect(page).toHaveURL(/#\/login/);
  await expect(page.getByTestId('guest-profile-caregiver')).toBeVisible();
});

test('GE-06: recargar en una ruta de supervisor conserva la ruta', async ({ page }) => {
  await goTo(page, '/login');
  await page.getByTestId('guest-profile-supervisor').click();
  await expect(page).toHaveURL(/#\/dashboard/);

  await goTo(page, '/alertas');
  await expect(page.locator('main.app-main').getByRole('heading', { name: 'Alertas' })).toBeVisible();

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/#\/alertas$/);
  await expect(page.locator('main.app-main').getByRole('heading', { name: 'Alertas' })).toBeVisible();
  await expect(page.locator('.badge--role-supervisor')).toBeVisible();
});

test('GE-07: recargar en rutas de gerente y en un detalle de alerta las conserva', async ({ page }) => {
  await goTo(page, '/login');
  await page.getByTestId('guest-profile-manager').click();
  await expect(page).toHaveURL(/#\/dashboard/);

  await goTo(page, '/bitacora');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/#\/bitacora$/);
  await expect(page.locator('main.app-main').getByRole('heading', { name: 'Bitácora de auditoría' })).toBeVisible();

  await goTo(page, '/alertas/alert-05');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/#\/alertas\/alert-05$/);
  await expect(page.locator('main.app-main').getByRole('heading', { name: 'Alerta alert-05' })).toBeVisible();
});

test('GE-08: recargar en la ruta del perfil por defecto sigue funcionando', async ({ page }) => {
  await goTo(page, '/mis-rondas');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/#\/mis-rondas$/);
  await expect(page.locator('main.app-main').getByRole('heading', { name: 'Mis rondas' })).toBeVisible();
});
