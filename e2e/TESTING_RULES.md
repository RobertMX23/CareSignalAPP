# E2E Testing Rules — CareSignal

> Checklist operativo para escribir o modificar tests E2E en este directorio.
> Detalle completo en `docs/12-ai-agent-rules.md`.

## Antes de escribir

- [ ] Leer `src/App.tsx` — verificar `allowedRoles` de cada ruta que testeas
- [ ] Leer `src/data/seed.ts` — confirmar que los roles/IDs que usas existen
- [ ] Leer `src/index.css` breakpoints — el nav está `display:none` en ≤720px

## Helpers disponibles (`e2e/helpers.ts`)

```typescript
goTo(page, '/ruta')        // navegación segura por hash — úsalo siempre
selectRole(page, 'role')   // selecciona rol en el header
resetSeed(page)            // limpia localStorage y recarga
openNav(page)              // abre hamburger si está visible (mobile); no-op en desktop
```

## Reglas de escritura

**Nav en mobile:** nunca hagas `.click()` en un link de `nav.app-nav` sin llamar
`openNav(page)` primero. Mejor aún: usa `goTo()` para navegar, reserva los clicks
de nav solo para verificar visibilidad.

**Diálogos:** `window.confirm()` es descartado silenciosamente por Playwright.
Registra el handler ANTES del click:
```typescript
page.once('dialog', (dialog) => void dialog.accept());
await boton.click();
```

**Isolación de estado:** si el test toca el repositorio, el `beforeEach` necesita:
```typescript
localStorage.clear();
vi.resetModules();
// Y usa await import('../src/data/repository') dentro del test, no al nivel del archivo
```

**Roles disponibles en la semilla:** `caregiver`, `supervisor`, `manager`.
No usar `demo_admin` en tests — no existe en la semilla.

## Estructura de proyectos Playwright

| Proyecto | Browser | testMatch |
|---|---|---|
| chromium | Desktop Chrome | todos los specs |
| firefox | Desktop Firefox | todos los specs |
| webkit | Desktop Safari | todos los specs |
| mobile | Pixel 5 (375px) | `qa-smoke`, `qa-roles`, `qa-caregiver-mobile` |
