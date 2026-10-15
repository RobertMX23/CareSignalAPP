# Contrato de acciones — cierre de brechas del benchmark (Track E7)

> Origen: `docs/18-benchmark-ingenieria.md` (20/35, objetivo 27/35).
> Naturaleza: trabajo de ingeniería/infra. **No modifica el contrato congelado v0.1.0** ni agrega funcionalidad de producto.
> Regla heredada del track E: **una acción a la vez, cada una cierra con aprobación humana (gate).**
> Estado de este documento: vivo. Actualizar la columna *Estado* al cerrar cada gate y registrar en `CHANGELOG.md`.

---

## 1. Tablero de seguimiento

| ID | Acción | Dimensión | Puntos esperados | Esfuerzo | Depende de | Gate (criterio de cierre verificable) | Estado |
|---|---|---|---|---|---|---|---|
| **B-01** | Corregir paths de Firestore Rules + tests de rules en CI | D2, D1 | +1 / +0.5 | Medio | — | Job CI "Firestore rules tests" en verde; test que antes fallaba (acceso legítimo) ahora pasa; test cross-tenant denegado | ⏳ Pendiente (siguiente) |
| **B-02** | Resolver discrepancia CSP/HSTS (añadir headers o corregir CHANGELOG) | D2, D7 | +0.5 | Bajo | — | `curl -I` a la URL de Hosting muestra los headers; CHANGELOG coherente con `firebase.json` | ⏳ Pendiente |
| **B-03** | Evidencia pública: badges CI, diagrama de arquitectura, Lighthouse publicado | D7 | +1.5 | Bajo | B-01 (para badge verde de rules) | README con badges; reporte Lighthouse con URL; acceso de lectura para evaluadores (decisión humana sobre visibilidad del repo) | ⏳ Pendiente |
| **B-04** | Flujo vertical real: IAM Functions → `setUserClaims` desplegada → una escritura vía Firestore/Cloud Run → fila en `audit` | D1, D6 | +1 / +1 | Alto | B-01, ADR de persistencia vigente | Log de Cloud Logging con `claims inyectados`; doc en `audit` con `staffId` del token; e2e contra emulador | ⏳ Pendiente |
| **B-05** | Señal operativa: `ErrorBoundary` + monitoreo (Performance/Sentry) + alerta de uptime | D5, D3 | +1 | Bajo–Medio | — | Alerta configurada (captura de política); error de prueba visible en el panel | ⏳ Pendiente |
| **B-06** | Capa de acceso (conmutador `guest` / `hybrid` / `google`) + selector de perfil como entrada | D3, D2, D7 | +0.5 / +0.5 / +0.5 | Medio | — (precede a B-08) | Con `VITE_ACCESS_MODE=google` el comportamiento es idéntico al actual; en `guest` un usuario sin cuenta llega al dashboard en ≤ 2 clics; e2e en modo `guest` en verde | ⏳ Pendiente |
| **B-07** | Entornos y ramas: sites QA y demo en Hosting, deploy por rama, `VITE_ACCESS_MODE` por rama, deploy encadenado a CI verde | D5, D7, D1 | +0.5 / +0.5 / +0.5 | Medio | B-06 | URL de QA (`hybrid`) y de demo (`guest`) distintas de producción; PR genera preview; push a `master` ya no despliega a producción | ⏳ Pendiente |
| **B-08** | Tour guiado por rol (capa L-05 de `docs/13-capas-demo.md`) | D3, D7 | +0.5 / +0.5 | Medio | B-06 | Los 9 criterios L05-01…L05-09 verificados; un tour por rol de ≤ 3 min | ⏳ Pendiente |

**Orden recomendado:** B-01 → B-02 → B-05 → B-06 → B-08 → B-07 → B-03 → B-04.
B-01 y B-02 cierran credibilidad técnica; B-06 y B-08 hacen el demo presentable a jurados; B-07 protege producción; B-04 es el de mayor esfuerzo y necesita B-01 resuelto.

### Entornos objetivo (decisión 2026-10-15)

| Entorno | Rama / evento | Destino | `VITE_ACCESS_MODE` | Datos |
|---|---|---|---|---|
| Producción (beta) | `production` (promoción manual) | Site actual `caresignal-mvp-2026` | `google` | Firestore real (tras B-04) |
| Demo QA (quality gate) | `master` | Site `…-qa` | `hybrid` | Ficticios |
| Demo público (jurados) | `demo` (promoción manual, congelada) | Site `…-demo` | `guest` | Ficticios, `localStorage` |
| Preview de PR | `feature/*` → PR | Preview channel efímero | `guest` | Ficticios |

Promoción en un solo sentido: `master` → `demo` → `production`.

### Detalle de B-06, B-07, B-08

**B-06 — Capa de acceso**
- Crear `src/access/{accessMode,GuestAuthProvider,AccessProvider}.ts(x)` y `src/data/guestSession.ts`; reemplazar `<AuthProvider>` por `<AccessProvider>` en `src/App.tsx`.
- El proveedor invitado entrega el **mismo contrato** que `AuthContext` (`user`, `signIn`, `signOut`, `loading`, `error`); al elegir perfil fija también `activeStaffId` del `DemoSessionContext`.
- Paso final, separado y posterior: eliminar el fallback `role: 'demo_admin'` de `AuthContext.tsx` en modos con Google (usuario sin claims → pantalla "sin acceso").
- Sin tocar: `RoleGuard`, `NAV_ITEMS`, páginas, dominio, backend.
- Fuera de alcance: unificar identidad token/demo (`useIdentity`), queda como fase 2 junto con B-04.

**B-07 — Entornos y ramas**
- Decisión previa humana: visibilidad del repo (afecta protección de ramas y environments).
- Encadenar deploy a CI verde (`workflow_run` o `needs`); mover el deploy `live` de `master` a `production`.
- Cada dominio nuevo debe agregarse en **Firebase Auth y en el cliente OAuth de GCP**.
- Aprobación humana explícita para cualquier cambio que afecte a producción.

**B-08 — Tour guiado**
- Ver ficha L-05 en `docs/13-capas-demo.md`. Decisión humana pendiente: componente propio vs librería ligera (empate práctico 3.55 / 3.65).
- Guion de cada rol: contenido de producto, lo valida el humano.

### Gobierno adicional

- Mover el deploy de producción (B-07) es el cambio de mayor riesgo del track: no se ejecuta sin confirmación explícita y en el momento.
- El demo público se congela mientras dure la evaluación de jurados; los cambios van a `master` y se promueven después.

### Reglas de gobierno del track

1. Ninguna acción se inicia sin aprobación humana explícita del gate anterior.
2. Cambios a producción (desplegar rules, funciones, re-provisionar datos) requieren confirmación humana por separado, en el momento.
3. Nunca `--admin`, `--force` ni `--no-verify` sin la frase exacta acordada (ver memoria `feedback-admin-override-approval`).
4. No instalar browsers ni artefactos pesados localmente: validar en CI (ver `feedback-playwright-install-ci`).
5. Toda cifra o afirmación pública (score, "RBAC server-side") debe tener un enlace a evidencia verificable.
6. Registrar cada cierre en `CHANGELOG.md` y actualizar `docs/RESUME.md`.

---

## 2. Hallazgo reforzado para B-01 (evidencia nueva)

Al revisar el provisionamiento y el backend se confirma el desajuste, con más precisión que en el benchmark:

| Componente | Path real que escribe/lee | Archivo |
|---|---|---|
| Provisioning (residentes/rondas/etc.) | `{coleccion}/{residenciaId}/{coleccion}/{id}` (4 segmentos) | `scripts/provision-firestore.ts:49` |
| Provisioning de staff | `staff/{residenciaId}/staff/{id}` | `scripts/provision-firestore.ts:142` |
| Backend Express | `rounds/{rid}/rounds/{id}`, `alerts/{rid}/alerts/{id}`, `audit/{rid}/audit/{id}` | `backend/src/routes/*.ts` |
| **Rules** | `match /rounds/{residenciaId}/{roundId}` (3 segmentos) | `firestore.rules` |

Los datos viven en 4 segmentos y las rules describen 3: **no casan**. Efecto actual: cualquier acceso directo de cliente cae en el catch-all `deny`. Es *fail-safe* (no hay exposición), pero la afirmación "RBAC en Firestore Rules" hoy no es demostrable. El backend sí aplica `requireRole` con JWT usando Admin SDK (que **ignora** las rules), por lo que la autorización real vigente está en Cloud Run, no en las rules.

Pendiente de confirmar con test rojo (primer paso de B-01) — no se da por probado hasta entonces.

---

## 3. Análisis para B-01: capacidades, necesidades y fricción humana

### 3.1 Capacidades requeridas

| Capacidad | Disponible | Nota |
|---|---|---|
| Leer/editar `firestore.rules`, tests, CI | ✅ Agente | Dentro del repo |
| Node 24 + npm | ✅ | `node -v` → v24.16.0 |
| `@firebase/rules-unit-testing` + `firebase-tools` | ⚠️ Agregar como devDependency | Dependencia de test, justificada; es nueva |
| **Java (JDK 11+) para emulador de Firestore** | ❌ **No instalado localmente** (`java: command not found`) | Principal fuente de fricción |
| Ejecutar emulador en CI | ✅ `ubuntu-22.04` trae Java | Alineado con regla "validar en CI" |
| Desplegar rules a producción | ⚠️ Solo con aprobación humana | Acción hacia afuera, difícil de revertir en la práctica |
| Re-provisionar datos en producción | ⚠️ Solo con aprobación humana (solo Opción 2) | Datos de demo, pero sigue siendo escritura en prod |

### 3.2 Necesidades del humano en el circuito (human-in-the-loop)

| Punto | Qué decide el humano | Opción 1 | Opción 2 |
|---|---|---|---|
| H1 | Aprobar el plan y la opción de paths | ✅ | ✅ |
| H2 | Aprobar agregar devDependencies | ✅ | ✅ |
| H3 | Instalar JDK local (o aceptar validar solo en CI) | ✅ decisión | ✅ decisión |
| H4 | Revisar/aprobar PR (branch protection bloqueada en Free plan) | ✅ | ✅ |
| H5 | Autorizar `firebase deploy --only firestore` a producción | ✅ | ✅ |
| H6 | Autorizar re-provisionado/migración de datos en prod | — | ✅ |
| H7 | Aprobar cambio en backend en producción (Cloud Run redeploy) | — | ✅ |
| **Total de puntos de decisión** | | **5** | **7** |

### 3.3 ¿Se puede automatizar y dónde hay fricción?

- **Se puede sin intervención:** escribir tests, ajustar rules, correr el job en CI y leer el resultado.
- **Fricción real #1 — JDK local:** sin Java no hay emulador local. Mitigación: ciclo rojo/verde vía CI (más lento: ~3–5 min por iteración) o instalar JDK (decisión humana; descarga requiere permiso).
- **Fricción real #2 — despliegue a producción:** siempre humano. No automatizable por política.
- **Fricción real #3 — Opción 2 toca backend + datos + deploy:** más puntos de aprobación y riesgo de ventana inconsistente entre rules, backend y datos.
- **Sin fricción de contrato:** no cambia taxonomía, roles, estados ni transiciones del contrato congelado.

---

## 4. Opción 1 vs Opción 2

### Opción 1 — Alinear las rules con los paths existentes (cambio mínimo)

`match /rounds/{residenciaId}/rounds/{roundId}` (y equivalentes). No se mueven datos ni se toca backend.

- **Archivos:** `firestore.rules`, `tests/rules/*.test.ts` (nuevo), `package.json`, `.github/workflows/ci.yml`.
- **Contras:** nombres redundantes (`rounds/{rid}/rounds/{id}`), el documento intermedio `{rid}` nunca existe como documento real (solo como ancestro implícito); menos idiomático para auditores cloud; `collectionGroup` requeriría reglas con `{path=**}`.
- **Estimado:** 4–6 h.

### Opción 2 — Migrar a la estructura canónica `residencias/{rid}/{coleccion}/{id}`

Rules claras (`match /residencias/{rid}/rounds/{id}`), colección raíz de tenants, `collectionGroup` natural.

- **Archivos:** además de los de Opción 1: `scripts/provision-firestore.ts`, `backend/src/routes/{rounds,alerts,audit}.ts`, `functions/src/auth/setUserClaims.ts`, `firestore.indexes.json`, posiblemente `src/data/firestoreRepository.ts`, y re-provisionado de datos en producción.
- **Pros:** modelo estándar multi-tenant, mejor lectura para evaluadores (D6, D1), rules más simples de razonar.
- **Contras:** más superficie de cambio, ventana de inconsistencia, más aprobaciones humanas.
- **Estimado:** 14–20 h.

### Cálculo comparativo

Escala 1–5 (5 = mejor). Pesos definidos por el objetivo del benchmark: menor riesgo y mayor valor verificable.

| Criterio | Peso | Opción 1 | Opción 2 |
|---|:-:|:-:|:-:|
| Riesgo de regresión (menor = mejor puntaje) | 25 % | 5 | 2 |
| Esfuerzo / tiempo | 20 % | 5 | 2 |
| Fricción humana (puntos H) | 15 % | 4 | 2 |
| Calidad arquitectónica / impacto en benchmark | 25 % | 3 | 5 |
| Verificabilidad por un tercero | 15 % | 4 | 4 |
| **Total ponderado** | 100 % | **4.20** | **3.05** |

Cálculo O1: 0.25×5 + 0.20×5 + 0.15×4 + 0.25×3 + 0.15×4 = 1.25 + 1.00 + 0.60 + 0.75 + 0.60 = **4.20**
Cálculo O2: 0.25×2 + 0.20×2 + 0.15×2 + 0.25×5 + 0.15×4 = 0.50 + 0.40 + 0.30 + 1.25 + 0.60 = **3.05**

### Recomendación

**Opción 1 ahora**, con los tests escritos contra una constante de path, de modo que la migración a Opción 2 sea un cambio localizado. Registrar la Opción 2 como ADR y en backlog, para evaluarla dentro de B-04 cuando se conecte el flujo vertical real y haya que tocar backend de todos modos. Esto cierra la brecha (credibilidad de rules) con el mínimo de aprobaciones y sin riesgo de datos.

> Los pesos y estimaciones son juicio razonado, no mediciones. Si el humano pondera distinto (p. ej. D6 sobre esfuerzo), el resultado puede invertirse; ajustar la tabla y recalcular.

---

## 5. Prompt de ejecución — B-01 (Opción 1)

### Role
Eres un ingeniero senior de seguridad en Firebase/Firestore especializado en Security Rules y pruebas con el emulador, trabajando bajo el protocolo estricto y con gates del repositorio CareSignal.

### Contexto
- CareSignal es una SPA React + TypeScript sobre Firebase (proyecto `caresignal-mvp-2026`). MVP operacional ficticio, no dispositivo médico.
- El contrato v0.1.0 está congelado; esta tarea es infra del track E, no producto.
- Hallazgo: los datos se escriben en `{coleccion}/{residenciaId}/{coleccion}/{id}` (4 segmentos; ver `scripts/provision-firestore.ts:49,142` y `backend/src/routes/*.ts`), pero `firestore.rules` usa `match /{coleccion}/{residenciaId}/{id}` (3 segmentos). Las rules compilan pero no casan con ningún documento real y todo cae en el catch-all `deny`.
- El backend Express usa Admin SDK (ignora rules) y aplica `requireRole`. Las rules protegen el acceso directo de cliente.
- Claims JWT: `role` ∈ {caregiver, supervisor, demo_admin}, `residenciaId`, `staffId`.
- No hay Java local; el emulador de Firestore se validará en CI (`ubuntu-22.04`).

### Instrucciones
1. **Antes de editar**, lee: `firestore.rules`, `scripts/provision-firestore.ts`, `backend/src/routes/*.ts`, `firestore.indexes.json`, `.github/workflows/ci.yml`, `docs/12-ai-agent-rules.md`, `package.json`. No infieras nombres: cítalos.
2. Presenta un plan corto (archivos afectados, devDependencies a agregar) y **espera aprobación** antes de modificar.
3. Escribe primero los tests (rojo): `tests/rules/firestore.rules.test.ts` con `@firebase/rules-unit-testing`, usando una constante única para la forma del path. Con las rules actuales, los casos legítimos deben fallar — esa es la confirmación de la hipótesis.
4. Corrige `firestore.rules` para que cada `match` tenga la forma `/{coleccion}/{residenciaId}/{coleccion}/{id}`, manteniendo helpers, catch-all y la semántica de roles existente.
5. Casos mínimos de prueba (roles y IDs solo de `src/data/seed.ts` / provisioning):
   - supervisor del tenant A lee y escribe `rounds` de A → permitido.
   - cualquier usuario del tenant A lee `rounds` del tenant B → denegado.
   - caregiver actualiza ronda asignada a su `staffId` → permitido; ajena → denegado.
   - caregiver crea alerta → denegado; supervisor → permitido.
   - `audit`: create permitido a caregiver; update y delete denegados a todos.
   - `rounds` delete denegado a todos.
   - sin autenticación → denegado en todo.
   - colección no listada → denegado.
6. Agrega un job en `ci.yml` que levante el emulador de Firestore y ejecute estos tests; no instales browsers ni mezcles con los jobs de Playwright.
7. No toques backend, datos, ni dominio. No ejecutes `firebase deploy`.
8. Actualiza `CHANGELOG.md` (sección Unreleased) y la tabla de `docs/19-contrato-acciones-benchmark.md`.

### Objetivo
Demostrar, con pruebas automatizadas reproducibles en CI, que `firestore.rules` aplica aislamiento por `residenciaId` y RBAC sobre los paths reales de los datos.

### Alcance
- **Dentro:** `firestore.rules`, `tests/rules/**`, `package.json` (devDependencies de test), `.github/workflows/ci.yml`, `CHANGELOG.md`, este documento.
- **Fuera:** migración a `residencias/{rid}/…` (Opción 2), backend, `setUserClaims`, UI, contrato congelado, despliegue a producción, App Check, headers de Hosting.

### Resultado esperado
1. Reporte de confirmación: salida roja inicial con las rules originales (evidencia de la hipótesis) o, si no falla, explicación de por qué la hipótesis era incorrecta.
2. Rules corregidas y suite de tests en verde en CI (enlace a la ejecución).
3. Lista de archivos creados/modificados, resumen, cómo ejecutar los tests y limitaciones conocidas.
4. Propuesta (no ejecución) del comando de despliegue de rules, a la espera de autorización humana.
5. **Parar.** No avanzar a B-02 sin aprobación del gate.

### Criterio de aceptación del gate B-01
- [ ] Hipótesis confirmada o refutada con evidencia.
- [ ] ≥ 8 casos de prueba de rules en verde en CI.
- [ ] Caso cross-tenant denegado probado.
- [ ] Audit append-only probado.
- [ ] Sin cambios en backend, datos ni dominio.
- [ ] Nada desplegado sin autorización.
