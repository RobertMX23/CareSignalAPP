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
 * Avanza el reloj simulado N minutos usando los botones de /control-demo.
 * Requiere que exista un staff con role 'demo_admin' en la semilla.
 * Llamadas consecutivas son aditivas. Deja la página en /control-demo;
 * el test debe navegar al destino deseado después de llamar a esta función.
 */
export async function advanceClock(page: Page, minutes: number): Promise<void> {
  await selectRole(page, 'demo_admin');
  await goTo(page, '/control-demo');

  let remaining = minutes;
  while (remaining >= 15) {
    await page.locator('button:has-text("Avanzar 15 minutos")').click();
    remaining -= 15;
  }
  while (remaining >= 5) {
    await page.locator('button:has-text("Avanzar 5 minutos")').click();
    remaining -= 5;
  }
  while (remaining >= 1) {
    await page.locator('button:has-text("Avanzar 1 minuto")').click();
    remaining -= 1;
  }
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
