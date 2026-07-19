# CareSignal MVP v0.1.0-workshop

> **MVP operacional, no dispositivo médico.** Todos los datos de esta aplicación son
> ficticios. La fuente de verdad del proyecto es el contrato congelado:
> `contract/CareSignal_MVP_Proyecto_Ejecutivo_Contrato_v0.1.0_FROZEN.md`.

## 1. Problema

Las residencias de cuidado de adultos mayores necesitan una forma sencilla de saber,
en cualquier momento, si una ronda de verificación (hidratación, movilidad, comida,
chequeo rutinario) se está cumpliendo a tiempo, y de escalar y auditar la respuesta
cuando no se cumple. CareSignal demuestra ese flujo operacional de punta a punta:
programar/ver rondas, detectar retrasos con un reloj simulado, generar alertas,
asignar/reasignar/escalar, verificar, registrar un resultado, resolver, cerrar y
dejar un rastro de auditoría legible.

## 2. Alcance (v0.1.0-workshop)

**Incluido:** rondas (crear/ver/iniciar/completar), alertas (crear/aceptar/asignar/
reasignar/escalar/verificar/resolver/cerrar), incidentes de verificación, estado
visual derivado del residente (verde/amarillo/rojo), reloj simulado con motor
temporal (vence rondas y crea/escala alertas automáticamente), tres escenarios de
demostración deterministas, auditoría append-only, persistencia local vía
`localStorage`.

**Explícitamente fuera de alcance** (ver `docs/05-known-limitations.md` para el
detalle completo): backend/API/base de datos remota, autenticación real, signos
vitales/sensores/wearables/cámaras, diagnósticos o expedientes clínicos,
notificaciones externas (SMS/WhatsApp/correo/911), pagos, IA dentro del producto,
datos personales reales.

## 3. Usuarios

Tres roles ficticios seleccionables desde el encabezado (no hay inicio de sesión
real):

- **Cuidador/a** (`caregiver`) — atiende sus rondas, inicia/completa, solicita apoyo,
  acepta alertas abiertas.
- **Supervisor/a** (`supervisor`) — dashboard operacional, ciclo completo de alerta
  (reconocer, asignar, reasignar, escalar, verificar, resolver, cerrar).
- **Administrador/a de demo** (`demo_admin`) — rol reservado en la taxonomía para
  controlar la demo; en esta versión el control de demo (reloj, escenarios,
  restablecer) está disponible para cualquier usuario activo, sin restricción de rol.

## 4. Arquitectura

```
contract/       Línea base congelada del contrato (fuente de verdad máxima)
docs/           Documentación derivada (taxonomía, máquina de estados, modelo de
                datos, pruebas de aceptación, limitaciones)
src/domain/     Capa de dominio pura: taxonomy.ts, types.ts, rules.ts,
                transitions.ts — sin IO, sin `any`, congelada desde el Gate C2
src/data/       Única capa de persistencia: seed.ts (semilla determinista),
                repository.ts (localStorage), demoClock.ts (reloj simulado),
                temporalEngine.ts (motor temporal), resetDemo.ts
src/features/   Orquestación por área: rounds/ (flujo del cuidador), alerts/
                (flujo del supervisor), dashboard/ (métricas), demo/ (escenarios)
src/components/ Cascarón de la app (layout, navegación, sesión ficticia, badges)
src/pages/      Las 5 páginas (Dashboard, Mis rondas, Residentes, Alertas, Control
                de demo)
tests/          Pruebas automatizadas (vitest) sobre dominio, datos y operaciones
```

**Principio de capas:** los componentes de React nunca acceden a `localStorage`
directamente ni importan reglas de negocio propias; todo pasa por
`src/data/repository.ts` y llama a las funciones puras de `src/domain/`. El color
del residente nunca se persiste: se recalcula en cada render con
`deriveResidentStatus()`.

**Stack:** React 18 + TypeScript estricto (sin `any`) + Vite + `react-router-dom`
(navegación con `HashRouter`, sin necesidad de configurar un servidor). Sin backend.

## 5. Instalación

```bash
npm install
```

Requiere Node.js 18+ (probado con Node 24). No se necesita ninguna clave, cuenta ni
servicio externo.

## 6. Ejecución

```bash
npm run dev        # servidor de desarrollo, http://localhost:5173
npm run build      # build de producción (tsc --noEmit && vite build) → dist/
npm run preview    # sirve el build de producción localmente
```

## 7. Reinicio de la demo

Dos formas, ambas restablecen datos **y** reloj a la semilla determinista original:

- Botón **"Restablecer demo"** en el encabezado (visible en cualquier página).
- Botón **"Restablecer demo completa"** en Control de demo.

Ambos piden confirmación (diálogo nativo del navegador) antes de borrar el estado
actual en `localStorage`.

## 8. Cómo correr la demo

1. Abrir la app (`npm run dev`) — se ve el Dashboard del supervisor con datos de la
   semilla (10 residentes, 5 en rojo por rondas vencidas).
2. Ir a **Control de demo**.
3. Pulsar **"Escenario: ronda omitida"** → una ronda próxima (Marta Ibáñez) vence y
   genera una alerta amarilla.
4. Pulsar **"Escenario: alerta escalada"** → el retraso supera el umbral crítico
   (alerta roja), se asigna a un cuidador y se escala al supervisor.
5. Pulsar **"Escenario: resolución completa"** → se inicia verificación, se registra
   un resultado, se resuelve y se cierra; se muestra el tiempo total del ciclo.
6. Revisar **"Últimos eventos de auditoría"** en la misma página, o abrir la alerta
   desde **Alertas** para ver su línea de tiempo completa.

Ver `WORKSHOP_DEMO_SCRIPT.md` para un guion detallado paso a paso, incluyendo el
flujo manual del cuidador y del supervisor sin usar los botones de escenario.

## 9. Pruebas

```bash
npm run test        # vitest: dominio, reglas, semilla, motor temporal, operaciones
npm run typecheck    # TypeScript estricto, incluye tests/
```

Ver `docs/04-acceptance-tests.md` para la matriz completa de las 20 pruebas
obligatorias del contrato (automatizadas + verificadas manualmente en navegador,
incluyendo ancho móvil y navegación con teclado).

## 10. Limitaciones

Ver `docs/05-known-limitations.md` para el detalle completo. Resumen:

- Persistencia local en el navegador (`localStorage`), sin backend.
- El reloj es simulado y determinista; nunca se usan esperas reales.
- Una ronda `overdue` es terminal en la máquina de estados actual: un residente con
  una ronda vencida sigue en rojo aunque su alerta se resuelva y cierre.
- La tabla de "Mis rondas" requiere scroll horizontal en teléfonos muy angostos.

## 11. Exclusiones médicas

CareSignal **no es un dispositivo médico**. No mide signos vitales, no usa sensores
ni cámaras, no detecta caídas ni fallecimientos, no emite diagnósticos ni
recomendaciones médicas, no gestiona expedientes clínicos ni medicamentos, y no
muestra condiciones médicas de los residentes. Los tipos de ronda son operativos y
ficticios; el estado visual del residente (verde/amarillo/rojo) es un indicador
**operacional derivado**, no un diagnóstico. Cada pantalla muestra de forma visible
el aviso "MVP operacional, no dispositivo médico" y el indicador "Datos ficticios".

## 12. Próximos pasos (Backlog v0.2)

Registrado formalmente; requiere una nueva versión del contrato antes de
implementarse (contrato §13, §20):

- Mecanismo explícito para "reabrir" o reemplazar una ronda `overdue` una vez
  resuelta su alerta, para que el color del residente pueda volver a verde/amarillo
  sin esperar a una ronda futura.
- Rediseño de "Mis rondas" a un layout de tarjetas en anchos de teléfono muy
  angostos, en vez de una tabla con scroll horizontal.
- Simplificar o documentar más explícitamente el código de error
  `RESOLVE_BEFORE_CLOSE` en `src/domain/transitions.ts` (hallazgo `low`, ver
  `docs/04-acceptance-tests.md` §4).
- Persistir la selección de "usuario ficticio activo" entre recargas (hoy vive solo
  en memoria de React).
- Filtros combinados/guardados en la lista de alertas del supervisor.
