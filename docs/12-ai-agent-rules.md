# 11 — AI Agent Coding Rules

> Governance para agentes de IA (Claude Code y equivalentes) que trabajan en este
> repositorio. Derivado de fallos reales de CI en el E-track de CareSignal.
> **Autoridad**: operativa — por debajo del contrato congelado y de `CLAUDE.md`.
> No modifica el dominio del producto; solo aplica al proceso de desarrollo.

---

## Por qué existe este documento

Durante el E-track (E4 — infraestructura de calidad), seis tipos de fallos de CI
se repitieron al generar tests y workflows automáticamente. Todos tienen la misma
causa raíz: **el agente escribió código desde supuestos en lugar de desde observación**.

Este documento convierte cada fallo en una regla accionable con su justificación.

---

## Reglas — capa de tests

### R-01 Leer la API real antes de escribir tests

**Fallo original:** `saveAuditEvent(event)` no existe — la función real es
`appendAuditEvents([event])`. El campo `operationalOutcome` no existe — es
`completionOutcome`. Ambos errores causaron fallos de TypeScript y de ejecución.

**Regla:** Antes de escribir cualquier test que importe de `src/`, leer los archivos
relevantes con la herramienta Read. Nunca inferir nombres de funciones, parámetros
ni campos de tipos desde memoria o contexto de conversación.

**Archivos mínimos a leer antes de tests de repositorio:**
```
src/domain/types.ts        → nombres de campos, tipos, enums
src/data/repository.ts     → firmas de funciones exportadas
src/data/seed.ts           → roles, IDs y entidades que existen en la semilla
```

---

### R-02 Verificar roles y entidades en la semilla antes de usarlos

**Fallo original:** `selectRole(page, 'demo_admin')` causó timeout de 30s porque
`demo_admin` no existe en `src/data/seed.ts`. El `<select>` de roles solo muestra
opciones derivadas del staff real.

**Regla:** Antes de usar un rol, ID de residente, ID de staff o cualquier valor
concreto en un test, verificar que existe en `src/data/seed.ts`. La semilla es la
fuente de verdad para los datos de prueba, no el contrato de dominio.

**Roles disponibles en la semilla actual (2026-10-03):**
`caregiver` (9 miembros), `supervisor` (3), `manager` (2). Sin `demo_admin`.

---

### R-03 Leer RoleGuard antes de escribir assertions de autorización

**Fallo original:** T-16 probaba que `caregiver` era redirigido desde `/residentes`,
pero `App.tsx` permite todos los roles en esa ruta. La aserción era correcta para la
lógica esperada pero errónea respecto al código real.

**Regla:** Para cualquier test de control de acceso, leer la sección de rutas en
`src/App.tsx` y verificar `allowedRoles` de cada ruta antes de escribir la aserción.

**Referencia rápida (vigente 2026-10-03):**
```
/dashboard     → todos los roles
/mis-rondas    → todos los roles
/residentes    → todos los roles          ← caregiver SÍ tiene acceso
/alertas       → supervisor, manager, demo_admin
/personal      → supervisor, manager, demo_admin
/bitacora      → manager, demo_admin
/control-demo  → demo_admin
```

---

### R-04 Revisar CSS de breakpoints antes de asumir visibilidad

**Fallo original:** `qa-roles.spec.ts` y `qa-smoke.spec.ts` verificaban visibilidad
de links en `nav.app-nav`, pero en mobile (≤720px) el nav tiene `display: none`.
Los tests fallaban con "Expected: visible, Received: hidden".

**Regla:** Antes de escribir un test que verifique `toBeVisible()` sobre un elemento
de UI, leer `src/index.css` e identificar si el elemento tiene display condicional
en algún breakpoint. Si lo tiene, el test necesita manejar ambos estados.

**Patrón correcto en este repo (mobile ≤720px):**
```typescript
// En lugar de: await page.locator('nav.app-nav a:has-text("Alertas")').click()
// Usar:
await openNav(page);   // abre hamburger si está visible; no-op en desktop
await expect(page.locator('nav.app-nav a:has-text("Alertas")')).toBeVisible();

// Para navegación (sin verificar el link):
await goTo(page, '/alertas');
```

---

### R-05 Manejar diálogos del browser explícitamente

**Fallo original:** S-06 verificaba que el botón "Restablecer demo" funcionaba, pero
`window.confirm()` es descartado silenciosamente por Playwright (retorna `false`),
así que el reset nunca se ejecutaba. El test validaba un estado que no había cambiado.

**Regla:** Registrar el handler de diálogo ANTES del click que lo dispara.
Playwright destruye el handler después del primer uso (`page.once`).

```typescript
page.once('dialog', (dialog) => void dialog.accept());
await resetBtn.click();
```

**Comportamiento por defecto de Playwright con diálogos:**
- `alert()` → acepta (OK)
- `confirm()` → **descarta (Cancel)** ← el peligroso
- `prompt()` → descarta con valor vacío

---

### R-06 Aislar módulos con estado singleton entre tests

**Fallo original:** `repository.ts` declara `let cachedStore: DemoStore | undefined`
a nivel de módulo. Sin `vi.resetModules()`, el módulo se reutiliza entre tests y el
estado de una prueba contamina la siguiente.

**Regla:** En cualquier `beforeEach` que toque el repositorio, agregar:
```typescript
beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});
```
Y usar `await import('../src/data/repository')` dentro del test (no al nivel del
describe), para que cada test obtenga una instancia fresca del módulo.

**Señal de alerta:** Si ves `import { ... } from '../src/data/repository'` al nivel
del archivo de test (fuera de `it`/`test`), ese test NO aislará el singleton.

---

## Reglas — capa de CI / GitHub Actions

### R-07 Cada browser en su propio job con su propia instalación

**Fallo original:** `e2e.yml` instalaba solo Chromium (`--with-deps chromium`) pero
luego ejecutaba `npm run test:e2e` sin `--project`, corriendo los 4 proyectos.
Firefox y WebKit fallaban con "Executable doesn't exist at ~/.cache/ms-playwright/...".

**Regla:** Un job de CI que instala browser X solo puede ejecutar `--project=X`.
Si necesitas múltiples browsers, crea un job separado por cada uno.

**Patrón correcto:**
```yaml
- name: Install Playwright (firefox)
  run: npx playwright install --with-deps firefox
- name: Run E2E tests (Firefox)
  run: npm run test:e2e -- --project=firefox
```

---

### R-08 Eliminar workflows obsoletos en el mismo commit que crea el reemplazo

**Fallo original:** `e2e.yml` (workflow heredado) y `ci.yml` (nuevo, correcto)
coexistieron durante el E-track completo. Cada PR generaba fallos de Firefox desde
`e2e.yml` que eran difíciles de diagnosticar porque el workflow pasaba en `ci.yml`.

**Regla:** Cuando un workflow nuevo reemplaza a uno viejo, el commit que crea el
nuevo debe también eliminar el viejo. Workflows huérfanos generan ruido de CI y
confunden el diagnóstico de fallos.

**Señal de alerta:** Si hay dos workflows con `on: pull_request` y ambos ejecutan
E2E, verificar si uno es subconjunto del otro — si lo es, eliminar el redundante.

---

## Checklist rápido — antes de cualquier test (para copiar)

```
□ ¿Leí src/domain/types.ts y src/data/repository.ts?
□ ¿Los roles/IDs que uso existen en src/data/seed.ts?
□ ¿Leí src/App.tsx para verificar allowedRoles de las rutas que testeo?
□ ¿Revisé el CSS del componente para detectar display condicional?
□ ¿Tengo localStorage.clear() + vi.resetModules() en el beforeEach?
□ ¿Manejo window.confirm() / dialogs explícitamente?
□ ¿Uso goTo() o openNav() en lugar de clics en nav potencialmente oculto?
```

---

## Historial de fallos que originaron estas reglas

| Regla | Fallo | Commit que lo introdujo | Commit que lo corrigió |
|---|---|---|---|
| R-01 | `saveAuditEvent`, `operationalOutcome` | `398d8e8` | `398d8e8` |
| R-02 | `selectRole('demo_admin')` timeout | `29040eb` | `a34a35b` |
| R-03 | T-16 `/residentes` no bloquea caregiver | `29040eb` | `a34a35b` |
| R-04 | Nav hidden en mobile 375px | `29040eb` | `d725e7f` |
| R-05 | `window.confirm()` descartado | `29040eb` | `a34a35b` |
| R-06 | `cachedStore` sin resetModules | `29040eb` | `398d8e8` |
| R-07 | Firefox "Executable doesn't exist" | `29040eb` | `7fc7faf` |
| R-08 | `e2e.yml` y `ci.yml` coexistiendo | `29040eb` | `7fc7faf` |
