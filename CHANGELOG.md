# Changelog — CareSignal MVP

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Versionado según el contrato congelado §13.4: la línea base congelada nunca se edita
silenciosamente; toda modificación material aprobada crea una nueva versión (p. ej.
`0.1.1`, `0.2.0`) con trazabilidad.

## [Unreleased]

### Chunk 3 — Datos ficticios y persistencia local (Gate C3)

Solo capa de datos. No se creó interfaz (React).

- **Añadido** `src/data/seed.ts` — semilla determinista: 10 residentes, 4 miembros de
  personal (3 cuidadores + 1 supervisor, 3 turnos), 20 rondas (cubren los 6 estados de
  ronda), 5 alertas y 2 incidentes coherentes; genera el trazado de auditoría llamando
  a `transitionRound`/`transitionAlert`/`transitionIncident` del dominio (sin
  modificarlo) en vez de escribir estados finales a mano. Cubre los 10 escenarios
  obligatorios del contrato. Incluye `validateReferentialIntegrity()`.
- **Añadido** `src/data/repository.ts` — única capa de persistencia (`localStorage`):
  listar/consultar por ID/guardar para residentes, personal, rondas, alertas e
  incidentes; auditoría append-only; documento versionado (`schemaVersion`) con
  limpieza y reemplazo por semilla fresca ante datos corruptos o incompatibles.
- **Añadido** `src/data/demoClock.ts` — reloj simulado determinista: avanzar 1/5/15
  minutos y restablecer, sin esperas reales; el offset se persiste vía el repositorio.
- **Añadido** `src/data/resetDemo.ts` — punto de entrada único para restablecer datos y
  reloj a la semilla original (usado por el futuro botón "restablecer demo", Chunk 4).
- **Validado** `tsc --strict --noEmit` (entorno aislado, sin `package.json`/
  `node_modules` en el repo): 0 errores, sin `any`. Prueba de humo funcional: conteos de
  semilla correctos, 0 problemas de integridad referencial, CRUD del repositorio,
  avance/restablecimiento del reloj y `resetDemo()` verificados con un `localStorage`
  simulado.

### Chunk 2 — Máquina de estados y modelo de datos (Gate C2)

Solo capa de dominio pura. No se creó interfaz ni datos de semilla.

- **Añadido** `docs/02-state-machine.md` — diagramas textuales y tablas de transiciones
  válidas/bloqueadas para round, alert e incident (contrato §7).
- **Añadido** `docs/03-data-model.md` — modelo de datos, convenciones y decisiones de
  modelado (contrato §8).
- **Añadido** `src/domain/taxonomy.ts` — vocabulario canónico como listas `as const`,
  tipos literales derivados y type guards. Verificado idéntico a la taxonomía YAML.
- **Añadido** `src/domain/types.ts` — interfaces estrictas Resident, StaffMember, Round,
  Alert, Incident, AuditEvent; alias `ID`/`ISODateTime`; re-exportación de tipos.
- **Añadido** `src/domain/rules.ts` — funciones puras: `deriveResidentStatus()`,
  helpers de alerta activa, unicidad de alerta por ronda, guardas resolver/cerrar.
- **Añadido** `src/domain/transitions.ts` — tablas de transición por lista blanca y
  aplicadores puros que devuelven `{ok, nextState, auditEvent}` o `{ok:false, error}`.
- **Validado** `tsc --strict --noEmit`: 0 errores, sin `any`, sin locals/params sin uso.
  Prueba de humo (9/9): transiciones prohibidas rechazadas, guardas de resultado y de
  cierre activas, `deriveResidentStatus` correcto (red/yellow/green).

### Chunk 1 — Contrato, taxonomía y límites (Gate C1)

Solo documentación. No se creó código React ni de dominio.

- **Añadido** `docs/00-product-contract.md` — contrato de producto: alcance, usuarios y
  permisos, in/fuera de alcance, no objetivos, reglas de negocio y exclusiones médicas.
- **Añadido** `docs/01-domain-taxonomy.yaml` — taxonomía congelada legible por máquina:
  roles, entidades, tipos de ronda, estados de ronda/alerta/incidente, severidad,
  disponibilidad, estado derivado del residente, distinciones alerta≠incidente y
  resolver≠cerrar, sinónimos prohibidos y reglas mínimas.
- **Añadido** `docs/05-known-limitations.md` — exclusiones médicas y técnicas,
  limitaciones de la demostración, no objetivos y gobierno de cambios.

### Chunk 0 — Andamiaje (Gate C0)

- **Añadido** `CLAUDE.md` — instrucciones operativas que codifican el contrato
  congelado: jerarquía de autoridad, protocolo de chunks/gates, taxonomía, reglas de
  negocio, alcance y modo de trabajo.
- **Añadido** estructura de carpetas según contrato §9.2 (`docs/`, `src/domain`,
  `src/data`, `src/features/{rounds,alerts,incidents,dashboard}`, `src/components`,
  `src/pages`, `tests/`) con marcadores `.gitkeep`.
- **Añadido** `.gitignore` (Node/React/TypeScript; ignora secretos).
- **Movido** el paquete del contrato congelado a `contract/` como línea base de verdad.

---

## Línea base congelada

- **Versión:** `CareSignal MVP 0.1.0-workshop-frozen`
- **Estado:** `FROZEN / BASELINE APPROVED FOR BUILD`
- **Documento:** `contract/CareSignal_MVP_Proyecto_Ejecutivo_Contrato_v0.1.0_FROZEN.md`
