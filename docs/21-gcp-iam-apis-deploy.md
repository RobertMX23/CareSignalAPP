# GCP — cuentas de servicio, permisos y APIs del deploy

> Proyecto: `caresignal-mvp-2026` (número `90089410920`). Verificado 2026-10-15 por CLI.
> Objetivo: que quien reconstruya o audite el proyecto no tenga que redescubrir esta configuración,
> que vive en la consola de Google Cloud y **no** en el repositorio.

## 1. Cuentas de servicio

| Cuenta | Para qué sirve |
|---|---|
| `firebase-deploy@caresignal-mvp-2026.iam.gserviceaccount.com` | La usa el CI (GitHub Actions) para desplegar. Su clave está en el secret `FIREBASE_SERVICE_ACCOUNT_CARESIGNAL_MVP_2026` |
| `caresignal-mvp-2026@appspot.gserviceaccount.com` | *App Engine default*: identidad con la que se ejecuta una Cloud Function de 1.ª generación |
| `90089410920-compute@developer.gserviceaccount.com` | *Default compute*: identidad de build/ejecución que usa Google al construir la función |
| `firebase-adminsdk-fbsvc@…` | Firebase Admin SDK (creada por Firebase; rol *Creador de tokens*) |

## 2. Roles de `firebase-deploy`

| Rol | Alcance | Para qué |
|---|---|---|
| `roles/firebase.admin` | Proyecto | Administrar productos Firebase (Functions, Firestore rules) |
| `roles/firebasehosting.admin` | Proyecto | Publicar en Hosting |
| `roles/iam.serviceAccountUser` | **Sobre `…@appspot…`** | Poder "actuar como" esa cuenta al desplegar una función |
| `roles/iam.serviceAccountUser` | **Sobre `…-compute@developer…`** | Ídem, para la cuenta de build |

Los dos últimos son bindings **directos sobre el recurso** (columna *Herencia* vacía en la consola): mínimo
privilegio, no se aplican a todo el proyecto. Se otorgaron a mano, una sola vez.

Comando equivalente (para recrearlos):

```bash
gcloud iam service-accounts add-iam-policy-binding caresignal-mvp-2026@appspot.gserviceaccount.com \
  --member="serviceAccount:firebase-deploy@caresignal-mvp-2026.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser" --project=caresignal-mvp-2026

gcloud iam service-accounts add-iam-policy-binding 90089410920-compute@developer.gserviceaccount.com \
  --member="serviceAccount:firebase-deploy@caresignal-mvp-2026.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser" --project=caresignal-mvp-2026
```

## 3. APIs que hubo que habilitar a mano

La cuenta del CI **no** puede habilitar APIs (correcto: no debe). Las habilitó un Propietario:

| API | Motivo |
|---|---|
| `firebaseextensions.googleapis.com` | `firebase deploy --only functions` la comprueba aunque no se usen extensiones |
| `cloudbilling.googleapis.com` | El CLI verifica que el proyecto tenga facturación (Blaze) antes de desplegar Functions |

```bash
gcloud services enable firebaseextensions.googleapis.com cloudbilling.googleapis.com --project=caresignal-mvp-2026
```

APIs que el CLI sí habilitó solo: `cloudfunctions`, `cloudbuild`, `artifactregistry`.

## 4. Sitios de Hosting

| Site | Rama | Target (`.firebaserc`) |
|---|---|---|
| `caresignal-mvp-2026` | `production` (canal `live`) y `master` (canal `qa`) | `production` |
| `caresignal-demo` | `demo` | `demo` |

## 5. Estado de Cloud Functions (B-04 — resuelto 2026-10-15)

- `setUserClaims` (Auth `user.create`, 1.ª gen) está **ACTIVE** en `nodejs22` con `firebase-functions` 7.4 y
  `firebase-admin` 14.5 (API modular). El fallo de trigger Pub/Sub del runtime Node 20 no se repitió.
- Test de integración con emuladores (`npm run test:functions`, job `Functions (emuladores)` en CI).
- **Política de limpieza** de `gcf-artifacts` (Artifact Registry, `us-central1`): `firebase-functions-cleanup`,
  borra imágenes con más de 3 días. Aplicada con:

```bash
firebase functions:artifacts:setpolicy --project caresignal-mvp-2026 --location us-central1 --days 3 --force
```

- El job `Cloud Functions` de `deploy-production.yml` ya **no** es `continue-on-error`.
- Pendiente a futuro: el trigger `auth.user().onCreate` es de 1.ª generación (heredada). Alternativa en 2.ª gen:
  blocking functions (`beforeUserCreated`), que requieren Identity Platform.

## 6. Costos (estimación, no factura)

Sin Cloud Run, buckets, funciones activas ni secretos; ~1 MB por versión de Hosting. Se estima ~USD 0/mes
por estar bajo las cuotas gratuitas. Recomendado: alerta de presupuesto en Billing (p. ej. USD 5/mes).

## 7. Provisión de claims de cuentas existentes

`setUserClaims` (Cloud Function) solo corre al **crear** un usuario. Las cuentas que ya existían
(p. ej. el primer login de Google, antes de provisionar el staff) no tienen claims y, desde B-06,
la app les muestra "Tu cuenta aún no tiene acceso". Se provisionan a mano con
`scripts/set-user-claims.mjs` (sin dependencias; usa tu sesión de `gcloud`).

```bash
# 1) Dry-run (no escribe nada): muestra claims actuales y nuevos
node scripts/set-user-claims.mjs --email persona@correo.com --role demo_admin --staff staff-demo-admin-01

# 2) Aplicar
node scripts/set-user-claims.mjs --email persona@correo.com --role demo_admin --staff staff-demo-admin-01 --apply

# Quitar claims
node scripts/set-user-claims.mjs --email persona@correo.com --clear --apply
```

Roles válidos: `caregiver`, `supervisor`, `manager`, `demo_admin`. Tras aplicar, la persona debe
cerrar sesión y volver a entrar (la app refresca el token al iniciar).

Verificación independiente (solo lectura): listar usuarios con `accounts:batchGet` de Identity Toolkit
y comprobar `customAttributes`.

## 8. Alerta de caída (Cloud Monitoring, B-05)

Creada el 2026-10-16 **por la API REST** (los componentes `alpha`/`beta` de `gcloud` no están instalados y no hace
falta instalarlos). Todo vive en el proyecto `caresignal-mvp-2026`; el costo estimado es ~0 (dentro de la cuota
gratuita; confirmar en Billing).

| Recurso | Detalle |
|---|---|
| Canal de notificación | Correo a `robertgcits@gmail.com` (id `11463260939037076210`). La API no informa `verificationStatus` para canales de correo; la entrega se comprobó con la prueba descrita abajo |
| Uptime check (demo) | `caresignal-demo.web.app`, HTTPS, `GET /`, cada 300 s, valida SSL y que la página contenga `CareSignal`, todas las regiones (6) |
| Uptime check (producción) | `caresignal-mvp-2026.web.app`, misma configuración |
| Política (demo) | Dispara si **2 o más ubicaciones** fallan durante 300 s; cierre automático a 1800 s; avisa al canal de correo |
| Política (producción) | Ídem |

Prueba controlada (2026-10-16): un check temporal apuntando a un host inexistente y su política temporal abrieron un
incidente a los ~5 minutos desde 6 ubicaciones; el correo llegó; los recursos temporales se borraron y el incidente
pasó a `CLOSED` en ~75 s. Quedan únicamente los 2 checks y las 2 políticas reales.

Verificación (solo lectura; usa tu sesión de `gcloud`):

```bash
TOKEN=$(gcloud auth print-access-token)
curl -s -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: caresignal-mvp-2026" \
  "https://monitoring.googleapis.com/v3/projects/caresignal-mvp-2026/uptimeCheckConfigs"
curl -s -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: caresignal-mvp-2026" \
  "https://monitoring.googleapis.com/v3/projects/caresignal-mvp-2026/alertPolicies"
curl -s -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: caresignal-mvp-2026" \
  "https://monitoring.googleapis.com/v3/projects/caresignal-mvp-2026/alerts"
```

El último devuelve los incidentes (`state: OPEN` o `CLOSED`). Si el sitio estuviera caído, el correo llega a la
dirección del canal y el incidente se abre en la consola de Cloud Monitoring.
