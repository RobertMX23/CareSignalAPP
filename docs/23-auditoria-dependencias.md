# Auditoría de dependencias de producción (2026-10-16)

> Resultado de `npm audit --omit=dev` y de cuáles alertas **aplican de verdad al navegador**.
> Alcance: dependencias de producción de la aplicación (`package.json` raíz). `functions/` se audita aparte
> (0 vulnerabilidades al 2026-10-16). `backend/` no tiene `package-lock.json`, así que `npm audit` no puede
> revisarlo; además no está desplegado.

## 1. Resumen

| | Antes | Después de este cambio |
|---|---|---|
| Vulnerabilidades reportadas | **6** (4 altas, 2 moderadas) | **2** (0 altas, 2 moderadas) |
| Cambio en el bundle que se publica | — | **Ninguno**: mismo archivo, mismo `sha256` |

## 2. Qué es cada alerta y si aplica

| Advisory | Severidad | Paquete (instalado antes) | ¿Llega al navegador? | Veredicto |
|---|---|---|---|---|
| [GHSA-m9gg-hp2v-232j](https://github.com/advisories/GHSA-m9gg-hp2v-232j) — `getAuthContext` puede devolver certificados no autorizados como autorizados | Alta | `@grpc/grpc-js` 1.9.16 | No (0 coincidencias en el bundle) | **No aplica**: es código de servidor/Node. Resuelta con un `override` (sección 3) |
| [GHSA-f596-whhp-79r4](https://github.com/advisories/GHSA-f596-whhp-79r4) — el servidor transmite mensajes de error de sus manejadores | Baja | `@grpc/grpc-js` | No | **No aplica**; resuelta con el mismo `override` |
| Filas de `@firebase/firestore`, `@firebase/firestore-compat` y `firebase` | Alta | transitivas | No | **Ruido**: solo heredan la alerta de `@grpc/grpc-js`; desaparecen con el `override` |
| [GHSA-wrjc-x8rr-h8h6](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6) — redirección abierta con `\` en `<Link>` y `useNavigate` | Moderada | `react-router` 6.30.6 | **Sí**, está en el bundle | **Riesgo muy bajo**: solo explotable si el destino (`to`) lo controla quien ataca; aquí son rutas internas (constantes por rol e IDs de datos propios). **Abierta** |
| [GHSA-337j-9hxr-rhxg](https://github.com/advisories/GHSA-337j-9hxr-rhxg) — inyección de constructor en `deserializeErrors()` al hidratar SSR | Moderada | `react-router` 6.30.6 | El código está; la **API no se usa** | **No aplica**: es una SPA con `HashRouter`, sin renderizado en servidor. **Abierta** |

### Por qué Firestore y gRPC no llegan al navegador

- La aplicación solo importa `firebase/app` y `firebase/auth` (ver `src/lib/firebase.ts` y `src/contexts/AuthContext.tsx`).
- `@firebase/firestore` y `@grpc/grpc-js` están en `node_modules` únicamente porque el paquete `firebase` los declara como dependencias. Un bundler no incluye lo que no se importa.
- Comprobación (el resultado debe ser `0` en todas las líneas):

```bash
npm run build
cat dist/assets/*.js | grep -o "grpc-js" | wc -l
cat dist/assets/*.js | grep -o "getAuthContext" | wc -l
cat dist/assets/*.js | grep -o "firestore.googleapis" | wc -l
```

## 3. Qué se cambió

`package.json` añade:

```json
"overrides": { "@grpc/grpc-js": "^1.13.6" }
```

- Resuelve `@grpc/grpc-js` a **1.14.6** (parchea las dos alertas de gRPC). Baja el reporte de 6 a 2.
- **No altera lo que se publica**: el `sha256` del bundle `dist/assets/index-*.js` es idéntico antes y después
  (`55ee1409fe869d16…`), y `tsc`, las 115 pruebas unitarias y el build pasan.
- Cuándo quitarlo: cuando una versión de `firebase` declare `@grpc/grpc-js` ≥ 1.13.6 por sí misma. Revisar con
  `npm ls @grpc/grpc-js --omit=dev` tras cada actualización de `firebase`.

## 4. Una trampa que hay que evitar

`npm audit` propone como arreglo **`firebase@9.14.0`**, que es un **retroceso** desde la 13.x. **No ejecutar
`npm audit fix --force`.** Los rangos de `@firebase/firestore` que lista son versiones *canary*; la alerta real es la de
`@grpc/grpc-js`.

## 5. Pendiente: `react-router` 6 → 7

Las dos alertas moderadas restantes solo se cierran actualizando a `react-router-dom` ≥ 7.18 (cambio de versión mayor).

- La aplicación usa una API pequeña y estándar: `HashRouter`, `Routes`, `Route`, `NavLink`, `Link`, `Navigate`,
  `Outlet`, `useLocation`, `useParams`, `useNavigate`, `useSearchParams`.
- Riesgo medio: v7 cambia comportamientos internos (p. ej. las transiciones de navegación) que pueden afectar al
  recorrido guiado y al `ErrorBoundary`. Lo respaldan las pruebas unitarias y la suite E2E.
- Se hará en un PR aparte, con su propia aprobación.

## 6. Control en CI

`ci.yml` incluye el job **`npm audit (aviso)`**, que ejecuta `npm audit --omit=dev --audit-level=high`.

- **No bloquea despliegues**: si encuentra una vulnerabilidad alta, emite una anotación de advertencia en el resumen
  del run. Se eligió así porque `npm audit` produce falsos positivos (como el de `firebase` descrito arriba) que no
  deberían detener un despliegue.
- Las moderadas no generan aviso; este documento las lleva.

## 7. Cómo reproducir la auditoría

```bash
npm audit --omit=dev
npm audit --omit=dev --json
npm ls @grpc/grpc-js --omit=dev
```
