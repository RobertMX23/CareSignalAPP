# Contrato de ramas y CI/CD — B-07a

> Track E7 · acción **B-07a** (primera mitad de B-07 en `docs/19-contrato-acciones-benchmark.md`).
> Decisión de modelo: **Opción 2 — tres ramas permanentes** (`master`, `demo`, `production`), 2026-10-15.
> Estado: `propuesta` — no ejecutada. Nada de este documento autoriza push, merge ni deploy por sí mismo.
> Alcance: estructura de ramas y workflows. **No** incluye `VITE_ACCESS_MODE` funcional (B-06), tour (B-08) ni Firestore rules (B-01).

---

## 1. Modelo objetivo

```
feature/* ─PR─► master ─promover (ff-only)─► demo ─promover (ff-only)─► production
                  │                           │                          │
              CI + preview               deploy DEMO PÚBLICO         deploy PRODUCCIÓN
              deploy QA                  (congelado)                 (beta, `live`)
```

| Rama | Existe | Rol | Escritura | Destino de deploy |
|---|---|---|---|---|
| `master` | ✅ | Tronco de integración y **Demo QA** | Solo por PR (squash) | Canal con nombre `qa` del site actual |
| `demo` | ❌ crear | **Demo público** para jurados, congelado | Solo fast-forward desde `master` | Site dedicado `caresignal-demo` (requiere creación humana) |
| `production` | ❌ crear | **Producción (beta)** | Solo fast-forward desde `demo` (o `master` si no hay demo vigente) | Canal `live` del site `caresignal-mvp-2026` |

Ramas efímeras permitidas: `feature/`, `fix/`, `chore/`, `docs/`, `hotfix/`. Vida objetivo ≤ 1 semana; máximo 4 abiertas.

---

## 2. Reglas del contrato

### 2.1 Reglas de ramas
1. Ningún commit se empuja directo a `master`, `demo` o `production`. Todo entra por PR a `master`.
2. `demo` y `production` **solo** avanzan por fast-forward. Si no es fast-forward, se detiene y se investiga: no se resuelve con merge ni con `--force`.
3. La promoción es en un solo sentido: `master → demo → production`.
4. Un `hotfix/*` nace de `production`, se corrige y se **re-integra a `master` el mismo día**. Después se promueve normalmente.
5. Squash merge en PR. El título del PR lleva el ID del contrato: `B-07a: …`, `B-06: …`.
6. Mensajes de commit en formato convencional ya vigente (`feat:`, `fix:`, `docs:`, `chore:`, `ci:`).

### 2.2 Reglas de CI/CD
7. Un deploy nunca corre sin que CI esté verde sobre el mismo commit.
8. Cada entorno usa su propio `concurrency` group; nunca dos deploys simultáneos al mismo destino.
9. Un workflow nuevo que reemplaza a uno viejo elimina al viejo **en el mismo commit** (regla 10 de `CLAUDE.md`).
10. Secrets: solo por `secrets.*`; nunca impresos en logs ni escritos en archivos.
11. Cada job que usa un navegador instala solo ese navegador (reglas 8–9 de `CLAUDE.md`).
12. Cualquier cambio a workflows de `demo` o `production` requiere revisión humana antes de mergear.

### 2.3 Boundaries — el agente PUEDE
- Leer el repo y los workflows existentes.
- Crear una rama `ci/b07a-branches-cicd`, editar `.github/workflows/*`, `docs/20-*`, `CONTRIBUTING.md`, `CHANGELOG.md`.
- Abrir un PR **sin mergear**.
- Validar sintaxis de workflows localmente y vía CI.
- Proponer (no ejecutar) comandos de creación de ramas y de site.

### 2.4 Boundaries — el agente NO PUEDE (requiere frase de aprobación humana en el momento)
- Crear o empujar las ramas `demo` / `production` en el remoto.
- Mergear el PR, cambiar a qué rama despliega producción, o ejecutar cualquier deploy.
- Borrar ramas, usar `--force`, `--admin`, `--no-verify`.
- Crear sites de Firebase, tocar IAM, secrets o dominios autorizados.
- Modificar `src/**`, `firestore.rules`, `functions/**`, `backend/**` o el contrato congelado.
- Instalar dependencias nuevas.

### 2.5 Rollback
| Situación | Acción | Quién |
|---|---|---|
| Deploy a `production` defectuoso | Revertir en `production` con PR de revert o restaurar versión anterior en la consola de Hosting | Humano |
| Workflow roto | Revertir el PR de B-07a; `firebase-deploy.yml` original se restaura desde git | Humano |
| `demo` promovido por error | Reapuntar `demo` al commit anterior (acción humana, documentada en el PR) | Humano |

---

## 3. Prompt de ejecución — B-07a

### Role
Eres un ingeniero DevOps senior especializado en GitHub Actions y Firebase Hosting, trabajando para un equipo de 1–3 personas bajo un protocolo estricto con gates humanos. Priorizas reversibilidad, claridad y mínimo cambio sobre sofisticación.

### Contexto
- Repo `RobertMX23/CareSignalAPP`, privado, plan Free (sin branch protection ni environments con aprobación).
- Hoy: `.github/workflows/firebase-deploy.yml` se dispara en **push a `master`** y despliega a `channelId: live` del proyecto `caresignal-mvp-2026`, con tres jobs (Hosting, Firestore rules/indexes, Cloud Functions; este último con IAM pendiente). `ci.yml` corre en push y PR a `master`.
- Solo existe la rama permanente `master` (más 9 ramas efímeras antiguas).
- Consecuencia actual: cada merge a `master` va directo a producción.
- El contrato congelado v0.1.0 y el dominio no se tocan; esta tarea es infraestructura del track E.
- Modos de acceso (`VITE_ACCESS_MODE`) aún no existen en el código (B-06): cualquier valor declarado no se consume todavía.

### Responsabilidades
| Quién | Responsable de |
|---|---|
| Agente | Redactar workflows, documentación, PR, plan de pruebas y reporte de resultados |
| Humano | Aprobar el plan, crear las ramas remotas, crear el site `caresignal-demo`, mergear, autorizar cualquier deploy |

### Instrucciones
1. **Inspeccionar**, sin editar: `.github/workflows/ci.yml`, `.github/workflows/firebase-deploy.yml`, `firebase.json`, `.firebaserc`, `CONTRIBUTING.md`, `docs/12-ai-agent-rules.md`, `docs/19-contrato-acciones-benchmark.md`. Citar archivo y línea de lo que se afirma.
2. **Presentar plan corto** (archivos a crear/modificar/eliminar, orden de los commits, riesgos) y **esperar aprobación** antes de editar.
3. Trabajar en rama `ci/b07a-branches-cicd`. Nunca en `master`.
4. Implementar, en commits separados y pequeños:
   - a. `ci.yml`: añadir `demo` y `production` a los triggers de push, manteniendo PR a `master`.
   - b. Nuevo workflow de **QA**: push a `master` → build + deploy al canal con nombre `qa` (URL de revisión; expira y se renueva en cada deploy).
   - c. Nuevo workflow de **demo**: push a `demo` → build + deploy al site `caresignal-demo`. Debe quedar **deshabilitado por condición** (variable de repositorio `DEMO_SITE_ENABLED == 'true'`) hasta que el humano cree el site.
   - d. Workflow de **producción**: renombrar/convertir `firebase-deploy.yml` para que dispare en push a `production` (y `workflow_dispatch`). Mantener los tres jobs tal como están; no corregir IAM aquí.
   - e. Encadenar cada deploy a CI verde sobre el mismo SHA (`workflow_run` o reutilizando el workflow de CI como `needs`).
   - f. `concurrency` por entorno y `permissions` mínimos en todos los workflows.
   - g. `CONTRIBUTING.md`: flujo de ramas, promoción, hotfix y rollback (sección corta, enlazando a este documento).
   - h. `CHANGELOG.md` (Unreleased) y estado en `docs/19-contrato-acciones-benchmark.md`.
5. **Eliminar** el workflow viejo en el mismo commit que lo reemplaza (regla 10).
6. Validar sintaxis (p. ej. `actionlint` en CI o localmente si está disponible; no instalar herramientas pesadas sin pedirlo).
7. Abrir **PR sin mergear**, con descripción que incluya: qué cambia, qué no, orden de activación seguro y plan de rollback.
8. **Detenerse.** No crear ramas remotas, no mergear, no desplegar.

### Orden de activación seguro (lo ejecuta el humano, tras aprobar el PR)
| Paso | Acción | Verificación |
|---|---|---|
| 1 | Crear `production` y `demo` apuntando al HEAD actual de `master` | `git ls-remote` muestra el mismo SHA en las tres |
| 2 | Mergear el PR de B-07a a `master` | El push a `master` **ya no** despliega a `live`; despliega al canal `qa` |
| 3 | Promover `master → demo → production` por fast-forward (primer ciclo de prueba) | Runs verdes y `live` actualizado solo desde `production` |
| 4 | Crear el site `caresignal-demo`, activar `DEMO_SITE_ENABLED` | URL de demo responde |
| 5 | Agregar el dominio del site demo a **Firebase Auth y a OAuth de GCP** (solo si usará Google) | Sin `auth/unauthorized-domain` |

> Entre el paso 2 y el 3 `live` queda en el último build; es intencional y debe comunicarse.

### Artefactos esperados
```
.github/workflows/ci.yml                 — modificado (triggers)
.github/workflows/deploy-qa.yml          — nuevo
.github/workflows/deploy-demo.yml        — nuevo (condicionado)
.github/workflows/deploy-production.yml  — reemplaza firebase-deploy.yml (eliminado)
CONTRIBUTING.md                          — sección "Flujo de ramas"
CHANGELOG.md                             — entrada Unreleased
docs/20-contrato-ramas-cicd.md           — este documento (estado y resultados)
docs/19-contrato-acciones-benchmark.md   — estado de B-07a
```

### Referencias
- `CLAUDE.md` — reglas de CI (8–10) y jerarquía de autoridad.
- `docs/12-ai-agent-rules.md` — reglas de testing y CI para agentes.
- `docs/13-capas-demo.md` — proceso de entrega (rama → PR → revisión → merge).
- `docs/19-contrato-acciones-benchmark.md` — B-06, B-07, B-08 y entornos objetivo.
- Memorias del proyecto: no `--admin` sin frase exacta; no instalar browsers localmente; dominios en dos capas.

### Resultado esperado
1. PR abierto (sin mergear) con los artefactos anteriores.
2. Reporte con: archivos creados/modificados/eliminados, resumen, cómo probar, limitaciones y riesgos.
3. Matriz de disparadores verificable (sección 4).
4. Lista de pasos humanos pendientes con su comando propuesto (no ejecutado).

---

## 4. Plan de pruebas

Las pruebas de workflows se hacen **sin tocar producción**. Hasta el paso 3 del orden de activación no hay despliegue a `live`.

| ID | Prueba | Cómo | Resultado esperado |
|---|---|---|---|
| T1 | Sintaxis de workflows | `actionlint` / CI | Sin errores |
| T2 | Push a `feature/*` | Rama de prueba | CI no despliega nada |
| T3 | PR a `master` | PR de prueba | CI completo + preview; sin deploy a `live` |
| T4 | Push a `master` (tras merge) | Observar run | Deploy solo a canal `qa`; `live` intacto |
| T5 | Push a `demo` | Fast-forward de prueba | Deploy a site demo (si habilitado) o job omitido |
| T6 | Push a `production` | Fast-forward de prueba | Deploy a `live`, tres jobs en el estado previo |
| T7 | CI rojo | Commit con test roto en rama de prueba | Ningún deploy corre |
| T8 | Fast-forward violado | Intento de no-ff | Se detiene; no se fuerza |
| T9 | Concurrencia | Dos pushes seguidos | El segundo espera o cancela al anterior |
| T10 | Rollback | Revert del PR en rama de prueba | `firebase-deploy.yml` original recuperable |

---

## 5. Resultados obtenidos

> Se completa al ejecutar. Estado inicial: ninguna prueba ejecutada.

| ID | Estado | Evidencia (URL del run / SHA) | Fecha | Notas |
|---|---|---|---|---|
| T1 | ☐ pendiente | — | — | — |
| T2 | ☐ pendiente | — | — | — |
| T3 | ☐ pendiente | — | — | — |
| T4 | ☐ pendiente | — | — | — |
| T5 | ☐ pendiente | — | — | — |
| T6 | ☐ pendiente | — | — | — |
| T7 | ☐ pendiente | — | — | — |
| T8 | ☐ pendiente | — | — | — |
| T9 | ☐ pendiente | — | — | — |
| T10 | ☐ pendiente | — | — | — |

### Criterios del gate B-07a
- [ ] `master`, `demo` y `production` existen y apuntan al mismo SHA inicial.
- [ ] Push a `master` ya no despliega a `live` (T4).
- [ ] Deploy a producción solo desde `production` y solo con CI verde (T6, T7).
- [ ] `firebase-deploy.yml` eliminado en el mismo commit que su reemplazo.
- [ ] Flujo y rollback documentados en `CONTRIBUTING.md`.
- [ ] Ningún archivo de `src/`, `functions/`, `backend/` ni `firestore.rules` modificado.
- [ ] Sin secretos en logs ni en el repo.

---

## 6. Siguientes pasos

| Orden | Paso | Depende de |
|---|---|---|
| 1 | Aprobar plan y ejecutar B-07a (este documento) | Decisiones humanas de la sección 3 |
| 2 | **Limpieza de ramas obsoletas**: listar las 9 ramas efímeras, verificar mergeadas, borrar con aprobación | B-07a cerrado |
| 3 | **B-01**: corregir paths de rules + tests de rules como job de CI | — (puede ir en paralelo a 2) |
| 4 | **B-06**: capa de acceso; en este punto `VITE_ACCESS_MODE` por rama pasa a ser funcional (`master`=hybrid, `demo`=guest, `production`=google) | B-07a |
| 5 | **B-08 / L-05**: tour guiado | B-06 |
| 6 | **B-07b**: fijar `VITE_ACCESS_MODE` por rama en los workflows, dominios en Auth + OAuth, congelar `demo` para jurados | B-06, B-08 |
| 7 | **B-05, B-02, B-03, B-04** según `docs/19` | — |

### Decisiones humanas abiertas
1. ¿Se crea el site `caresignal-demo` ahora o el demo público vive temporalmente en un canal con nombre?
2. ¿Visibilidad del repo (afecta protección de ramas)?
3. ¿Frase de aprobación para crear ramas remotas y para mergear el PR?
