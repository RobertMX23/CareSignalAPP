import type { Page } from '@playwright/test';

/** Limpia localStorage y recarga — equivale a un reset de semilla sin diálogo. */
export async function resetSeed(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
}

/**
 * Selecciona un rol en el filtro de la cabecera.
 * El valor debe coincidir con los values del <option>:
 *   'caregiver' | 'supervisor' | 'manager' | 'demo_admin' | 'all'
 */
export async function selectRole(page: Page, role: string): Promise<void> {
  await page.locator('label:has-text("Filtrar por rol") select').selectOption(role);
}

/** Navega a la ruta dada y espera que la página esté lista. */
export async function goTo(page: Page, hash: string): Promise<void> {
  await page.goto(`/#${hash}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Avanza el reloj simulado N minutos ejecutando `advanceByMinutes` en el contexto
 * del navegador (Vite dev server sirve los módulos fuente) y recarga la página para
 * que React reinicialice desde el localStorage actualizado por el motor temporal.
 *
 * Solo funciona contra el servidor Vite (dev mode). Llamadas consecutivas son
 * aditivas: el módulo lee el offset actual de localStorage y suma N.
 */
export async function advanceClock(page: Page, minutes: number): Promise<void> {
  await page.evaluate(async (mins: number) => {
    const mod = await import('/src/data/demoClock.ts');
    mod.advanceByMinutes(mins);
  }, minutes);
  await page.reload({ waitUntil: 'networkidle' });
}

/**
 * Abre el menú de navegación en mobile (≤720 px) si el botón de hamburguesa
 * está visible y el menú aún no está abierto. En desktop es un no-op.
 */
export async function openNav(page: Page): Promise<void> {
  const toggle = page.locator('button.nav-toggle');
  if (!await toggle.isVisible()) return;
  const nav = page.locator('nav.app-nav');
  const isOpen = await nav.evaluate((el) => el.classList.contains('app-nav--open'));
  if (!isOpen) {
    await toggle.click();
    await page.waitForTimeout(150);
  }
}
