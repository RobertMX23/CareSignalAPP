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
