## ¿Qué hace este PR?

<!-- Describe en 2-3 líneas qué cambió y por qué. -->



## Issue relacionado

<!-- Escribe: Closes #123  (se cierra automáticamente al hacer merge) -->
Closes #

## Tipo de cambio

<!-- Marca con una X lo que aplica -->
- [ ] `feat` — nueva funcionalidad
- [ ] `fix` — corrección de bug
- [ ] `docs` — solo documentación
- [ ] `test` — solo pruebas
- [ ] `chore` — configuración / dependencias
- [ ] `refactor` — sin cambio de comportamiento

---

## Checklist del autor

<!-- Marca cada punto ANTES de pedir revisión -->

### Código
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run test` da 38/38
- [ ] `npm run build` compila limpio
- [ ] No usé `any` en TypeScript
- [ ] Los componentes UI no tocan `localStorage` directamente
- [ ] La lógica de negocio está en `src/domain/`, no en componentes

### Dominio y reglas de negocio
- [ ] Las transiciones de estado registran `AuditEvent` con actor + timestamp
- [ ] No agregué entidades, roles o estados fuera del contrato congelado
- [ ] No usé términos prohibidos (`paciente`, `emergencia médica`, `diagnóstico`, etc.)
- [ ] Si modifiqué un flujo existente: los E2E relevantes siguen pasando

### PR
- [ ] El título del PR sigue la convención (`feat:`, `fix:`, `docs:`, etc.)
- [ ] La branch tiene el formato correcto (`feature/`, `fix/`, etc.)
- [ ] Asigné a **Roberto García** como reviewer
- [ ] Llené la sección "¿Qué hace este PR?"

---

## Capturas / evidencia (si aplica)

<!-- Si el cambio es visual, agrega un screenshot o GIF -->
