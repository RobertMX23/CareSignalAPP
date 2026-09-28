# Changelog — CareSignal MVP

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
Versionado según el contrato congelado §13.4: la línea base congelada nunca se edita
silenciosamente; toda modificación material aprobada crea una nueva versión (p. ej.
`0.1.1`, `0.2.0`) con trazabilidad.

## [Unreleased]

### Infraestructura de QA y CI (2026-09-28)

No modifica el producto ni el contrato congelado. Añade la capa de calidad
automatizada y el entorno de desarrollo en la nube.

- **Añadido** `.devcontainer/devcontainer.json` — entorno GitHub Codespaces con imagen
  `typescript-node:1-20-bookworm` (Debian 12), Node 20, GitHub CLI y Playwright
  instalado automáticamente via `postCreateCommand`. Resuelve incompatibilidad de
  Playwright 1.47+ con Debian 11 (Bullseye). Puerto 5173 abre el navegador al crear
  el Codespace; puertos 4000 y 8080 reservados para Firebase Emulator y Cloud Run local.

- **Añadido** `playwright.config.ts` + `e2e/` — suite de pruebas E2E con Playwright
  1.44 y Chromium headless. 13 tests en 3 archivos:
  - `qa-roles.spec.ts` (4) — visibilidad de nav por rol (cuidador, supervisor, gerente)
  - `qa-caregiver.spec.ts` (4) — T1 completar ronda, T2 iniciar ronda, T3 solicitar
    apoyo, T4 modal exige selección antes de habilitar confirmar
  - `qa-supervisor.spec.ts` (5) — T5 métricas dashboard, T6 lista de alertas,
    T7 detalle de alerta, T8 Bitácora oculta para supervisor, T9 banner MVP en todas
    las páginas
  - `e2e/helpers.ts` — utilidades compartidas: `resetSeed`, `selectRole`, `goTo`
  - Resultado: **13/13 passed** en GitHub Codespaces

- **Añadido** `.github/workflows/e2e.yml` — CI GitHub Actions que corre los 13 tests
  E2E en cada `push` y `pull_request` a master (`ubuntu-latest`, Node 20, `npm ci`,
  Chromium headless). Sube `test-results/` como artefacto con retención de 7 días
  cuando hay fallos.

- **Corregido** locators en `e2e/qa-caregiver.spec.ts` — `CaregiverRoundsPage` renderiza
  los botones de acción en dos vistas paralelas (`.rounds-cards-view` móvil oculta a
  ≥768px y `.rounds-table-view` visible). `button:has-text("Completar").first()` tomaba
  el elemento del view móvil (`display:none`), causando `toBeVisible() failed`. Scoped
  a `.rounds-table-view button:has-text(...)` para coincidir con el elemento del
  viewport Desktop Chrome (1280px).

- **Corregido** locator en `e2e/qa-supervisor.spec.ts` (T7) — selector con comas
  `text=Severidad, text=Estado, ...` es sintaxis CSS inválida en Playwright (retorna
  `element not found`). Cambiado a `dt:has-text("Severidad")` que coincide con el
  `<dl class="detail-list">` real de `AlertDetailPage`. Además, `a[href*="alertas"]`
  coincidía con el nav link `/alertas` antes que con los links de fila de la tabla;
  scoped a `table.data-table tbody a` para apuntar sólo a links de datos.

- **Conectado** repositorio a GitHub — remote `https://github.com/RobertMX23/CareSignalAPP.git`.
  Cierra E1.4 (cuenta de GitHub) y E3.2 (publicación del repo). El primer push activó
  automáticamente el workflow de CI.

### E0 — Higiene del repositorio (track de entrega)

Preparación para la entrega al concurso WomenCISO 4 / MenCISO 1. **No modifica el
producto ni el contrato congelado**; reorganiza documentación y herramientas.

- **Corregido (crítico para la operación)** `CLAUDE.md` y `docs/RESUME.md` declaraban
  «Gate C2 aprobado, siguiente Chunk 3» cuando las ocho fases están cerradas desde el
  release `v0.1.0-workshop`. Como `CLAUDE.md` se carga al inicio de cada sesión, toda
  sesión nueva arrancaba con un mapa falso del proyecto. Ambos reescritos con el estado
  real y el track E como trabajo vigente.
- **Añadido** a `CLAUDE.md` la sección «Commercial material», con las tres reglas que
  rigen el material comercial: no altera el contrato, repite los límites del producto y
  cita cifras desde la ficha de datos.
- **Movido** el material comercial de la raíz a `business/` (5 de 6 archivos; el PDF
  quedó bloqueado por un visor abierto). **Renombrado** `docs/mockup-prompt.md` a
  `docs/07-mockup-prompt.md` para respetar la numeración.
- **Añadido** `tools/` con los tres generadores de entregables
  (`build-dossier.cjs`, `build-deck.cjs`, `build-lamina.cjs`), que vivían en un
  directorio temporal de sesión y se perdían. Extensión `.cjs` porque el proyecto
  declara `"type": "module"`. Nuevos guiones: `docs:dossier`, `docs:deck`,
  `docs:lamina`, `docs:all`. Escriben a `business/`.
- **Añadido** `docs/08-entregables.md` (índice de todo el material producido y cómo
  regenerarlo) y `docs/09-datos-mercado.md` (cifras con fuente, fecha y advertencias
  metodológicas, incluida la discrepancia DENUE/INEGI sobre el número de
  establecimientos).
- **Actualizado** `react-router-dom` de 6.30.4 a 6.30.6 por tres avisos de seguridad
  (open redirect vía backslash, inyección de constructor en hidratación SSR, y open
  redirect con XSS). **Riesgo residual aceptado y documentado:** el cierre completo
  exige React Router v7, un cambio mayor. En esta aplicación los `<Link>` solo reciben
  identificadores generados internamente, no hay `useNavigate` ni renderizado en
  servidor, de modo que la explotabilidad real es marginal. Verificado tras actualizar:
  typecheck limpio, 38/38 pruebas, compilación correcta.

- **Añadido** `docs/06-event-map.md` — mapa event-driven de la aplicación: catálogo de
  los 20 eventos de auditoría realmente emitidos (agrupados por agregado), los
  comandos que los disparan, las 8 políticas automáticas, las guardas/invariantes y
  las proyecciones de solo lectura. Extraído del código (`transitions.ts`,
  `*Operations.ts`, `temporalEngine.ts`, `seed.ts`), no de un diseño teórico.
  **Nota de alcance:** el contrato §9.2 enumera `docs/00`–`05`; este `06` es
  documentación derivada añadida tras el Gate C8 y no introduce entidades, estados,
  transiciones ni actores nuevos.
- **Añadido** `README.md` §0 "Resumen ejecutivo y punto de control": estado del
  protocolo de gates (C0–C8, todos aprobados), resultados medibles de la auditoría
  de QA (20/20 pruebas de aceptación, 38/38 pruebas automatizadas, 0 `blocker`) y un
  resumen de la estructura de carpetas construida, con fines de reporte ejecutivo.
  Solo documentación; no cambia código ni versión.

## [0.1.0-workshop] — 2026-07-18

### Chunk 8 — QA, accesibilidad y release (Gate C8)

No se agregaron funciones nuevas; solo correcciones `high`, documentación y pruebas.

- **Añadido** `tests/` (vitest + jsdom): 38 pruebas cubriendo la máquina de estados
  (transiciones válidas/bloqueadas, guardas `MISSING_VERIFICATION_OUTCOME` /
  `RESOLVE_BEFORE_CLOSE`), `deriveResidentStatus` y la regla de alerta duplicada,
  integridad y determinismo de la semilla, el motor temporal (generación/escalado de
  alertas, idempotencia, rondas completadas/canceladas nunca vencen) y las
  operaciones de cuidador/supervisor (ciclo completo de alerta, reasignación con su
  propio evento de auditoría). `npm run test` / `npm run typecheck` (ahora incluye
  `tests/`).
- **Corregido (hallazgo high)** los 4 diálogos (`CompleteRoundModal`,
  `RequestSupportModal`, `AssignAlertModal`, `ResolveAlertModal`) no movían el foco
  al abrirse ni cerraban con Escape — un usuario de teclado tenía que tabular por el
  resto de la tabla para alcanzarlos (prueba obligatoria #17). Se añadió
  `src/components/useAutoFocusModal.ts`, usado por los cuatro.
- **Añadido** `docs/04-acceptance-tests.md` — matriz de las 20 pruebas obligatorias
  del contrato con su evidencia (automatizada y/o manual) y el registro de hallazgos
  clasificados (high corregido, medium y low documentados en backlog, cero
  `blocker`).
- **Actualizado** `docs/05-known-limitations.md` — documenta explícitamente que una
  ronda `overdue` es terminal (un residente sigue en rojo aunque su alerta se
  resuelva y cierre) y la limitación de la tabla ancha en móviles muy angostos.
- **Añadido** `README.md` — problema, alcance, usuarios, arquitectura, instalación,
  ejecución, reinicio, demo, pruebas, limitaciones, exclusiones médicas y próximos
  pasos (backlog v0.2).
- **Añadido** `WORKSHOP_DEMO_SCRIPT.md` — guion de demo paso a paso (recorrido
  rápido, escenario principal vía botones, el mismo ciclo hecho a mano, reinicio).
- **Verificado manualmente** (además de lo automatizado): ancho móvil (375 px) en
  las 5 páginas — navegación colapsable, filtros y tablas se adaptan (scroll
  horizontal en la tabla más ancha); navegación con teclado — todos los controles
  son elementos nativos con foco visible, confirmado tras la corrección de los
  diálogos.
- **Release:** `CareSignal MVP v0.1.0-workshop`. Resultado de la auditoría: **PASS**
  (ver `docs/04-acceptance-tests.md`) — sin hallazgos `blocker`, un hallazgo `high`
  corregido, sin expansión de alcance.

### Chunk 7 — Motor temporal y escenarios de demostración (Gate C7)

Integra el reloj de demostración con rondas y alertas. No se modificó la taxonomía
ni la máquina de estados: el motor solo dispara transiciones ya existentes
(`transitionRound`) y crea/actualiza alertas con las mismas guardas usadas en
capítulos anteriores (`hasActiveAlertForRound`, `isAlertActive`).

- **Añadido** `src/data/temporalEngine.ts` — `runTemporalEngine(currentTime)`:
  recorre las rondas no terminales y aplica `scheduled→due→overdue` según
  `scheduledAt`/`dueAt`; para toda ronda `overdue` sin alerta activa crea una alerta
  (amarilla si el retraso es inicial, roja si ya supera `CRITICAL_DELAY_MINUTES = 15`
  minutos) y, si ya existe una amarilla, la sube a roja cuando el retraso cruza ese
  umbral. Nunca toca rondas `completed`/`cancelled` ni cierra/resuelve alertas por su
  cuenta (regla: requiere verificación humana). Idempotente por diseño.
- **Modificado** `src/data/demoClock.ts` — cada avance del reloj (`advanceByMinutes`,
  usado por los botones de 1/5/15 min) y `resetClock()` ahora llaman a
  `runTemporalEngine` con la nueva hora, para que el reloj y los datos nunca queden
  desincronizados.
- **Añadido** `src/features/demo/scenarios.ts` — los tres escenarios deterministas
  del contrato, todos sobre la misma ronda fija (`round-01`, Marta Ibáñez) para ser
  reproducibles: `runMissedRoundScenario` (avanza el reloj justo después del
  vencimiento), `runEscalatedAlertScenario` (avanza hasta superar el umbral crítico,
  asigna y escala), `runFullResolutionScenario` (verifica, registra resultado,
  resuelve y cierra, y reporta el tiempo total). Cada uno revisa el estado actual
  antes de actuar, así que ejecutarlos más de una vez o fuera de orden no duplica
  alertas ni repite transiciones.
- **Modificado** `src/pages/DemoControlPage.tsx` — tres botones de escenario junto a
  los controles de reloj existentes, con un aviso de resultado/error.
- **Nota de estructura (para revisión):** el contrato (§9.2 / `CLAUDE.md`) nombra
  `src/features/{rounds,alerts,incidents,dashboard}/`; este chunk agrega
  `src/features/demo/` para el motor temporal orquestado a nivel de escenario, ya
  que no encajaba limpiamente en ninguna de las cuatro carpetas existentes. No
  introduce entidades ni estados nuevos, solo organiza código.
- **Validado** `npm run typecheck` y `npm run build`: sin errores. Probado en el
  navegador: avanzar el reloj crea automáticamente una alerta amarilla al vencer una
  ronda (`round-02`) y la sube a roja al superar el umbral; repetir el avance no
  duplica ni la alerta ni el evento de escalado. Los tres escenarios ejecutados en
  secuencia llevan `round-01`/su alerta de abierta a cerrada (con incidente
  sincronizado) en segundos; repetir cualquiera de los tres después no duplica nada
  (mensajes de "ya estaba..." en vez de nuevas transiciones). Cumple el límite de
  cinco minutos con margen amplio.

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
