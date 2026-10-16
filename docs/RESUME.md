# RESUME — Estado actual y punto de reanudación

> Nota de continuidad para retomar el proyecto en una sesión nueva. La fuente de verdad
> sigue siendo el contrato congelado; este archivo describe **dónde estamos** y
> **qué sigue**. Autoridad: informativa (por debajo del contrato, `CLAUDE.md` y `docs/`).
>
> **Fecha de captura:** 2026-10-16 · **Posición:** track E7 cerrado (B-01 a B-08; **B-04 parcial**)
> **Commit:** `5cb686f` en `master`, `demo` y `production` · **PR abiertos:** ninguno
> **Sin fecha límite activa — continúa hasta nuevo aviso**
>
> Cada dato de este archivo se verificó contra GitHub, la nube o el repositorio el día de la captura.
> Para reverificar, ver la sección 5.

---

## 0. En 30 segundos

- Hay **tres entornos** publicados y alineados en el mismo commit; un cambio avanza solo en una dirección: `master` → `demo` → `production`, siempre con CI en verde.
- El **demo público** (jurados) funciona sin cuenta, con tres perfiles y un recorrido guiado por rol.
- **Producción** usa Google SSO con *claims*; una cuenta sin claims ve "sin acceso".
- Lo que **no** existe todavía: la interfaz no lee ni escribe Firestore (sigue sobre `localStorage`) y el rol de la interfaz no sale del token. Es el siguiente gran trabajo.

---

## 1. Entornos

| Entorno | Rama | URL | Acceso | Datos |
|---|---|---|---|---|
| **Demo público** (jurados) | `demo` | https://caresignal-demo.web.app | Solo invitado (cuidador/a, supervisor/a, gerente), recorrido guiado | Ficticios, `localStorage` del navegador |
| **QA** | `master` | canal `qa` del site de producción | Invitado y Google (`hybrid`) | Ficticios |
| **Producción (beta)** | `production` | https://caresignal-mvp-2026.web.app | Solo Google, con claims (`google`) | `localStorage` en la interfaz; rules y claims reales en la nube |
| Informe Lighthouse | — | https://caresignal-demo.web.app/informes/ | Público | Generado en cada despliegue |

Alerta de caída (Cloud Monitoring, proyecto `caresignal-mvp-2026`): 2 *uptime checks* (demo y producción, cada 5 min, 6 ubicaciones) y 2 políticas que avisan por correo si el sitio falla desde dos o más ubicaciones durante 5 min. Detalle y comandos de verificación en `docs/21-gcp-iam-apis-deploy.md`.

Reglas de ramas y despliegue: `docs/20-contrato-ramas-cicd.md`. Arquitectura con diagramas: `docs/22-arquitectura.md`.

---

## 2. Lo que ya está terminado

### Producto (C-track completo + extensiones post-gate)

El MVP base cerró como `v0.1.0-workshop` con auditoría **PASS**. Luego se aprobaron
cambios de contrato (v0.1.1, v0.2.0) que extendieron el producto.

| Chunk / Tarea | Descripción | Estado |
|---|---|---|
| C0–C8 | Build original, 8 fases gateadas | ✅ PASS, 38/38 pruebas en su momento |
| T5–T6 | SHIFTS enum, AuditEventAction literal | ✅ v0.1.1 |
| T12 | `Resident.monitoringFrequency` → `careLevel: CareLevel` | ✅ v0.1.1 |
| T13 | `Round.completionOutcome` como enum canónico | ✅ v0.1.1 |
| T14 | `residenciaId` en las 6 interfaces — preparación multi-tenant | ✅ v0.2.0 |
| P1–P6 §06 | Rol `manager`, route guards, `ManagerDashboardPage` | ✅ |
| UX post-gate | Dashboard dinámico por rol, Mis Rondas móvil, Bitácora, Personal | ✅ |
| Semilla actual | 20 residentes · 15 personal · 42 rondas · 7 alertas · 3 incidentes · 198 eventos de auditoría | ✅ |

### E-track (evolución continua)

| Fase | Contenido | Estado |
|---|---|---|
| **E0–E2** | Higiene del repo; decisiones estratégicas; contenido (seguridad, mercado, competencia, valor) | ✅ |
| **E3** | Deck 14 slides, dossier, lámina, guion pitch, storyboard | ✅ Materiales listos (el video E3.3 figuraba pendiente en el registro anterior; no se verificó hoy) |
| **E4** | CI, pruebas unitarias y suites E2E (PR #1) | ✅ |
| **E5 L-01** | Toasts simulados + WCAG + política UI | ✅ PR #3, #4 |
| **E5 L-02** | Dashboard de métricas `/metricas` | ✅ PR #7 |
| **E5 L-03 + E6.5** | Manifest PWA, íconos SVG y job de Lighthouse CI | ✅ PR #12, #13 (**sin** service worker) |
| **E5 L-04** | Vista de calendario de rondas | ✅ PR #16 |
| **E5 L-05** | Recorrido guiado por rol | ✅ PR #33 |
| **E6** | Dependabot, 5 ADRs de producción, axe-core (WCAG 2.1 AA), migración de toolchain (vite 8, TypeScript 7, vitest 5, jsdom 30, React 19) | ✅ PR #5, #6, #14, #22, #26 |
| **E7** | Cierre de brechas del benchmark (B-01 a B-08) | ✅ salvo **B-04 parcial** — ver `docs/19-contrato-acciones-benchmark.md` §1.1 |

### E7 — Qué quedó hecho (resumen; la evidencia completa está en `docs/19` §1.1)

| ID | Qué | PR |
|---|---|---|
| B-01 | Security Rules con los paths reales + 24 pruebas con emulador en CI (con las originales fallaban 10) | #30 |
| B-02 | CSP en bloqueo, `Permissions-Policy`; HSTS ya lo servía Firebase | #34, #35 |
| B-03 | README con badges, `docs/22` con diagramas, informe público de Lighthouse | #37 |
| B-04 | `setUserClaims` activa en Node 22; limpieza de Artifact Registry; **parcial** | #29, #31, #32 |
| B-05 | `ErrorBoundary` en dos niveles + alerta de caída probada de punta a punta | #38 |
| B-06 | Modos `guest`/`hybrid`/`google`, "sin acceso" sin fallback, arreglo de recarga | #28, #36, #39 |
| B-07 | Ramas `master` → `demo` → `production` con CI como compuerta | #27, #29 |
| B-08 | Recorrido guiado por rol (motor propio) | #33 |

### E1 — Decisiones tomadas

| # | Decisión | Valor |
|---|---|---|
| E1.1 | Eje IA + ciberseguridad | Reposicionamiento aprobado |
| E1.2 | Precios | Esencial $1,490 · Profesional $3,490 · Institucional $6,990 MXN/mes/residencia |
| E1.3 | Equipo | Roberto García — Fundador / PO / Arquitecto / UX (proyecto individual) |
| E1.4 | GitHub | RobertMX23/CareSignalAPP (privado, Free plan) |

---

## 3. Inventario técnico actual

### Pruebas

| Suite | Casos | Dónde corre |
|---|---|---|
| Unitarias (Vitest, 17 archivos) | **115** | local y CI |
| Security Rules (`tests/rules/`, emulador de Firestore) | **24** | CI (requiere Java) — `npm run test:rules` |
| Functions con emuladores (`functions/test/`) | **2** | CI (requiere Java) — `npm run test:functions` |
| E2E (Playwright, solo Chromium, 11 archivos) | **66** | CI — en la última corrida, 62 pasaron y 4 fueron inestables (pasan al reintentar) |

Unitarias por archivo: `access-mode` 9 · `alert-operations` 2 · `claims` 7 · `domain-rules` 9 · `domain-transitions` 12 · `error-boundary` 7 · `error-reporting` 6 · `hosting-headers` 6 · `initial-profile` 5 · `lighthouse-report` 7 · `no-access` 3 · `repository` 9 · `round-operations` 4 · `seed-integrity` 5 · `temporal-engine` 6 · `toast` 12 · `tour-data` 6.

### Roles (congelados en `src/domain/taxonomy.ts`)

| Rol | Personal en la semilla | Rutas permitidas (según `RoleGuard` en `src/App.tsx`) |
|-----|---------------|--------|
| `caregiver` | 9 | `/dashboard` · `/mis-rondas` · `/rondas` · `/residentes` |
| `supervisor` | 3 | `/dashboard` · `/rondas` · `/alertas` · `/personal` · `/metricas` · `/residentes` |
| `manager` | 2 | Lo de supervisor + `/bitacora` (y puede cerrar alertas) |
| `demo_admin` | 1 | Todas + `/control-demo` |

### Páginas (`src/pages/`)

`DashboardPage` (con variantes `SupervisorDashboardPage` y `ManagerDashboardPage`) · `CaregiverRoundsPage` · `RoundsPage` · `AlertDetailPage` (lista y detalle) · `ResidentDetailPage` · `PersonalPage` · `MetricasDashboardPage` · `BitacoraPage` · `DemoControlPage` · `LoginPage` · `NoAccessPage`.

### Infraestructura

| Componente | Estado |
|------------|--------|
| `.github/workflows/ci.yml` — 7 jobs: typecheck, unit, build, e2e-chromium, Lighthouse, reglas de Firestore, Functions (emuladores). Se dispara en PR y lo invocan los workflows de despliegue | ✅ |
| `deploy-qa.yml`, `deploy-demo.yml`, `deploy-production.yml`, `deploy-preview.yml` | ✅ — ningún despliegue corre sin CI en verde (el preview de PR es la única excepción) |
| `firebase.json` — dos targets de Hosting (`production`, `demo`) con CSP, HSTS (lo sirve Firebase), `Permissions-Policy`, `X-Frame-Options`, `nosniff` y `Referrer-Policy`; reglas e índices de Firestore; Functions en `nodejs22` | ✅ |
| Cloud Functions: `setUserClaims` (Auth `user.create`, 1.ª gen, Node 22) | ✅ activa |
| Firebase Auth: Google SSO; 2 cuentas, **1 con claims** (`demo_admin`); `scripts/set-user-claims.mjs` para provisionar | ✅ |
| `playwright.config.ts` — un solo proyecto (Chromium); la suite corre en modo invitado con entrada automática | ✅ |
| `.devcontainer/devcontainer.json` — Node **20** (el CI usa 22) | ⚠️ desalineado |
| `.github/dependabot.yml` | ✅ |
| `docs/14-design-policy.md` — política UI normativa (WCAG 2.2, IBM Carbon, WAI-ARIA APG) | ✅ |

---

## 4. Pendientes reales

La lista completa y priorizada está en `docs/19-contrato-acciones-benchmark.md` §1.2. Los más importantes:

| # | Tarea | Responsable |
|---|-------|-------------|
| 1 | Evaluar las **6 vulnerabilidades** de `npm audit --omit=dev` (4 altas, 2 moderadas; directas: `firebase`, `react-router-dom`) | IA + Humano |
| 2 | **Identidad unificada**: que el rol de la interfaz salga del token y no del selector "Usuario ficticio" | IA + Humano |
| 3 | **Flujo vertical real**: login → claims → escritura en Firestore → auditoría (cierra B-04) | IA + Humano |
| 4 | Decidir la visibilidad del repositorio (hoy privado), tras un escaneo de secretos | Humano |
| 5 | Crear una alerta de presupuesto en Billing | Humano |
| 6 | Actualizar `docs/13-capas-demo.md` y `CLAUDE.md` (estado atrasado) | IA + Humano |

---

## 5. Cómo verificar que todo sigue sano

Pruebas locales:

```bash
npm install
npm run typecheck       # TypeScript estricto — 0 errores
npm run test            # 115 pruebas unitarias (Vitest)
npm run build           # compilación de producción
npm run dev             # http://localhost:5173
```

Suites que necesitan el emulador (Java) y el navegador; corren en CI:

```bash
npm run test:rules      # 24 casos de Security Rules
npm run test:functions  # setUserClaims contra emuladores de Auth, Functions y Firestore
npm run test:e2e        # 66 casos E2E (Playwright)
```

Estado de los entornos:

```bash
git ls-remote origin refs/heads/master refs/heads/demo refs/heads/production
gh run list --workflow deploy-production.yml --limit 1
curl -sI https://caresignal-mvp-2026.web.app/ | grep -iE "content-security|strict-transport|x-frame"
curl -s https://caresignal-demo.web.app/informes/lighthouse-badge.json
```

Resultados de CI: `https://github.com/RobertMX23/CareSignalAPP/actions`. Para consultar la nube (Hosting, Functions, Monitoring, claims) ver `docs/21-gcp-iam-apis-deploy.md`.

---

## 6. Contexto de negocio

| Item | Valor |
|------|-------|
| Producto | Demo web MVP para residencias de adultos mayores |
| Aviso legal obligatorio | "MVP operacional, no dispositivo médico" + "Datos ficticios" |
| Segmento | ~1,297 residencias privadas en México (DENUE) |
| Producción | Firebase (Hosting, Auth, Firestore, Functions) hoy; Cloud Run + BigQuery como destino (fuera del MVP actual) |
| Repo | `https://github.com/RobertMX23/CareSignalAPP` (privado) |
| Codespaces | Botón verde → Code → Codespaces |

---

## 7. Materiales de referencia

| Material | URL / Ruta | Descripción |
|----------|-----------|-------------|
| Matriz SDLC (Artifact) | https://claude.ai/artifact/DshceZx3wdUNy5k6wGpTWA | Roles × Skills × Tools × Metodologías × Gaps — artefacto interactivo |
| Contrato congelado | `contract/CareSignal_MVP_...FROZEN.md` | Fuente de verdad del producto |
| Design Policy | `docs/14-design-policy.md` | Norma UI WCAG 2.2 / IBM Carbon |
| Capas demo E5 | `docs/13-capas-demo.md` | Contrato L-01 a L-05 |
| Benchmark de ingeniería | `docs/18-benchmark-ingenieria.md` | Brechas y puntajes originales (20/35) |
| Plan y resultado de E7 | `docs/19-contrato-acciones-benchmark.md` | Tablero B-01 a B-08, evidencia y pendientes |
| Ramas y CI/CD | `docs/20-contrato-ramas-cicd.md` | Modelo `master` → `demo` → `production` |
| Cuentas, roles y APIs de GCP | `docs/21-gcp-iam-apis-deploy.md` | Qué se configuró a mano en Google Cloud y cómo recrearlo |
| Arquitectura | `docs/22-arquitectura.md` | Diagramas; separa lo conectado de lo no conectado |

---

## 8. Próximas decisiones (solo humanas)

- ¿Hacer público el repositorio? → antes, escaneo de secretos del historial (solo lectura); desbloquea badges visibles, protección de ramas y *environments*.
- ¿Crear la alerta de presupuesto en Billing? → 2 minutos en la consola.
- ¿Provisionar la segunda cuenta de Google (`robertogarciaits`)? → solo si se va a usar.
- ¿Arrancar el flujo vertical real? → es el trabajo más grande; conviene resolver antes el punto 1 y el 2 de la sección 4.
- ¿Pasar `setUserClaims` a 2.ª generación (*blocking functions*)? → requiere Identity Platform.
- ¿Grabar el video E3.3? → guion y storyboard en `docs/`.
- ¿Continuar hacia producción plena? → nueva versión de contrato (§13) y decisión de backend.
