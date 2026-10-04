# RESUME — Estado actual y punto de reanudación

> Nota de continuidad para retomar el proyecto en una sesión nueva. La fuente de verdad
> sigue siendo el contrato congelado; este archivo describe **dónde estamos** y
> **qué sigue**. Autoridad: informativa (por debajo del contrato, `CLAUDE.md` y `docs/`).
>
> **Fecha de captura:** 2026-10-04 · **Posición:** E5 L-01 en gate (PR #4 en CI)
> **Sin fecha límite activa — continúa hasta nuevo aviso**

---

## 1. Lo que ya está terminado

### Producto (C-track completo + extensiones post-gate)

El MVP base cerró como `v0.1.0-workshop` con auditoría **PASS**. Luego se aprobaron
cambios de contrato (v0.1.1, v0.2.0) que extendieron el producto.

| Chunk / Tarea | Descripción | Estado |
|---|---|---|
| C0–C8 | Build original, 8 fases gateadas | ✅ PASS, 38/38 pruebas |
| T5–T6 | SHIFTS enum, AuditEventAction literal | ✅ v0.1.1 |
| T12 | `Resident.monitoringFrequency` → `careLevel: CareLevel` | ✅ v0.1.1 |
| T13 | `Round.completionOutcome` como enum canónico | ✅ v0.1.1 |
| T14 | `residenciaId` en las 6 interfaces — preparación multi-tenant | ✅ v0.2.0 |
| P1–P6 §06 | Rol `manager`, route guards, `ManagerDashboardPage` | ✅ |
| UX post-gate | Dashboard dinámico por rol, Mis Rondas móvil, Bitácora, Personal | ✅ |
| Seed ampliada | 20 residentes · 15 personal · 20 rondas · 6 alertas · 2 incidentes | ✅ |

### E-track (evolución continua)

| Fase | Contenido | Estado |
|---|---|---|
| **E0** | Higiene del repositorio | ✅ Completa |
| **E1** | Decisiones estratégicas (seguridad, precios, equipo, GitHub) | ✅ Completa |
| **E2** | Contenido (seguridad, mercado, competencia, valor) | ✅ Completa |
| **E3** | Deck 14 slides, dossier, lámina, guion pitch, storyboard | ✅ Materiales listos (video E3.3 pendiente) |
| **E4** | CI 6-job, 47→59 unit tests, 3 suites E2E (PR #1 mergeado) | ✅ Completa |
| **E5 L-01** | Toast simulados + WCAG 2.2 a11y + policy UI + 12 unit tests | ✅ PR #4 mergeado — gate cerrado 2026-10-04 |
| **E6 — A-01** | Dependabot npm semanal (`.github/dependabot.yml`) | ✅ PR #5 mergeado |
| **E6 — E6.1** | 5 ADRs producción (`docs/15-adr.md`) | ✅ PR #6 mergeado |
| **E5 L-02** | Dashboard métricas `/metricas` — 5 KPIs, 2 charts, RoleGuard | ✅ PR #7 mergeado — gate cerrado 2026-10-04 |
| **E5 L-03 + E6.5** | PWA manifest + íconos + Lighthouse CI job | ⏳ En desarrollo — rama feature/l03-pwa-lighthouse |
| **E5 L-04** | Vista calendario — 20 residentes, colores por estado, 375 px | 🔵 Pendiente L-03 |

### E1 — Decisiones tomadas

| # | Decisión | Valor |
|---|---|---|
| E1.1 | Eje IA + ciberseguridad | Reposicionamiento aprobado |
| E1.2 | Precios | Esencial $1,490 · Profesional $3,490 · Institucional $6,990 MXN/mes/residencia |
| E1.3 | Equipo | Roberto García — Fundador / PO / Arquitecto / UX (proyecto individual) |
| E1.4 | GitHub | RobertMX23/CareSignalAPP (privado, Free plan) |

### PRs y ramas

| PR | Rama | Contenido | Estado |
|----|------|-----------|--------|
| #1 | `qa/ci-pipeline-and-tests` | CI 6-job + 47 unit tests | ✅ mergeado |
| #2 | `e2e/temporal-engine-tests` | Tests E2E motor temporal, fix selectores A-06/A-08 | ✅ mergeado |
| #3 | `feature/l01-toast-notifications` (primera parte) | Toast + WCAG a11y | ✅ mergeado |
| #4 | `feature/l01-toast-notifications` | 12 unit tests U-T01/U-T12 + @testing-library/react | ✅ mergeado |
| #5 | `chore/dependabot-config` | Dependabot npm semanal — A-01 E6 | ✅ mergeado |
| #6 | `docs/e6-adr-produccion` | 5 ADRs producción (auth, DB, Cloud Run, obs, API) | ✅ mergeado |
| #7 | `feature/l02-metricas-dashboard` | E5 L-02: /metricas, 5 KPIs, recharts, RoleGuard | ✅ mergeado — gate cerrado |
| **#8–#11** | `dependabot/*` | **Bumps automáticos Dependabot (major: vite 8, ts 7, jsdom 30, plugin-react 6)** | **⚠️ NO mergear — major bumps** |

---

## 2. Inventario técnico actual

### Tests

| Archivo | Pruebas | Cubre |
|---------|---------|-------|
| `tests/domain-rules.test.ts` | 9 | Reglas de negocio congeladas |
| `tests/domain-transitions.test.ts` | 12 | Máquina de estados |
| `tests/seed-integrity.test.ts` | 5 | Integridad de semilla |
| `tests/alert-operations.test.ts` | 2 | Flujo supervisor ciclo completo |
| `tests/round-operations.test.ts` | 4 | Operaciones de ronda |
| `tests/temporal-engine.test.ts` | 6 | Motor temporal |
| `tests/repository.test.ts` | 9 | Repository layer |
| `tests/toast.test.tsx` | 12 | Toast L-01 (U-T01/U-T12) |
| **Total** | **59/59** | |

### Roles (congelados en `src/domain/taxonomy.ts`)

| Rol | Staff en seed | Acceso |
|-----|---------------|--------|
| `caregiver` | 9 (3/turno) | `/dashboard` · `/mis-rondas` · `/residentes` |
| `supervisor` | 3 (1/turno) | `/dashboard` · `/alertas` · `/residentes` · `/personal` |
| `manager` | 2 (mañana/tarde) | Todo lo de supervisor + `/bitacora` + `closeAlert()` |
| `demo_admin` | 1 | Todas las rutas + `/control-demo` |

### Páginas (`src/pages/`)

| Página | Ruta | Rol mínimo |
|--------|------|------------|
| `DashboardPage` | `/dashboard` | todos |
| `CaregiverRoundsPage` | `/mis-rondas` | caregiver |
| `AlertDetailPage` | `/alertas/:alertId` | supervisor |
| `ResidentDetailPage` | `/residentes/:residentId` | todos |
| `PersonalPage` | `/personal` | supervisor |
| `BitacoraPage` | `/bitacora` | manager |
| `DemoControlPage` | `/control-demo` | demo_admin |
| `SupervisorDashboardPage` | (hijo de Dashboard) | supervisor |
| `ManagerDashboardPage` | (hijo de Dashboard) | manager |

### Infraestructura de calidad

| Componente | Estado |
|------------|--------|
| `.github/workflows/ci.yml` — 6 jobs (typecheck, unit, build, e2e-chromium, e2e-firefox, e2e-mobile) | ✅ |
| `playwright.config.ts` — 4 proyectos (Chromium, Firefox, WebKit, Mobile 375 px) | ✅ |
| `.devcontainer/devcontainer.json` — Codespaces Debian 12 + Node 20 + Playwright | ✅ |
| `docs/14-design-policy.md` — política UI normativa (WCAG 2.2, IBM Carbon, WAI-ARIA APG) | ✅ |

---

## 3. Pendientes reales

| # | Tarea | Responsable |
|---|-------|-------------|
| 1 | Merge PR #4 — bypass rules → merge en GitHub | Humano |
| 2 | Cerrar gate L-01 (actualizar estado en `docs/13-capas-demo.md`) | IA + Humano |
| 3 | Implementar E5 L-02 — `/metricas` (5 KPIs, 2 charts, RoleGuard) | IA + Humano |
| 4 | Video E3.3 — guion y storyboard listos en `docs/`, solo falta grabar | Humano |

---

## 4. Cómo verificar que todo sigue sano

```bash
npm install
npm run typecheck       # TypeScript estricto — 0 errores
npm run test            # 59/59 pruebas unitarias (Vitest)
npm run test:e2e        # suites E2E (Playwright)
npm run build           # compilación de producción
npm run dev             # http://localhost:5173
```

CI automático: cada push/PR dispara `.github/workflows/ci.yml`.
Resultados: `https://github.com/RobertMX23/CareSignalAPP/actions`

---

## 5. Contexto de negocio

| Item | Valor |
|------|-------|
| Producto | Demo web MVP para residencias de adultos mayores |
| Aviso legal obligatorio | "MVP operacional, no dispositivo médico" + "Datos ficticios" |
| Segmento | ~1,297 residencias privadas en México (DENUE) |
| Producción (si aplica) | Google Cloud Run + Firebase + BigQuery (fuera del MVP actual) |
| Repo | `https://github.com/RobertMX23/CareSignalAPP` |
| Codespaces | Botón verde → Code → Codespaces |

---

## 6. Materiales de referencia

| Material | URL / Ruta | Descripción |
|----------|-----------|-------------|
| Matriz SDLC (Artifact) | https://claude.ai/artifact/DshceZx3wdUNy5k6wGpTWA | Roles × Skills × Tools × Metodologías × Gaps — artefacto interactivo |
| Contrato congelado | `contract/CareSignal_MVP_...FROZEN.md` | Fuente de verdad del producto |
| Design Policy | `docs/14-design-policy.md` | Norma UI WCAG 2.2 / IBM Carbon |
| Capas demo E5 | `docs/13-capas-demo.md` | Contrato L-01 a L-04 |

---

## 7. Próximas decisiones (solo humanas)

- ¿Merge PR #4 + cerrar gate L-01? → CI verde → bypass rules → merge.
- ¿Arrancar L-02 (métricas)? → requiere gate L-01 cerrado.
- ¿Grabar video E3.3? → guion en `docs/` listo.
- ¿Continuar hacia producción? → nueva versión contrato (§13) + decisión backend.
