# Contrato de Capas Demo — E5

> **Estado del documento:** ACTIVO · versión 1.0.0 · 2026-10-03
> **Autoridad:** por debajo del contrato congelado y `CLAUDE.md`; por encima de cualquier
> sugerencia de IA o decisión de implementación individual.
> **Regla de oro:** ninguna capa modifica el contrato congelado (`v0.1.0-workshop`).
> Cualquier cambio a tipos, estados, reglas de negocio o entidades requiere una nueva
> versión del contrato (§13) antes de implementar.

---

## Restricciones globales (heredadas del contrato congelado §9)

Aplican a **todas** las capas sin excepción:

- Sin backend, sin auth real, sin APIs externas, sin secretos, sin DB remota.
- Solo `localStorage` para persistencia, vía la capa `repository.ts`.
- React + TypeScript estricto; cero `any`; sin dependencias innecesarias.
- Datos ficticios únicamente. El aviso "MVP operacional, no dispositivo médico" y
  "Datos ficticios" deben permanecer visibles en todas las pantallas nuevas.
- Los componentes nunca tocan `localStorage` directamente.
- La lógica de negocio vive en `src/domain/`, no en componentes ni páginas.
- Los tests E2E de las capas anteriores no deben romperse.

---

## Proceso de entrega — igual que el C/E-track

1. Una capa a la vez, en el orden definido aquí.
2. Cada capa termina en un **gate de revisión** y no autoriza la siguiente.
3. El agente IA detiene el trabajo al terminar la capa y espera aprobación humana.
4. Todo cambio se registra en `CHANGELOG.md`.
5. Entrega: rama → PR → revisión → merge (nunca push directo a master).

---

## L-01 — Toast de notificaciones simuladas

### Estado: `aprobada` — gate cerrado 2026-10-04 (PR #3 + PR #4 mergeados, 59/59 tests)

### Qué hace
Cuando el motor temporal (`temporalEngine.ts`) crea o escala una alerta, el usuario
ve una notificación toast en pantalla. El propósito del demo es mostrar al cliente
que "el sistema avisa sin que tengas que revisar el dashboard".

### Scope exacto (qué SÍ)
- Un componente `ToastContainer` global montado en `App.tsx`.
- Un contexto `ToastContext` con función `pushToast({ message, severity })`.
- El motor temporal llama a `pushToast` (o el componente que invoca el motor lo hace)
  al detectar una alerta creada o escalada.
- Toast muestra: icono de severidad (🟡/🔴), nombre del residente, tipo de evento.
- Duración: 5 segundos; el usuario puede cerrarlo manualmente.
- Máximo 3 toasts visibles simultáneamente (los más nuevos desplazan los más viejos).
- Compatible con modo desktop y móvil (375 px).

### Out of scope (qué NO)
- Notificaciones push del navegador (Web Push API).
- Persistencia de notificaciones (historial de notificaciones pasadas).
- Notificaciones por WhatsApp, email, SMS.
- Sonidos o vibración.
- Notificaciones de otros eventos fuera de las alertas (rondas completadas, etc.).

### Criterios de aceptación (verificables)

| ID | Criterio |
|----|----------|
| L01-01 | Al avanzar el reloj hasta vencer `round-02`, aparece un toast con severidad amarilla y el nombre "Antonio Salas". |
| L01-02 | Al avanzar más hasta cruzar `CRITICAL_DELAY_MINUTES`, aparece un toast de severidad roja (escalada). |
| L01-03 | El toast desaparece automáticamente después de 5 segundos. |
| L01-04 | Clicking el botón de cerrar del toast lo descarta inmediatamente. |
| L01-05 | Si se generan 4 toasts seguidos, solo se muestran los 3 más recientes. |
| L01-06 | El toast no rompe el layout en viewport 375 px. |
| L01-07 | Los tests E2E existentes siguen pasando (el toast no interfiere con selectores). |

### Archivos a crear / modificar
```
src/components/ToastContainer.tsx   — nuevo
src/components/ToastContext.tsx     — nuevo
src/App.tsx                         — montar ToastContainer, proveer ToastContext
src/data/demoClock.ts               — llamar pushToast tras runTemporalEngine (o adapter)
src/styles/ (o css inline)          — estilos del toast
```

### Dependencias externas
Ninguna. Implementación pura React + CSS.

---

## L-02 — Dashboard de métricas / KPIs

### Estado: `aprobada` — gate cerrado 2026-10-04 (PR #7 mergeado, 59/59 tests, 7/7 criterios verificados en browser)

### Qué hace
Una nueva página `/metricas` (accesible para `supervisor`, `manager`, `demo_admin`)
con indicadores operativos calculados en tiempo real desde los datos ficticios.
Muestra al cliente que el sistema produce información ejecutiva lista para revisión.

### Scope exacto (qué SÍ)
- Página `MetricasDashboardPage.tsx` en `src/pages/`.
- Ruta `/metricas` en `App.tsx`, protegida con `RoleGuard` para supervisor/manager/demo_admin.
- Enlace en la navegación (después de "Alertas").
- **Métricas a mostrar** (todas calculadas de los datos actuales en `localStorage`):
  - % de rondas completadas a tiempo (completadas antes de `dueAt`).
  - % de rondas vencidas (estado `overdue`).
  - Tiempo promedio de resolución de alertas (en minutos, desde `createdAt` hasta `resolvedAt`).
  - Alertas abiertas / en escalada / resueltas / cerradas (conteos).
  - Top 3 residentes con más alertas activas.
- **Visualización:** al menos 2 gráficas usando `recharts` (librería ya aprobada para proyectos React).
- Período mostrado: "turno actual" (datos del localStorage, sin filtro de fecha por defecto).

### Out of scope (qué NO)
- Filtros de fecha o rango histórico.
- Exportación a PDF/Excel.
- Comparación entre turnos o semanas.
- Alertas en tiempo real dentro de la página (eso lo cubre L-01).
- Datos de múltiples residencias (el MVP es mono-residencia).

### Criterios de aceptación

| ID | Criterio |
|----|----------|
| L02-01 | La ruta `/metricas` carga sin errores TypeScript ni errores de consola. |
| L02-02 | Un supervisor ve la página; un cuidador (`caregiver`) no tiene acceso (RoleGuard redirige). |
| L02-03 | Los 5 indicadores listados aparecen en pantalla con valores numéricos. |
| L02-04 | Al avanzar el reloj (L-01 activo o no), los valores se actualizan sin recargar la página. |
| L02-05 | Las 2 gráficas renderizan sin errores en Chromium, Firefox y WebKit. |
| L02-06 | El layout es usable en 375 px (sin scroll horizontal). |
| L02-07 | Los tests E2E existentes siguen pasando. |

### Archivos a crear / modificar
```
src/pages/MetricasDashboardPage.tsx   — nuevo
src/App.tsx                           — añadir ruta /metricas + nav link
src/components/AppNav.tsx             — nuevo enlace "Métricas"
package.json                          — añadir recharts (si no está)
```

### Dependencias externas
`recharts` — librería de gráficas React ampliamente usada, MIT license.
Verificar antes de instalar que no esté ya en `package.json`.

---

## L-03 — PWA instalable

### Estado: `en desarrollo` — rama feature/l03-pwa-lighthouse

### Qué hace
Convierte el app en una Progressive Web App instalable en iOS y Android.
En el demo presencial, el presentador abre el app en el celular "como si fuera nativa".

### Scope exacto (qué SÍ)
- `public/manifest.json` con `name`, `short_name`, `start_url`, `display: standalone`,
  `theme_color`, `background_color`, `icons` (al menos 192×192 y 512×512).
- Íconos SVG/PNG generados (logo CareSignal o inicial CS) en `public/icons/`.
- `<meta name="theme-color">` y `<link rel="manifest">` en `index.html`.
- `<meta name="apple-mobile-web-app-capable">` para iOS.
- Verificación: Lighthouse PWA score ≥ 80 en modo producción (`npm run build`).

### Out of scope (qué NO)
- Service Worker / caché offline (requiere estrategia compleja y no aporta al demo).
- Notificaciones push nativas (Web Push API).
- Sincronización en background.
- App Store / Play Store.

### Criterios de aceptación

| ID | Criterio |
|----|----------|
| L03-01 | Chrome en Android muestra el banner "Agregar a pantalla de inicio". |
| L03-02 | Al instalar, el app abre en modo standalone (sin barra de URL del navegador). |
| L03-03 | El ícono aparece correctamente en la pantalla de inicio del dispositivo. |
| L03-04 | `npm run build` + `npx serve dist` no genera errores de consola relacionados con el manifest. |
| L03-05 | Los tests E2E existentes siguen pasando (el manifest no afecta rutas ni selectores). |

### Archivos a crear / modificar
```
public/manifest.json          — nuevo
public/icons/icon-192.png     — nuevo (o SVG)
public/icons/icon-512.png     — nuevo (o SVG)
index.html                    — <link rel="manifest">, <meta theme-color>, apple metas
```

### Dependencias externas
Ninguna. Solo archivos estáticos.

---

## L-04 — Vista de calendario de rondas

### Estado: `aprobada` — gate cerrado 2026-10-05 (PR #16 mergeado, 5/5 CI checks)

### Qué hace
Una nueva vista en la página de rondas (o ruta separada) que muestra las rondas del
turno en un calendario/agenda visual, en lugar de solo una tabla. Permite al cliente
ver de un vistazo qué está programado, qué está en curso y qué venció.

### Scope exacto (qué SÍ)
- Vista de agenda del día actual (reloj simulado como referencia temporal).
- Cada ronda aparece como bloque con: nombre del residente, tipo de ronda, estado
  (color derivado: verde/amarillo/rojo/gris para canceladas).
- Toggle entre "Vista lista" (tabla existente) y "Vista calendario".
- Solo lectura: no se pueden editar ni crear rondas desde el calendario.
- Filtro por turno (mañana / tarde / noche) o "todos".
- Compatible con `supervisor`, `manager`, `caregiver`, `demo_admin`.

### Out of scope (qué NO)
- Creación o edición de rondas desde el calendario.
- Vista semanal o mensual.
- Drag & drop de rondas.
- Integración con Google Calendar u otros calendarios externos.
- Rondas recurrentes / plantillas de turno.

### Criterios de aceptación

| ID | Criterio |
|----|----------|
| L04-01 | La vista de calendario carga sin errores TypeScript ni errores de consola. |
| L04-02 | Los 20 residentes de la semilla aparecen con sus rondas en la vista. |
| L04-03 | El color del bloque de cada ronda refleja su estado actual (verde=ok, amarillo=due, rojo=overdue, gris=cancelled/completed). |
| L04-04 | Al avanzar el reloj (con `advanceClock`), los colores se actualizan sin recargar. |
| L04-05 | El toggle Lista/Calendario funciona y persiste durante la sesión. |
| L04-06 | El filtro por turno muestra solo las rondas del turno seleccionado. |
| L04-07 | El layout es usable en 375 px. |
| L04-08 | Los tests E2E existentes siguen pasando. |

### Archivos a crear / modificar
```
src/features/rounds/RoundsCalendarView.tsx   — nuevo
src/pages/RoundsPage.tsx                     — añadir toggle + montar vista nueva
```

### Dependencias externas
Ninguna prevista. Implementación con CSS Grid o Flexbox.
Si se requiere una librería de calendario, evaluar `@fullcalendar/react` (MIT) antes
de instalarla y documentarlo en un PR separado.

---

## Registro de estado

| Capa | ID | Estado | PR | Gate aprobado |
|------|----|--------|-----|---------------|
| Toast de notificaciones | L-01 | `aprobada` | #3 #4 | 2026-10-04 |
| Dashboard de métricas | L-02 | `aprobada` | #7 | 2026-10-04 |
| PWA instalable | L-03 | `en desarrollo` | — | — |
| Vista de calendario | L-04 | `aprobada` | #16 | 2026-10-05 |

---

## Orden de implementación recomendado

```
L-01 (Toasts)  →  Gate L-01
L-02 (Métricas) →  Gate L-02
L-03 (PWA)     →  Gate L-03   ← puede hacerse en paralelo con L-02 si se aprueba
L-04 (Calendario) →  Gate L-04
```

L-01 se hace primero porque L-02 puede reutilizar el mismo mecanismo de contexto
para refrescar métricas cuando el motor temporal corre.

---

## Qué hacer si hay una duda de scope

1. Consultar este documento. Si el caso está cubierto por el scope o el out-of-scope,
   esa es la respuesta.
2. Si no está cubierto, **preguntar al humano antes de implementar**. No asumir.
3. Si la duda afecta el contrato congelado, es una solicitud de cambio (§13) —
   no se implementa sin una nueva versión del contrato.
