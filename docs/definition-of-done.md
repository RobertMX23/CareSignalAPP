# Definition of Done — CareSignal MVP

> Una tarea está **terminada** cuando cumple **todos** los criterios de esta lista.
> Si falta uno, el PR no se aprueba y no se hace merge.

---

## Criterios obligatorios para toda tarea

### Código
- [ ] `npm run typecheck` pasa sin errores (TypeScript strict, sin `any`)
- [ ] `npm run test` da **38/38** (o más si se agregaron pruebas nuevas)
- [ ] `npm run build` compila sin errores ni warnings críticos
- [ ] No hay código comentado ni `console.log` de debug

### Dominio y reglas de negocio
- [ ] Las transiciones de estado siguen la máquina de estados (`docs/02-state-machine.md`)
- [ ] Toda transición emite `AuditEvent` con actor + timestamp
- [ ] No se persiste estado derivado (ej: status del residente)
- [ ] Los componentes UI no acceden a `localStorage` directamente
- [ ] No se usaron términos prohibidos del contrato (§ taxonomía)

### Pruebas
- [ ] La funcionalidad nueva tiene al menos una prueba unitaria en `tests/`
- [ ] Si modifica un flujo de UI: los tests E2E relevantes siguen pasando
- [ ] Si agrega un flujo nuevo: hay un test E2E o se abrió un Issue para crearlo

### PR y revisión
- [ ] El PR tiene título en formato convencional (`feat:`, `fix:`, etc.)
- [ ] El template del PR está lleno completamente
- [ ] El PR tiene **1 aprobación** del reviewer (Roberto García)
- [ ] El CI (workflow **CI** en GitHub Actions — 6 jobs) está en ✅ verde
- [ ] No hay comentarios sin resolver en el PR

### Documentación
- [ ] Si se agregó una entidad, estado o transición nueva: se actualizó `docs/01-domain-taxonomy.yaml`
- [ ] Si cambió un flujo: se revisó `docs/02-state-machine.md`
- [ ] Se agregó una entrada en `CHANGELOG.md` bajo la versión correspondiente

---

## Criterios adicionales por tipo de tarea

### Para bugs (`fix:`)
- [ ] Se reprodujo el bug antes del fix (no solo se asumió)
- [ ] El Issue del bug queda cerrado con `Closes #NNN` en el PR

### Para nuevas features (`feat:`)
- [ ] La feature fue aprobada por el PM en el Issue antes de implementarse
- [ ] Los criterios de aceptación del Issue están todos en ✅

### Para cambios de dominio (entities, states, transitions)
- [ ] Aprobación explícita del PM/Arquitecto
- [ ] Se actualizó `src/domain/types.ts` y/o `src/domain/taxonomy.ts`
- [ ] Se actualizó `src/domain/rules.ts` y/o `src/domain/transitions.ts`
- [ ] Se agregaron pruebas unitarias para las nuevas reglas

---

## Lo que NO cuenta como "terminado"

- "Funciona en mi máquina" sin que el CI pase
- PR abierto con comentarios sin resolver
- Tests pasando localmente pero CI en rojo
- Feature implementada sin aprobación previa del PM
- Cambio de scope sin change request formal
