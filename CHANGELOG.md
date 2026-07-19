# Changelog — CareSignal MVP

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Versionado según el contrato congelado §13.4: la línea base congelada nunca se edita
silenciosamente; toda modificación material aprobada crea una nueva versión (p. ej.
`0.1.1`, `0.2.0`) con trazabilidad.

## [Unreleased]

### Chunk 6 — Dashboard, alertas y escalamiento (Gate C6)

Solo el flujo del supervisor. No se modificó la taxonomía ni la máquina de estados;
los 6 resultados de verificación ya existían desde el Chunk 2.

- **Añadido** `src/features/dashboard/dashboardMetrics.ts` — `computeDashboardMetrics`
  (puro): residentes verde/amarillo/rojo (`deriveResidentStatus`), rondas
  próximas/vencidas, alertas abiertas/sin asignar/escaladas, verificaciones en
  progreso y tiempo mediano de respuesta (derivado del primer evento de auditoría
  posterior a la creación de cada alerta, no de un campo nuevo en `Alert`).
- **Añadido** `src/features/alerts/alertOperations.ts` — las 8 acciones del
  supervisor sobre `transitionAlert`/`transitionIncident` (dominio sin modificar):
  `acknowledgeAlert`, `assignAlert`, `reassignAlert` (registra su propio
  `AuditEvent` porque no cambia de estado —`assigned`/`escalated`— y aun así "toda
  reasignación genera auditoría"), `escalateAlert`, `startVerification` (abre o
  reutiliza el `Incident` asociado), `resolveAlert` (registrar resultado + resolver
  son una sola transición de dominio; también resuelve el incidente vinculado) y
  `closeAlert` (también cierra el incidente resuelto).
- **Añadido** `src/features/alerts/alertQueries.ts` — `getAssignmentHistory` y
  `getAlertTimeline` (puros), derivados del registro de auditoría append-only.
- **Añadido** `src/features/alerts/AssignAlertModal.tsx` y `ResolveAlertModal.tsx`.
- **Reescrito** `src/pages/SupervisorDashboardPage.tsx` — las 10 métricas del
  contrato en tarjetas, más las tablas de residentes y alertas activas (con
  responsable).
- **Reescrito** `src/pages/AlertDetailPage.tsx` — lista con los 6 filtros exigidos
  (severidad, estado, responsable, residente, turno, asignación) y detalle completo:
  residente, habitación, ronda de origen, hora programada, retraso (reutiliza
  `describeDelay` del Chunk 5), severidad, estado, responsable, incidente asociado,
  historial de asignaciones y línea de tiempo auditable combinada (alerta +
  incidente). Acciones condicionadas al estado real de la alerta; "sin asignar" se
  muestra con una insignia de texto, no solo color.
- **Validado** `npm run typecheck` y `npm run build`: sin errores. Ciclo completo de
  alerta probado en el navegador: abierta → reconocida → asignada → reasignada →
  escalada → en verificación (incidente creado) → resuelta (incidente resuelto) →
  cerrada (incidente cerrado); auditoría e historial de asignaciones verificados
  campo por campo. Guardas de dominio verificadas también con un arnés aislado:
  resolver una alerta que no está en verificación, resolver sin resultado y cerrar
  sin resolver se rechazan con `INVALID_TRANSITION`/`MISSING_VERIFICATION_OUTCOME`
  sin corromper datos.

### Chunk 5 — Flujo operacional del cuidador (Gate C5)

Solo el flujo del cuidador. No se tocó el dashboard completo del supervisor (Chunk 6),
no se añadieron campos clínicos ni se modificó la taxonomía ni la máquina de estados.

- **Añadido** `src/features/rounds/roundPriority.ts` — clasificación pura de "Mis
  rondas" en 5 grupos (roja, amarilla, en progreso, próxima, completada/cancelada) y
  cálculo de texto de retraso frente al reloj simulado.
- **Añadido** `src/features/rounds/roundOperations.ts` — orquesta las 4 acciones del
  cuidador llamando a `transitionRound`/`transitionAlert` (dominio sin modificar) y
  escribiendo solo a través de `repository.ts`:
  - `startRound` (`due → in_progress`);
  - `completeRound` (`in_progress → completed`; el "resultado operacional" —
    `completed_without_issue` / `assistance_requested` /
    `supervisor_verification_required` — se guarda como `metadata` del `AuditEvent`,
    no como campo nuevo en `Round`, según la decisión ya registrada en
    `docs/03-data-model.md`);
  - `requestSupport` (crea una alerta `open`; reutiliza `hasActiveAlertForRound` para
    impedir duplicados, regla 4);
  - `acceptAlert` (autoasignación `open → assigned`; es la única transición
    congelada compatible con "aceptar una alerta", ya que `assigned` no tiene una
    transición de "confirmar recepción" propia).
- **Añadido** `src/features/rounds/CompleteRoundModal.tsx` y `RequestSupportModal.tsx`
  — diálogos propios (no `window.prompt`) para pedir el resultado operacional/nota y
  la severidad, respectivamente.
- **Reescrito** `src/pages/CaregiverRoundsPage.tsx` — "Mis rondas" ahora incluye las
  rondas asignadas al usuario activo, las que tienen una alerta activa ya asignada a
  él y las que tienen una alerta activa abierta (sin asignar, disponible para
  cualquier cuidador); columnas de prioridad y retraso; botones de acción
  condicionados al estado real de la ronda/alerta.
- **Añadido** contenedor `.table-scroll` (desplazamiento horizontal) a todas las
  tablas existentes para que la nueva tabla de 8 columnas —y el resto— sigan siendo
  usables en pantallas angostas sin desbordar la página.
- **Validado** `npm run typecheck` y `npm run build`: sin errores. Las 7 pruebas
  manuales del contrato se ejecutaron en el navegador (algunas verificadas también a
  nivel de dominio con un arnés aislado): iniciar ronda, completar ronda (con nota +
  resultado operacional en el `AuditEvent`), solicitar apoyo (alerta creada,
  duplicado bloqueado), completar dos veces (`INVALID_TRANSITION`, sin corromper
  datos), transición inválida (`completed → in_progress` rechazada), cambiar de
  cuidador (la lista se refiltra), refrescar la página (los datos persisten en
  `localStorage`). Una ronda `due` normal se completa en 2 acciones tras "Iniciar
  ronda" (abrir el modal + confirmar), dentro del límite de 3 del contrato.

### Chunk 4 — Shell de la aplicación y navegación (Gate C4)

Solo cascarón visual; sin lógica operacional completa (acciones de ronda/alerta llegan
en Chunks 5–6; automatización temporal completa llega en Chunk 7).

- **Añadido** tooling de React + TypeScript + Vite: `package.json`, `tsconfig.json`,
  `vite.config.ts`, `index.html`. `react-router-dom` como única dependencia nueva de
  navegación (además de `react`/`react-dom`).
- **Añadido** `src/main.tsx`, `src/App.tsx` — punto de entrada y `HashRouter` con las 5
  rutas del contrato.
- **Añadido** `src/components/AppLayout.tsx` — cascarón con encabezado ("CareSignal"),
  selector de usuario ficticio, indicador de rol, hora simulada, navegación responsive
  (con menú colapsable en móvil), botón "Restablecer demo", indicador "Datos ficticios"
  y el aviso "MVP operacional, no dispositivo médico".
- **Añadido** `src/components/DemoSessionContext.tsx` — estado de sesión ficticia
  (usuario activo) y un `refreshToken` compartido para releer el repositorio tras
  restablecer la demo o avanzar el reloj. No es autenticación real.
- **Añadido** `src/components/StatusBadge.tsx` — estado derivado del residente con
  texto + ícono (nunca solo color).
- **Añadido** las 5 páginas: `SupervisorDashboardPage`, `CaregiverRoundsPage`,
  `ResidentDetailPage` (lista + detalle vía `:residentId`), `AlertDetailPage` (lista +
  detalle vía `:alertId`, incluye incidente asociado si existe), `DemoControlPage`
  (control del reloj simulado y snapshot de datos/auditoría). Todas leen datos reales
  del repositorio; ninguna toca `localStorage` directamente.
- **Añadido** `src/index.css` — estilos globales: botones grandes, alto contraste,
  responsive, sin gráficas decorativas ni animaciones.
- **Eliminado** `.gitkeep` de `src/domain/`, `src/data/`, `src/components/`,
  `src/pages/` (ya contienen archivos reales).
- **Validado** `npm run typecheck` (`tsc --strict --noEmit`): 0 errores. `npm run
  build`: compila y genera `dist/`. Verificación manual en navegador (servidor de
  desarrollo): las 5 páginas cargan con datos del repositorio, navegación funcional
  en escritorio y móvil (menú colapsable), reloj simulado sincronizado entre el
  encabezado y el Control de demo, sin errores de consola.

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
