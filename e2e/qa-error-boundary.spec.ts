/**
 * qa-error-boundary.spec.ts — Contención de errores reales en el navegador (B-05).
 *
 * El fallo se provoca como ocurriría de verdad: un dato dañado en el almacén local (una
 * alerta sin `severity`) hace que `SeverityBadge` lance al renderizar la pantalla de Alertas.
 *
 *   EB-01  la pantalla falla, pero cabecera, navegación y avisos del contrato siguen visibles
 *   EB-02  el error se registra en consola con código y origen react-boundary
 *   EB-03  cambiar de sección limpia el error
 *   EB-04  "Restablecer demo y recargar" repara el dato y la pantalla vuelve a funcionar
 *   EB-05  un error global (fuera de React) también se registra
 */

import { expect, test, type Page } from '@playwright/test';
import { goTo, openNav, resetSeed } from './helpers';

const STORE_KEY = 'caresignal:demo-store:v2';
const FALLBACK = 'Esta pantalla tuvo un problema';

interface ReportLike {
  id: string;
  source: string;
  message: string;
}

const collectReports = (page: Page): ReportLike[] => {
  const reports: ReportLike[] = [];
  page.on('console', async (msg) => {
    if (msg.type() !== 'error' || !msg.text().startsWith('CareSignal error')) return;
    const arg = msg.args()[1];
    if (arg !== undefined) reports.push((await arg.jsonValue()) as ReportLike);
  });
  return reports;
};

async function enterAsSupervisorWithCorruptAlert(page: Page): Promise<void> {
  await page.goto('/');
  // Limpia y RECARGA: la app guarda el almacén en memoria, y solo un arranque nuevo lo reescribe.
  await resetSeed(page);
  await goTo(page, '/login');
  await page.getByTestId('guest-profile-supervisor').click();
  await expect(page).toHaveURL(/#\/dashboard/);
  // El almacén se crea al primer render de la app: esperar a que el dashboard pinte.
  await expect(page.locator('main.app-main').getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // Daña una alerta manteniendo la forma válida del almacén y recarga para que se relea.
  await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (raw === null) throw new Error(`El almacén ${key} aún no existe`);
    const store = JSON.parse(raw) as { alerts: Record<string, unknown>[] };
    store.alerts = store.alerts.map((a, i) => (i === 0 ? { ...a, severity: undefined } : a));
    localStorage.setItem(key, JSON.stringify(store));
  }, STORE_KEY);
  await page.goto('/#/alertas');
  await page.reload({ waitUntil: 'networkidle' });
}

test('EB-01: la pantalla falla pero la app sigue en pie', async ({ page }) => {
  await enterAsSupervisorWithCorruptAlert(page);

  const alert = page.locator('main.app-main').getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert.getByRole('heading', { name: FALLBACK })).toBeVisible();
  await expect(alert.getByText(/E-[0-9A-Z]+-[0-9A-Z]{4}/)).toBeVisible();

  // Lo que NO debe romperse: cabecera, navegación y avisos del contrato.
  await expect(page.locator('.app-header')).toBeVisible();
  await expect(page.getByText('MVP operacional, no dispositivo médico').first()).toBeVisible();
  await expect(page.locator('.badge--fictional')).toBeVisible();
  await openNav(page);
  await expect(page.locator('nav.app-nav').getByText('Dashboard')).toBeVisible();
});

test('EB-02: el error queda registrado con código y origen', async ({ page }) => {
  const reports = collectReports(page);
  await enterAsSupervisorWithCorruptAlert(page);
  await expect(page.locator('main.app-main').getByRole('alert')).toBeVisible();

  await expect.poll(() => reports.some((r) => r.source === 'react-boundary')).toBe(true);
  const report = reports.find((r) => r.source === 'react-boundary');
  expect(report?.id).toMatch(/^E-[0-9A-Z]+-[0-9A-Z]{4}$/);
  expect(report?.message).toContain('label');
});

test('EB-03: cambiar de sección limpia el error', async ({ page }) => {
  await enterAsSupervisorWithCorruptAlert(page);
  await expect(page.locator('main.app-main').getByRole('alert')).toBeVisible();

  await openNav(page);
  await page.locator('nav.app-nav').getByRole('link', { name: 'Dashboard' }).click();
  await expect(page).toHaveURL(/#\/dashboard/);
  await expect(page.locator('main.app-main').getByRole('alert')).toHaveCount(0);
  await expect(page.locator('main.app-main').getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('EB-04: restablecer la demo repara el dato dañado', async ({ page }) => {
  await enterAsSupervisorWithCorruptAlert(page);
  const alert = page.locator('main.app-main').getByRole('alert');
  await expect(alert).toBeVisible();

  await alert.getByRole('button', { name: 'Restablecer demo y recargar' }).click();

  await expect(page.locator('main.app-main').getByRole('alert')).toHaveCount(0);
  await expect(page.locator('main.app-main').getByRole('heading', { name: 'Alertas' })).toBeVisible();
});

test('EB-05: un error global fuera de React también se registra', async ({ page }) => {
  const reports = collectReports(page);
  await goTo(page, '/dashboard');

  await page.evaluate(() => {
    window.dispatchEvent(new ErrorEvent('error', { message: 'fallo global e2e', error: new Error('fallo global e2e') }));
  });

  await expect.poll(() => reports.some((r) => r.source === 'window-error' && r.message === 'fallo global e2e')).toBe(true);
});
