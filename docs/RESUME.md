# RESUME — Estado actual y handoff a Claude Code

> Nota de continuidad para retomar el proyecto en **Claude Code** (o cualquier sesión
> nueva). La fuente de verdad sigue siendo el contrato congelado; este archivo solo
> describe **dónde estamos** y **qué sigue**. Autoridad: informativa (por debajo del
> contrato, `CLAUDE.md` y `docs/`).
>
> **Fecha de captura:** 2026-07-18 · **Posición:** Gate C2 aprobado · **Siguiente:** Chunk 3

---

## 1. Estado del build (protocolo de chunks)

| Chunk | Descripción | Estado |
|---|---|---|
| C0 | Andamiaje + `CLAUDE.md` | ✅ hecho |
| C1 | Contrato, taxonomía, límites (docs) | ✅ hecho (Gate C1) |
| C2 | Máquina de estados + modelo de dominio TS | ✅ hecho (Gate C2) |
| **C3** | **Datos ficticios, repositorio, reloj simulado** | **⏭ siguiente autorizado** |
| C4 | Shell + navegación (5 páginas) | pendiente |
| C5 | Flujo del cuidador | pendiente |
| C6 | Dashboard + ciclo de alerta del supervisor | pendiente |
| C7 | Motor temporal determinista + escenarios | pendiente |
| C8 | QA, accesibilidad, release v0.1.0-workshop | pendiente |

Regla de oro: **un chunk a la vez**, terminando en su gate, sin avanzar sin aprobación
humana. No agregar funciones fuera de alcance.

## 2. Inventario actual del repositorio

```
contract/            Línea base congelada (.md/.docx/.zip/.sha256) — FUENTE DE VERDAD
CLAUDE.md            Reglas operativas: jerarquía de autoridad, taxonomía, gates
CHANGELOG.md         Bitácora C0/C1/C2
.gitignore
docs/
  00-product-contract.md      (C1)
  01-domain-taxonomy.yaml      (C1) — autoridad #3, vocabulario congelado
  02-state-machine.md          (C2)
  03-data-model.md             (C2)
  05-known-limitations.md      (C1)
  RESUME.md                    (este archivo)
src/domain/
  taxonomy.ts   listas `as const` + tipos literales derivados + type guards
  types.ts      interfaces Resident/StaffMember/Round/Alert/Incident/AuditEvent (§8)
  rules.ts      deriveResidentStatus() + guardas de reglas (§6)
  transitions.ts  tablas de transición (lista blanca §7) + aplicadores puros
src/data/         vacío (.gitkeep) — se llena en C3
src/features/…    vacío (.gitkeep) — C5/C6
src/components/, src/pages/, tests/  vacíos (.gitkeep)
```

Pendiente de crear (NO existen aún, correcto para el gate actual): `docs/04-acceptance-tests.md`
(C8), `README.md` (C8), `WORKSHOP_DEMO_SCRIPT.md` (C8), `package.json`/tooling React (C4),
`src/App.tsx`, `src/main.tsx` (C4).

## 3. Verificación al cierre de C2

- `tsc --strict --noEmit` → **0 errores**, sin `any`, sin locals/params sin uso.
- Prueba de humo (9/9): transiciones prohibidas rechazadas, guardas
  `MISSING_VERIFICATION_OUTCOME` y `RESOLVE_BEFORE_CLOSE` activas, `deriveResidentStatus`
  correcto (red/yellow/green).
- `taxonomy.ts` verificado idéntico a `01-domain-taxonomy.yaml`.

> El typecheck se hizo en un entorno aislado; **no** se añadió `package.json` ni
> `node_modules` al repo (eso corresponde a C4).

## 4. Primer paso en Claude Code

1. Abrir la carpeta del proyecto: `C:\Users\Rober\projects\CARESIGNALAPP`.
2. Inicializar git y sellar la línea base C0–C2 (mi entorno no pudo por el montaje):

   ```bash
   git init
   git add -A
   git commit -m "baseline: CareSignal MVP C0-C2 (scaffold, docs C1, domain C2)"
   git tag c2-gate
   ```

   Si existe una carpeta `.git` rota heredada de la sesión anterior, bórrala antes:
   `rmdir /s /q .git` (CMD) o `Remove-Item -Recurse -Force .git` (PowerShell), luego `git init`.
3. Confirmar que Claude Code lee `CLAUDE.md` y reconoce la posición: **Gate C2, siguiente Chunk 3.**

## 5. Prompt listo para pegar (Chunk 3)

```text
MODO REANUDACIÓN DESDE GATE

Gate aprobado: C2.

1. Inspecciona los artefactos hasta C2 (docs/00–03, 05; src/domain/*.ts) y confirma
   que cumplen el contrato congelado. Reporta desviaciones antes de tocar archivos.
2. Ejecuta EXCLUSIVAMENTE el Chunk 3 (contrato §15, "CHUNK 3 — Datos ficticios y
   persistencia local"). No avances a C4.

Crea únicamente:
- src/data/seed.ts
- src/data/repository.ts
- src/data/demoClock.ts
- src/data/resetDemo.ts

Requisitos clave (del contrato):
- 10 residentes, 3 cuidadores, 1 supervisor, 3 turnos, 20 rondas, 5 alertas de demo,
  incidentes y eventos de auditoría coherentes; datos 100% ficticios, sin diagnósticos.
- Deben existir los 10 escenarios obligatorios (§10 / Chunk 3).
- Repositorio como única capa de persistencia (localStorage): listar, consultar por ID,
  guardar, actualizar, reiniciar, migrar/limpiar datos incompatibles, conservar auditoría.
- La UI NUNCA accede directo a localStorage (regla 15/16).
- Reloj simulado DETERMINISTA: avanzar 1/5/15 min y restablecer; sin esperas reales.
- Usa sin modificar: 01-domain-taxonomy.yaml, 02-state-machine.md, src/domain/*.ts.

Salida esperada: inventario de datos generados, diagrama de acceso a datos, explicación
del reloj, validación de integridad referencial (todos los IDs referenciados existen),
confirmación de que no se creó interfaz, y actualización de CHANGELOG.md. Luego DETENTE
en Gate C3.
```

## 6. Recordatorio de Gate C3

Aprobar solo cuando: todos los IDs referenciados existen, la auditoría es coherente, el
reloj es determinista y no hay acceso directo a `localStorage` desde la UI.
