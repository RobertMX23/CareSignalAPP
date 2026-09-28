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
