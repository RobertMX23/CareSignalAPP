# Benchmark de ingeniería y diseño — CareSignal MVP

> Tribunal técnico de tres evaluadores (A: Arquitecto Cloud · B: Senior Frontend · C: Technical Due Diligence).
> Fecha: 2026-10-15 · Evidencia: lectura directa del repo en `master` (212 commits).
> Alcance: solo ingeniería y diseño. No evalúa funcionalidad de producto.

---

## 1. Veredicto rápido

- **Puntuación global: 20 / 35.**
- **Arquetipo más cercano:** entre *prototipo sin backend* y *SaaS B2B early-stage*. El dominio, la documentación y el CI son de SaaS early-stage; el runtime que ve el usuario sigue siendo de prototipo (persistencia en `localStorage`).
- **Posicionamiento para pitch:** *"Un dominio de reglas operativas tipado y probado, con la capa de producción (Auth, claims, Firestore rules) construida y versionada — pendiente de verificar y conectar."* No decir "plataforma en producción" mientras la UI no use el repositorio de Firestore.

---

## 2. Ranking por dimensión

| # | Dimensión | Punt. | Evidencia clave | Brecha principal |
|---|---|:-:|---|---|
| D1 | Servicios cloud | 3 | `firebase.json` (Hosting+Firestore+Functions+emulators); `functions/src/auth/setUserClaims.ts` (trigger `auth.user().onCreate` + `collectionGroup`); `firestore.indexes.json` (4 índices compuestos); `firebase-deploy.yml` 3 jobs | El UI no consume Firestore: `src/data/firestoreRepository.ts` no es importado por ninguna página. La Function está "pendiente IAM". |
| D2 | Seguridad / acceso | 3 | `firestore.rules`: helpers `sameResidencia()`, `isSupervisor()`, audit `update/delete: false`, catch-all deny; `backend/src/middleware/auth.ts` verifica JWT + `requireRole`; `.gitignore` excluye `.env*`; headers en `firebase.json` | Rules sin tests; posible defecto de paths (ver brecha 1); sin CSP ni HSTS; sin App Check. |
| D3 | Diseño web | 3 | `src/index.css` 1 292 líneas, 170 usos de `var(--…)` frente a 67 literales hex; tokens `--color-*`; 35 atributos `aria-*`/`role`; e2e `qa-accessibility.spec.ts`; badges ajustados a WCAG AA | 0 reglas `prefers-color-scheme` (sin dark mode); sin `ErrorBoundary`; 67 hex hardcoded siguen fuera de tokens. |
| D4 | Arquitectura / mantenibilidad | 4 | `src/domain/{types,taxonomy,rules,transitions}.ts` separados; 0 `: any`/`as any` en `src`, `backend/src`, `functions/src`; 8 suites Vitest + 8 specs Playwright; `docs/02-state-machine.md`, `15-adr.md`, `coding-standards.md` | Tres capas de persistencia (localStorage, `firestoreRepository`, `backend/`) sin contrato único ni ADR de cuál es la vigente. |
| D5 | Operaciones / observabilidad | 2 | `ci.yml`: typecheck, unit, build, e2e por navegador, Lighthouse CI; `logger.warn/info` estructurado en la Function | Sin error boundaries; `console.log` en `backend/src/app.ts`; sin alertas, sin Error Reporting, sin uptime check; Functions sin desplegar. |
| D6 | Escala / extensibilidad | 3 | `residenciaId` como partición en todas las colecciones y en los índices; repository pattern; dominio sin dependencias de framework | La persistencia real es `localStorage`; no hay prueba de aislamiento entre tenants; onboarding de tenant manual (`scripts/provision-firestore.ts`). |
| D7 | Evidencia pública | 2 | CHANGELOG con formato Keep a Changelog y trazabilidad; 212 commits; demo en `*.web.app`; `docs/` de 18+ archivos | Repo **privado** (Free plan); README sin badges de CI ni diagrama de arquitectura; sin reporte Lighthouse publicado (solo artefacto de CI 7 días). |
| | **Total** | **20/35** | | |

---

## 3. Comparación explícita con arquetipos

| Aspecto | (a) Prototipo Figma-to-code | (b) SaaS B2B early-stage | (c) Enterprise maduro | **CareSignal** |
|---|---|---|---|---|
| Backend real consumido por UI | No | Sí | Sí, multi-región | **No** (código existe, UI no lo usa) |
| Autorización server-side | No | Sí | Sí + auditoría externa | **Escrita, sin probar** |
| Dominio tipado y probado | No | Parcial | Sí | **Sí — por encima de (b)** |
| CI/CD | No | Build + deploy | Gates, canary, rollback | **Cercano a (b)**: 5 jobs de CI, deploy en 3 jobs |
| Observabilidad | No | Logs básicos | SLO, alertas, tracing | **(a)–(b)** |
| Evidencia pública | Demo | Demo + docs | Trust center, SOC 2 | **(a)** mientras el repo sea privado |

**Lectura:** CareSignal supera a (a) con claridad en dominio y CI; no alcanza (b) en lo que un cliente toca (persistencia, observabilidad, evidencia pública). Está a distancia estructural de (c).

---

## 4. Top 3 brechas críticas

### Brecha 1 — Las Security Rules probablemente no protegen ni permiten ningún documento real
- **Qué hay:** `firestore.rules` usa `match /rounds/{residenciaId}/{roundId}` (y lo mismo en `staff`, `residents`, `alerts`, `incidents`, `audit`).
- **El problema:** en Firestore un documento ocupa un número **par** de segmentos (`colección/doc`). `rounds/{rid}/{id}` son 3 segmentos: describe una colección, no un documento. Las rules compilan y se despliegan (CI verde), pero ese `match` no casa con ningún documento y todo cae en el catch-all `allow … if false`. Lo mismo afecta a `collectionGroup('staff')` en `setUserClaims.ts` y a la forma en que `provision-firestore.ts` escriba los documentos.
- **Estado:** hipótesis fuerte por sintaxis, **no verificada contra el emulador** (no hay tests de rules). Hay que confirmarlo antes de afirmarlo en público.
- **Evidencia que lo cierra:** (i) decidir el modelo de paths (`residencias/{rid}/rounds/{id}` es el estándar multi-tenant); (ii) tests con `@firebase/rules-unit-testing` — mínimo: lectura cross-tenant denegada, caregiver no crea alerta, `audit` no admite update/delete; (iii) ese suite como job de CI.

### Brecha 2 — "Producción" no está conectada: el producto corre sobre `localStorage`
- **Qué hay:** Auth Google SSO real, claims por trigger, `firestoreRepository.ts` (contra Cloud Run), backend Express con `requireRole`.
- **Falta:** ninguna página importa `firestoreRepository`; el job de Functions está pendiente de IAM; `cloudbuild.yaml` contiene `VITE_CLOUD_RUN_URL=…-xxxx-…` (placeholder). Un evaluador de Cloud Partner lo describirá como "login real sobre datos de demo".
- **Evidencia que lo cierra:** un flujo vertical único en producción — login → claims → una lectura/escritura (`rounds`) vía Firestore o Cloud Run → fila en `audit` visible con el `staffId` del token. Documentar en un ADR cuál de las dos rutas (Firestore directo vs Cloud Run) es la vigente y retirar la otra.

### Brecha 3 — Sin evidencia pública verificable y sin señal operativa
- **Qué hay:** CHANGELOG, 212 commits, CI de 5 jobs con Lighthouse, demo en `web.app`.
- **Falta:** repo privado; sin badges; Lighthouse sólo como artefacto efímero; sin `ErrorBoundary`; sin alertas. Además, el CHANGELOG afirma "CSP headers" en `firebase.json` y el archivo **no contiene CSP** — una discrepancia que un auditor detecta en minutos y erosiona la credibilidad del resto.
- **Evidencia que lo cierra:** repo público (o acceso de lectura para evaluadores), badge de CI, reporte Lighthouse con URL, corregir CHANGELOG o añadir el header real.

---

## 5. Cómo publicar capacidades reales — 5 acciones verificables

Ordenadas por impacto / esfuerzo.

| # | Acción | Verificable por un tercero con… | Esfuerzo |
|---|---|---|---|
| 1 | **Corregir paths de Firestore y añadir tests de rules** con `@firebase/rules-unit-testing` + emulador, como job de CI. | Job "Firestore rules tests" en verde; archivo `tests/rules/*.test.ts` visible. | Medio |
| 2 | **Corregir la discrepancia CSP**: añadir `Content-Security-Policy` y `Strict-Transport-Security` a `firebase.json`, o retirar la afirmación del CHANGELOG. | `curl -I https://caresignal-mvp-2026.web.app` muestra los headers; opcional: A en securityheaders.com. | Bajo |
| 3 | **Publicar evidencia**: badges de CI y Lighthouse en `README.md`, diagrama de arquitectura (1 imagen) y repo público o espejo de solo lectura. | URL del repo, badge verde, reporte Lighthouse público (`lhci` temporary-public-storage o GitHub Pages). | Bajo |
| 4 | **Cerrar el flujo vertical real**: resolver IAM de Functions, desplegar `setUserClaims`, y que una pantalla (Rondas) lea/escriba por Firestore con claims. | Log en Cloud Logging de `setUserClaims: claims inyectados`; documento en `audit` con `staffId` real; grabación corta o script e2e contra el emulador. | Alto |
| 5 | **Señal operativa mínima**: `ErrorBoundary` global en React + Firebase Performance/Analytics o Sentry free tier + alerta de uptime en Cloud Monitoring sobre la URL de Hosting. | Alerta configurada (captura de política), error de prueba visible en el panel, uptime check con historial. | Bajo–Medio |

---

## 6. Servicios Firebase sin usar — cuándo activarlos

| Servicio | ¿Suma puntos? | Cuándo activarlo | Costo/riesgo |
|---|---|---|---|
| **App Check** (reCAPTCHA Enterprise / v3) | D2 +0.5 | Cuando Firestore o Cloud Run reciban tráfico real del cliente (tras acción 4). Antes, protege algo que nadie llama. | Gratis en volumen de demo; requiere enforcement gradual para no romper la demo. |
| **Analytics** | D5 +0.5 | Con la acción 5, sólo con eventos operativos (login, ronda completada). No registrar datos de residentes. | Gratis; revisar consentimiento y que no envíe PII. |
| **Performance Monitoring** (no listado, pero en el mismo menú) | D5 +0.5 | Junto con Analytics; da métricas reales de carga para complementar Lighthouse sintético. | Gratis. |
| **App Hosting** | Ninguno | No ahora: ya hay Hosting estático con CDN para una SPA. Sólo si se migra a SSR (Next/Angular). | Duplicaría el despliegue. |
| **Servicios de IA** | Ninguno | No. El contrato prohíbe IA dentro del producto (CLAUDE.md, "Out of scope"). Reabrir sólo con change request y nueva versión del contrato. | Riesgo de alcance y de claims médicos. |

---

## 7. Tabla resumen

| Dimensión | Actual | Objetivo | Esfuerzo para cerrar |
|---|:-:|:-:|:-:|
| D1 Servicios cloud | 3 | 4 | Alto |
| D2 Seguridad y acceso | 3 | 4 | Medio |
| D3 Diseño web | 3 | 4 | Medio (dark mode + tokens restantes + ErrorBoundary) |
| D4 Arquitectura | 4 | 4 | Bajo (ADR de persistencia vigente) |
| D5 Operaciones | 2 | 3 | Medio |
| D6 Escala | 3 | 4 | Alto (depende de acción 4) |
| D7 Evidencia pública | 2 | 4 | Bajo |
| **Total** | **20** | **27** | |

### Criterios de corporativos / Cloud Partner (resumen)

- **Well-Architected:** seguridad parcial (rules sin probar), excelencia operacional baja, costo favorable (serverless, escala a cero).
- **ISV Readiness:** multi-tenant en diseño; onboarding manual por script; sin SLA ni docs para integradores.
- **SOC 2 surface:** audit append-only a nivel de rules (correcto en diseño); sin logs inmutables exportados ni revisión de acceso.
- **DX:** tests automatizados y docs sólidos; el setup desde cero requiere secretos Firebase no documentados en un solo paso (verificar `CONTRIBUTING.md` contra la meta de <30 min).

---

## Límites de este benchmark

- No se ejecutó el emulador ni se consultó Firebase Console; las conclusiones de D1/D2 parten de lectura del código.
- La hipótesis de la brecha 1 debe confirmarse con la acción 1 antes de comunicarse externamente.
- Las puntuaciones son juicio del tribunal con evidencia citada, no una métrica estandarizada.

> **Corrección (2026-10-16, B-02):** HSTS **sí** estaba activo: Firebase Hosting sirve `Strict-Transport-Security: max-age=31556926; includeSubDomains; preload`. La brecha real era la ausencia de CSP, añadida en modo Report-Only en B-02.
