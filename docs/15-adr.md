# Architecture Decision Records — CareSignal

> Decisiones de arquitectura para el track de producción (E6).
> Cada ADR sigue el formato MADR ligero: contexto · opciones evaluadas · decisión · consecuencias.
> Autoridad: por debajo del contrato congelado; una ADR no modifica el MVP existente.
> Estado posible: `Propuesto` | `Aceptado` | `Obsoleto` | `Reemplazado por ADR-XXX`.

---

## ADR-001 — Estrategia de autenticación

**Estado:** Propuesto  
**Fecha:** 2026-10-04  
**Relacionado con:** E1.3 (equipo), docs/05-known-limitations.md §auth

### Contexto

El MVP v0.1.0 no tiene autenticación real — el rol se selecciona en la UI de demo.
En producción, la aplicación maneja datos operativos de residentes de adultos mayores
con implicaciones de privacidad (NOM-024-SSA3, LFPDPPP en México). Se requiere:

- Identidad verificada por usuario/contraseña + posiblemente SSO institucional
- Aislamiento multi-tenant: un staff de residencia A no puede ver datos de residencia B
- El campo `residenciaId` ya existe en todas las entidades (v0.2.0) — el auth debe
  entregar ese ID al cliente tras login para que el repositorio filtre correctamente
- Auditoría: `AuditEvent.actorId` debe ser el UID del usuario autenticado, no un string libre

### Opciones evaluadas

| Opción | Pro | Contra |
|--------|-----|--------|
| **Firebase Auth** | GCP nativo; integra con Firestore security rules; email/pass + Google SSO; HIPAA-eligible; gratis hasta 10K MAU | Vendor lock-in Google; UI de login propia o FirebaseUI |
| **Auth0** | UI y flows customizables; SAML/LDAP enterprise; dashboard rico | $23+/mes tras plan gratuito (7 500 MAU); vendor externo al stack GCP |
| **JWT propio (Cloud Run)** | Control total; sin vendor | Mantenimiento de rotación de claves, refresh tokens, revocación; duplica trabajo |
| **Google Identity Platform** (Firebase Auth avanzado) | MFA, SAML, OIDC; misma SDK que Firebase Auth | Costo por MAU adicional sobre Firebase Auth |

### Decisión

**Firebase Auth** (tier gratuito para el lanzamiento MVP → producción).

Razones determinantes:
1. E1.1 ya decidió el stack GCP (Cloud Run + Firestore + BigQuery) — Firebase Auth es el
   complemento natural sin añadir un vendor externo.
2. Las Firestore Security Rules pueden usar `request.auth.uid` directamente, eliminando
   validación de autorización en el backend.
3. El `uid` de Firebase Auth se usará como `AuditEvent.actorId`, cerrando la brecha de
   trazabilidad que el MVP deja abierta.
4. El campo `residenciaId` se almacenará en Firebase Auth custom claims tras login para
   que el cliente lo inyecte en cada query de Firestore.

### Consecuencias

**Positivas:**
- Un solo `initializeApp()` para auth + Firestore + funciones Cloud.
- Refresh tokens manejados automáticamente por el SDK.
- Email verification y reset de contraseña out-of-the-box.

**Negativas / mitigaciones:**
- Lock-in Google: mitigado definiendo una interfaz `AuthProvider` en `src/domain/` que
  el código de UI nunca importa directamente (abstrae el SDK de Firebase).
- La UI de login actual es una demo; habrá que construir una página real
  `/login` con el formulario email/contraseña.

---

## ADR-002 — Estrategia de persistencia

**Estado:** Propuesto  
**Fecha:** 2026-10-04  
**Relacionado con:** E1.1 (stack GCP), ADR-001, docs/03-data-model.md

### Contexto

El MVP usa `localStorage` como capa de persistencia de demo (contrato §9 — prohibido
acceso directo desde UI; solo a través del repositorio). En producción:

- Los datos operativos (residentes, rondas, alertas, incidentes) requieren actualizaciones
  en tiempo real: el dashboard del supervisor debe reflejar alertas nuevas sin polling.
- El log de `AuditEvent` es append-only, de alto volumen y se consulta para reportes
  históricos — patrón distinto al dato operativo.
- `residenciaId` en todas las entidades habilita un patrón de colección por tenant en
  cualquier base de datos documental.

### Opciones evaluadas

| Opción | Pro | Contra |
|--------|-----|--------|
| **Firestore** | Real-time listeners (onSnapshot); GCP nativo; security rules integradas con Firebase Auth; esquema flexible | Consultas relacionales limitadas; precio por lectura/escritura; sin JOINs |
| **Cloud SQL – PostgreSQL** | SQL completo; transacciones ACID; JOINs complejos | Sin listeners en tiempo real (requiere polling o WebSockets propios); más infraestructura |
| **Híbrido Firestore + BigQuery** | Firestore para operacional + BigQuery para analítica y auditoría | Dos sistemas a mantener; latencia BigQuery (segundos) no sirve para real-time |

### Decisión

**Firestore** (datos operativos) + **BigQuery** (audit log y analítica).

Separación por patrón de acceso:

| Colección / Dataset | Sistema | Justificación |
|---------------------|---------|--------------|
| `residencias/{id}/residents` | Firestore | Lectura frecuente, cambios de estado real-time |
| `residencias/{id}/rounds` | Firestore | onSnapshot para dashboard de supervisor |
| `residencias/{id}/alerts` | Firestore | Listeners de alerta activa para UI |
| `residencias/{id}/incidents` | Firestore | Ciclo de vida vinculado a alerts |
| `audit_events` | BigQuery (streaming insert) | Append-only, alto volumen, consultas OLAP |

### Consecuencias

**Positivas:**
- El patrón `repository.ts` existente mapea limpiamente a Firestore SDK:
  `getDoc` → `get()`, `setDoc` → `set()`, `onSnapshot` para real-time.
- La regla de negocio §6.9 ("UI no toca localStorage") se convierte en
  "UI no toca Firestore directamente" — misma abstracción.
- BigQuery recibe AuditEvents via Pub/Sub → BigQuery subscription (sin modificar
  el dominio — solo el repositorio emite el evento adicional).

**Negativas / mitigaciones:**
- Sin transacciones entre colecciones distintas (e.g., cerrar alerta y crear incidente
  en una sola operación): mitigado con Firestore batched writes dentro de la misma
  residencia.
- Consultas de analítica complejas no son posibles en Firestore: son el caso de uso
  de BigQuery (reportes semanales, KPIs de E5 L-02).

---

## ADR-003 — Hosting y configuración de Cloud Run

**Estado:** Propuesto  
**Fecha:** 2026-10-04  
**Relacionado con:** E1.1, ADR-001, ADR-002

### Contexto

E1.1 seleccionó Google Cloud Run como plataforma de hosting. Esta ADR especifica la
configuración de servicio para el lanzamiento de producción, de manera que el equipo
de desarrollo (actualmente Roberto García) pueda ejecutar el primer despliegue sin
decisiones adicionales.

### Opciones evaluadas (para configuración, no para plataforma)

| Parámetro | Opción A | Opción B | Opción C |
|-----------|----------|----------|----------|
| Min instances | 0 (serverless puro) | **1** | 3 |
| Región | **us-central1** | us-east1 | northamerica-northeast1 |
| Concurrencia | **80** | 1 (un req/instancia) | 1000 |
| Memoria | **512 MiB** | 256 MiB | 1 GiB |

### Decisión

Configuración de servicio `caresignal-app`:

```
Nombre de servicio:  caresignal-app
Región:              us-central1   (latencia ~20 ms desde CDMX)
Min instances:       1             (evita cold start en demos en vivo)
Max instances:       10            (techo inicial; ajustable sin redeploy)
Concurrencia:        80            (Node.js async — seguro por defecto)
Memoria:             512 MiB       (React bundle + SSR o static serving)
CPU:                 1 vCPU        (suficiente para web serving)
Timeout de request:  60 s
Ingress:             all           (tráfico público HTTPS automático)
Autenticación:       allow-unauthenticated (el auth es Firebase en la app)
```

**Pipeline de despliegue (primera versión):**

```
GitHub Actions job deploy (solo en push a master con tag v*):
  1. docker build -t gcr.io/$PROJECT/caresignal-app:$TAG .
  2. docker push gcr.io/$PROJECT/caresignal-app:$TAG
  3. gcloud run deploy caresignal-app --image=... --region=us-central1
```

### Consecuencias

**Positivas:**
- `min-instances: 1` elimina el cold start de ~2s en demostraciones en vivo.
- HTTPS automático con certificado administrado por Google.
- Sin administración de servidor; escalado a cero fuera de horario reduce costos.

**Negativas / mitigaciones:**
- `min-instances: 1` tiene costo constante (~$8-12 USD/mes por instancia idle).
  Mitigado: el presupuesto de startup lo absorbe; reducir a 0 fuera de horario de
  demo si el costo importa.
- Requiere Dockerfile en el repo (aún no existe — tarea de E6 formal).

---

## ADR-004 — Estrategia de observabilidad

**Estado:** Propuesto  
**Fecha:** 2026-10-04  
**Relacionado con:** ADR-003 (Cloud Run), E2 (seguridad)

### Contexto

El MVP no tiene monitoring ni error tracking. En producción, un error silencioso en el
flujo de alertas (e.g., una alerta que no se escala por un bug en `transitions.ts`)
puede tener consecuencias operativas. Se necesita:

- Captura de errores no manejados en frontend y backend con stack trace + contexto
- Métricas de latencia y disponibilidad del servicio Cloud Run
- Alertas para el operador (Roberto García) si el servicio cae o tiene error rate alto
- Budget mensual razonable para etapa de startup

### Opciones evaluadas

| Herramienta | Cobertura | Costo estimado | Complejidad |
|-------------|-----------|----------------|-------------|
| **Sentry** (errors) + **Google Cloud Monitoring** (infra) | Frontend errors, Cloud Run métricas | Sentry gratis 5K eventos/mes; GCM incluido en GCP | Baja — dos SDKs independientes |
| **Datadog** | Full stack (APM + logs + metrics) | ~$15/host/mes mínimo | Media | 
| **New Relic** | APM + errors + infra | Gratuito hasta 100 GB/mes de datos | Media |
| **Google Cloud Error Reporting + Cloud Logging** only | Solo Cloud Run logs | Incluido en GCP | Muy baja — sin frontend JS errors |

### Decisión

**Sentry** (errores de aplicación, frontend + backend) + **Google Cloud Monitoring**
(métricas de infraestructura Cloud Run).

| Capa | Herramienta | Qué monitorea |
|------|-------------|---------------|
| Frontend JS errors | Sentry Browser SDK | Excepciones no capturadas, errores de Red, performance transactions |
| Cloud Run errors | Sentry Node SDK | Errores del servidor, panics, request failures |
| Cloud Run infra | Google Cloud Monitoring (nativo) | CPU, memoria, latencia de request, tasa de errores HTTP |
| Alertas operativas | GCM Alerting policies | Email/PagerDuty si error rate > 1% en 5 minutos |

**Budget:** Sentry Developer (gratuito) → Team $26/mes si supera 5K eventos/mes.

### Consecuencias

**Positivas:**
- Sentry integra source maps de Vite — los stack traces de producción muestran
  el código TypeScript original, no el bundle minificado.
- Google Cloud Monitoring es cero configuración para Cloud Run: métricas
  automáticas desde el primer despliegue.
- Una alerta de GCM puede notificar por email en <5 minutos de un incidente.

**Negativas / mitigaciones:**
- Dos consolas distintas (Sentry + GCP Console): sin single pane of glass.
  Mitigado inicialmente por el bajo volumen de incidentes esperado en MVP → producción.
- Sentry 5K eventos/mes puede saturarse si hay un bug de bucle. Mitigado con
  `sampleRate: 0.1` en producción (10% de sessions) y rate limiting en Sentry.

---

## ADR-005 — Contrato de API (REST + OpenAPI)

**Estado:** Propuesto  
**Fecha:** 2026-10-04  
**Relacionado con:** ADR-001, ADR-002, ADR-003, docs/03-data-model.md

### Contexto

El frontend React existente consume directamente el repositorio local (`localStorage`).
En producción, ese repositorio necesita hablar con un backend (Cloud Run) que expone
los datos de Firestore. Se debe definir el estilo del contrato de API antes de escribir
el primer endpoint, para que:

- Los tipos TypeScript del frontend no se dupliquen manualmente
- El contrato sea auditable y versionable (igual que el contrato del producto)
- Un cambio en el backend no rompa silenciosamente el frontend

### Opciones evaluadas

| Estilo | Pro | Contra |
|--------|-----|--------|
| **REST + OpenAPI 3.1** | Agnóstico de lenguaje; herramientas maduras (`openapi-typescript`, Swagger UI); compatible con cualquier cliente HTTP | Requiere mantener la spec; sin type narrowing automático en llamadas |
| **tRPC** | Type safety end-to-end sin code gen; mismo TS para front y back | Acopla frontend y backend al mismo runtime Node.js; migración futura difícil |
| **GraphQL** | Queries flexibles; introspección; ecosistema amplio | Complejidad operativa (schema, resolvers, N+1 queries); overkill para un MVP con entidades conocidas |

### Decisión

**REST + OpenAPI 3.1** con generación automática de tipos para el cliente.

Estructura del contrato:

```
docs/openapi/
  caresignal-api.yaml     # spec principal (OpenAPI 3.1)
  schemas/
    resident.yaml
    round.yaml
    alert.yaml
    incident.yaml
    audit-event.yaml
```

Convenciones:

| Aspecto | Decisión |
|---------|----------|
| Versionado de URL | `/v1/` — cambios breaking = nuevo prefijo `/v2/` |
| Autenticación | `Authorization: Bearer <firebase-id-token>` en cada request |
| Tenant en path | `/v1/residencias/{residenciaId}/residents` — multi-tenant explícito en URL |
| Formato de fecha | ISO 8601 (ya definido en contrato §9) |
| Errores | RFC 9457 Problem Details (`type`, `title`, `status`, `detail`, `instance`) |
| Generación de tipos | `openapi-typescript` → `src/api/types.generated.ts` (no editar manualmente) |

**Endpoints iniciales** (mínimo para reemplazar localStorage):

```
GET    /v1/residencias/{id}/residents
GET    /v1/residencias/{id}/residents/{residentId}
GET    /v1/residencias/{id}/rounds
POST   /v1/residencias/{id}/rounds/{roundId}/start
POST   /v1/residencias/{id}/rounds/{roundId}/complete
GET    /v1/residencias/{id}/alerts
POST   /v1/residencias/{id}/alerts/{alertId}/acknowledge
POST   /v1/residencias/{id}/alerts/{alertId}/assign
POST   /v1/residencias/{id}/alerts/{alertId}/escalate
POST   /v1/residencias/{id}/alerts/{alertId}/resolve
POST   /v1/residencias/{id}/alerts/{alertId}/close
GET    /v1/residencias/{id}/audit-events
```

### Consecuencias

**Positivas:**
- La spec OpenAPI sirve como documentación automática (Swagger UI en `/docs`
  del servicio Cloud Run en modo no-producción).
- `openapi-typescript` genera `src/api/types.generated.ts` que el repositorio
  importa — elimina la duplicación manual de tipos entre frontend y backend.
- La abstracción `repository.ts` existente solo necesita cambiar su implementación
  interna (de `localStorage` a `fetch`) sin modificar los contratos de las funciones.

**Negativas / mitigaciones:**
- La spec debe mantenerse sincronizada con el código del backend. Mitigado con
  un job de CI que valida la spec (`spectral lint`) y un test de contrato que
  llama cada endpoint y verifica la respuesta contra el schema.
- Sin type narrowing automático en el punto de llamada: mitigado con los tipos
  generados y una función `apiFetch<T>` tipada en el cliente.
