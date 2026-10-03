/**
 * qa-alert-lifecycle.spec.ts — Ciclo completo de vida de una alerta (contrato §6 reglas 2–5).
 *
 * Cada test ancla al alert de semilla que ya está en el estado necesario —
 * no se encadenan acciones entre tests; resetSeed() devuelve siempre el mismo estado.
 *
 * Alertas de semilla (src/data/seed.ts):
 *   alert-01  open (red)           sin asignar
 *   alert-02  assigned             staff-supervisor-01
 *   alert-03  escalated            staff-supervisor-01
 *   alert-04  in_verification      staff-supervisor-01 + incident-01
 *   alert-05  resolved             staff-supervisor-01 + incident-02
 *   alert-06  closed               —
 *
 * Cubre criterios de aceptación:
 *   A-01  Reconocer alerta (open → acknowledged)
 *   A-02  Asignar alerta (open → assigned)
 *   A-03  Escalar alerta (assigned → escalated)
 *   A-04  Reasignar alerta (assigned → assigned, nuevo responsable)
 *   A-05  Iniciar verificación (escalated → in_verification, crea incidente)
 *   A-06  Impedir cierre sin resolución (botón "Cerrar" ausente fuera de resolved)
 *   A-07  Registrar resultado y resolver (in_verification → resolved)
 *   A-08  Cerrar alerta resuelta (resolved → closed, solo manager)
 *   A-09  Auditoría — línea de tiempo muestra eventos históricos
 */

import { test, expect } from '@playwright/test';
import { goTo, resetSeed, selectRole } from './helpers';

test.beforeEach(async ({ page }) => {
  await goTo(page, '/dashboard');
  await resetSeed(page);
  await selectRole(page, 'supervisor');
  await page.waitForLoadState('networkidle');
});

// ─── A-01 ────────────────────────────────────────────────────────────────────

test('A-01 supervisor reconoce alerta open (open → acknowledged)', async ({ page }) => {
  await goTo(page, '/alertas/alert-01');

  const reconocerBtn = page.locator('button:has-text("Reconocer")');
  await expect(reconocerBtn).toBeVisible();
  await reconocerBtn.click();

  await expect(page.locator('.inline-banner--success')).toContainText('Alerta reconocida');
});

// ─── A-02 ────────────────────────────────────────────────────────────────────

test('A-02 supervisor asigna alerta open a un responsable', async ({ page }) => {
  await goTo(page, '/alertas/alert-01');

  // El botón "Asignar" aparece para open y acknowledged
  const asignarBtn = page.locator('button:has-text("Asignar")');
  await expect(asignarBtn).toBeVisible();
  await asignarBtn.click();

  // Modal de asignación
  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();
  await expect(modal.locator('h2')).toContainText('Asignar alerta');

  // El botón Confirmar está habilitado (el modal pre-selecciona el primer staff)
  const confirmarBtn = modal.locator('button:has-text("Confirmar")');
  await expect(confirmarBtn).toBeEnabled();
  await confirmarBtn.click();

  await expect(modal).not.toBeVisible();
  await expect(page.locator('.inline-banner--success')).toContainText('Alerta asignada');
});

// ─── A-03 ────────────────────────────────────────────────────────────────────

test('A-03 supervisor escala alerta assigned (assigned → escalated)', async ({ page }) => {
  // alert-02 ya está en estado assigned en la semilla
  await goTo(page, '/alertas/alert-02');

  const escalarBtn = page.locator('button:has-text("Escalar")');
  await expect(escalarBtn).toBeVisible();
  await escalarBtn.click();

  await expect(page.locator('.inline-banner--success')).toContainText('Alerta escalada');
});

// ─── A-04 ────────────────────────────────────────────────────────────────────

test('A-04 supervisor reasigna alerta assigned a otro responsable', async ({ page }) => {
  // alert-02 está assigned a staff-supervisor-01 en la semilla
  await goTo(page, '/alertas/alert-02');

  const reasignarBtn = page.locator('button:has-text("Reasignar")');
  await expect(reasignarBtn).toBeVisible();
  await reasignarBtn.click();

  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();
  await expect(modal.locator('h2')).toContainText('Reasignar alerta');

  // El modal pre-selecciona el primer staff diferente al actual — solo confirmamos
  const confirmarBtn = modal.locator('button:has-text("Confirmar")');
  await expect(confirmarBtn).toBeEnabled();
  await confirmarBtn.click();

  await expect(modal).not.toBeVisible();
  await expect(page.locator('.inline-banner--success')).toContainText('Alerta reasignada');
});

// ─── A-05 ────────────────────────────────────────────────────────────────────

test('A-05 supervisor inicia verificación — crea incidente asociado', async ({ page }) => {
  // alert-03 está escalated en la semilla
  await goTo(page, '/alertas/alert-03');

  const verificarBtn = page.locator('button:has-text("Iniciar verificación")');
  await expect(verificarBtn).toBeVisible();
  await verificarBtn.click();

  await expect(page.locator('.inline-banner--success')).toContainText('Verificación iniciada');

  // El incidente asociado debe aparecer con algún estado
  await expect(page.locator('h2:has-text("Incidente asociado")')).toBeVisible();
  const incidentStatus = page.locator('dl.detail-list dt:has-text("Estado")').last();
  await expect(incidentStatus).toBeVisible();
});

// ─── A-06 ────────────────────────────────────────────────────────────────────

test('A-06 botón "Cerrar" ausente cuando la alerta no está resuelta', async ({ page }) => {
  // Cambiar a manager (único rol que puede cerrar)
  await selectRole(page, 'manager');

  // alert-01 está open — no debe mostrar "Cerrar"
  await goTo(page, '/alertas/alert-01');
  await expect(page.locator('button:has-text("Cerrar")')).not.toBeVisible();

  // alert-02 está assigned — tampoco
  await goTo(page, '/alertas/alert-02');
  await expect(page.locator('button:has-text("Cerrar")')).not.toBeVisible();

  // alert-03 está escalated — tampoco
  await goTo(page, '/alertas/alert-03');
  await expect(page.locator('button:has-text("Cerrar")')).not.toBeVisible();

  // alert-05 está resolved — SÍ debe mostrarlo (valida la regla por contraste)
  await goTo(page, '/alertas/alert-05');
  await expect(page.locator('button:has-text("Cerrar")')).toBeVisible();
});

// ─── A-07 ────────────────────────────────────────────────────────────────────

test('A-07 supervisor registra resultado y resuelve alerta in_verification', async ({ page }) => {
  // alert-04 está in_verification en la semilla
  await goTo(page, '/alertas/alert-04');

  const resolverBtn = page.locator('button:has-text("Registrar resultado y resolver")');
  await expect(resolverBtn).toBeVisible();
  await resolverBtn.click();

  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible();

  // El botón de confirmar debe estar deshabilitado hasta seleccionar resultado
  const confirmarBtn = modal.locator('button:has-text("Registrar y resolver")');
  await expect(confirmarBtn).toBeDisabled();

  // Seleccionar un resultado operacional
  await modal.locator('input[type="radio"][value="resident_confirmed_ok"]').click();
  await expect(confirmarBtn).toBeEnabled();
  await confirmarBtn.click();

  await expect(modal).not.toBeVisible();
  await expect(page.locator('.inline-banner--success')).toContainText('Resultado registrado');
});

// ─── A-08 ────────────────────────────────────────────────────────────────────

test('A-08 manager cierra alerta resuelta (resolved → closed)', async ({ page }) => {
  // Solo manager puede cerrar — cambiar rol
  await selectRole(page, 'manager');

  // alert-05 está resolved en la semilla
  await goTo(page, '/alertas/alert-05');

  const cerrarBtn = page.locator('button:has-text("Cerrar")');
  await expect(cerrarBtn).toBeVisible();
  await cerrarBtn.click();

  await expect(page.locator('.inline-banner--success')).toContainText('Alerta cerrada');

  // El botón de cerrar debe desaparecer (alerta ya closed)
  await expect(cerrarBtn).not.toBeVisible();
  // Y debe aparecer el mensaje de "alerta cerrada"
  await expect(page.locator('text=Esta alerta está cerrada')).toBeVisible();
});

// ─── A-09 ────────────────────────────────────────────────────────────────────

test('A-09 línea de tiempo auditable muestra eventos históricos de la alerta', async ({ page }) => {
  // alert-06 está closed (ciclo completo: open→assigned→in_verification→resolved→closed)
  await goTo(page, '/alertas/alert-06');

  // La página tiene dos ul.timeline: "Historial de asignaciones" y "Línea de tiempo auditable".
  // El audit timeline es siempre el último; .last() lo resuelve correctamente en ambos casos
  // (con o sin historial de asignaciones en la semilla).
  await expect(page.locator('h2:has-text("Línea de tiempo auditable")')).toBeVisible();
  const timeline = page.locator('ul.timeline').last();
  await expect(timeline).toBeVisible();

  // Debe haber al menos 3 entradas (ALERT_CREATED + ALERT_ASSIGNED + más)
  const entries = timeline.locator('li');
  const count = await entries.count();
  expect(count).toBeGreaterThanOrEqual(3);

  // Cada entrada tiene timestamp visible
  await expect(entries.first().locator('.timeline-time')).toBeVisible();
});
