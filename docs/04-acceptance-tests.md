# 04 — Pruebas de aceptación — CareSignal MVP v0.1.0-workshop

> Estado: Chunk 8 / Gate C8. Cubre las 20 pruebas obligatorias del contrato (§Chunk 8)
> más las guardas de dominio ejercitadas en los gates C2–C7. Automatizadas con
> `vitest` donde el nivel de dominio/datos lo permite (`npm run test`, 38 pruebas);
> el resto se verificó manualmente en navegador (Chrome, escritorio 800px y
> móvil 375px) durante los Chunks 4–8 y de nuevo al cierre de este chunk.

## 1. Cómo ejecutar las pruebas automatizadas

```bash
npm install
npm run test        # vitest run — dominio, reglas, semilla, motor temporal, operaciones
npm run typecheck    # tsc --strict --noEmit, incluye tests/
npm run build        # build de producción
```

## 2. Matriz de las 20 pruebas obligatorias

| # | Prueba | Resultado | Evidencia |
|---|---|---|---|
| 1 | Completar una ronda | **PASS** | `tests/round-operations.test.ts`; manual en Chunk 5 (round-18 due→in_progress→completed, nota + resultado operacional en auditoría) |
| 2 | Generar alerta al vencer | **PASS** | `tests/temporal-engine.test.ts`; manual en Chunk 7 (round-02 due→overdue crea alerta amarilla al avanzar el reloj) |
| 3 | Evitar alerta duplicada | **PASS** | `tests/domain-rules.test.ts`, `tests/round-operations.test.ts`, `tests/temporal-engine.test.ts` (repetir el motor temporal o "Solicitar apoyo" no duplica) |
| 4 | Aceptar alerta | **PASS** | `tests/round-operations.test.ts`; manual en Chunk 5 (alert-01 open→assigned, autoasignación del cuidador) |
| 5 | Reasignar alerta | **PASS** | `tests/alert-operations.test.ts`; manual en Chunk 6 (genera su propio `AuditEvent`, `previousState`/`nextState` = IDs de personal) |
| 6 | Escalar alerta | **PASS** | `tests/alert-operations.test.ts`; manual en Chunk 6 (assigned→escalated, responsable conservado) |
| 7 | Iniciar verificación | **PASS** | `tests/alert-operations.test.ts`; manual en Chunk 6 (crea/reutiliza `Incident`, alert→in_verification) |
| 8 | Impedir cierre sin resolución | **PASS** | `tests/domain-transitions.test.ts` (`RESOLVE_BEFORE_CLOSE`/`INVALID_TRANSITION` según el estado de origen — ver hallazgo low §4); UI solo muestra "Cerrar" si `status === 'resolved'` |
| 9 | Resolver con resultado | **PASS** | `tests/domain-transitions.test.ts`, `tests/alert-operations.test.ts` (`MISSING_VERIFICATION_OUTCOME` sin resultado; éxito con uno de los 6 resultados operacionales) |
| 10 | Cerrar correctamente | **PASS** | `tests/alert-operations.test.ts` (alerta e incidente quedan `closed` en el mismo paso) |
| 11 | Conservar auditoría | **PASS** | `tests/alert-operations.test.ts` (cada paso del ciclo deja su propio `AuditEvent`); manual: línea de tiempo visible en `AlertDetailPage` |
| 12 | Derivar estado del residente | **PASS** | `tests/domain-rules.test.ts`, `tests/seed-integrity.test.ts`; nunca se persiste (`deriveResidentStatus` puro, recalculado en cada render) |
| 13 | Cambiar de usuario | **PASS** | Manual en Chunk 5 (selector de usuario ficticio; "Mis rondas" se refiltra al cambiar de cuidador) |
| 14 | Persistir al refrescar | **PASS** | Manual en Chunk 5 y 7 (recarga real del navegador; `localStorage` conserva rondas/alertas/reloj) |
| 15 | Restablecer el demo | **PASS** | Manual en todos los chunks (botón global y de `DemoControlPage`; vuelve a la semilla exacta) |
| 16 | Usar la aplicación en ancho móvil | **PASS** (con nota) | Manual, viewport 375×812: navegación colapsable, tarjetas y formularios se adaptan. Nota medium: la tabla de 8 columnas de "Mis rondas" requiere scroll horizontal notable en teléfonos angostos — funciona, no es óptimo (backlog v0.2, §5) |
| 17 | Navegar con teclado | **PASS** (tras corrección) | Todos los controles son elementos nativos (`button`/`a`/`select`/`input`), focos visibles (sin `outline` suprimido). **Hallazgo high corregido en este chunk:** los diálogos no movían el foco ni cerraban con Escape; se agregó `useAutoFocusModal` (ver CHANGELOG) |
| 18 | Mostrar etiquetas además de colores | **PASS** | `StatusBadge` (texto + ícono), severidad de alerta en texto ("Roja"/"Amarilla"), insignia "Sin asignar" con texto propio |
| 19 | Rechazar transiciones inválidas | **PASS** | `tests/domain-transitions.test.ts` (completar dos veces, reabrir una ronda completada, cancelada→due, cerrada→abierta — todas devuelven error controlado sin mutar el original) |
| 20 | Completar el escenario principal en <5 minutos | **PASS** | Manual en Chunk 7: los 3 botones de escenario llevan `round-01`/su alerta de abierta a cerrada (con incidente sincronizado) en segundos |

## 3. Escenario principal (contrato Chunk 7, pasos 1–14)

Ejecutado end-to-end con los tres botones de "Escenarios de demostración" en
`Control de demo`, operando siempre sobre `round-01` (Marta Ibáñez):

1–6. **Escenario: ronda omitida** → ronda próxima, reloj avanzado, `overdue`, alerta amarilla generada.
7–9. **Escenario: alerta escalada** → retraso supera el umbral crítico (alerta roja), se asigna a un cuidador, se escala al supervisor.
10–13. **Escenario: resolución completa** → verificación iniciada (incidente creado), resultado registrado, resuelta, cerrada (incidente cerrado en el mismo paso).
14. Auditoría y tiempo total visibles en el mensaje de resultado y en "Últimos eventos de auditoría" de `Control de demo`.

Repetir cualquiera de los tres botones después de completado el ciclo no duplica
alertas ni transiciones (mensajes de "ya estaba…" en vez de nuevas acciones).

## 4. Hallazgos registrados

| Severidad | Hallazgo | Resolución |
|---|---|---|
| **high** | Los diálogos (`CompleteRoundModal`, `RequestSupportModal`, `AssignAlertModal`, `ResolveAlertModal`) no movían el foco al abrirse ni cerraban con Escape; un usuario de teclado tendría que tabular por el resto de la tabla para llegar a sus controles. | **Corregido** en este chunk (`useAutoFocusModal`, ver CHANGELOG). Verificado: foco visible en el primer control al abrir; Escape cierra sin enviar. |
| **medium** | La tabla de "Mis rondas" (8 columnas) requiere scroll horizontal notable en teléfonos de 375px de ancho. Funciona (el contenedor `.table-scroll` la hace desplazable), pero no es la experiencia móvil ideal. | No corregido (rediseño a tarjetas quedaría fuera del alcance de "no agregar funciones nuevas" en un chunk de QA). Registrado en Backlog v0.2. |
| **low** | El código de error `RESOLVE_BEFORE_CLOSE` en `src/domain/transitions.ts` es inalcanzable con la lista blanca actual de `ALERT_TRANSITIONS`: el único origen válido hacia `closed` es `resolved`, y ese estado ya satisface `alertWasResolved()`. La regla 8 (no cerrar sin resolver) se cumple igual en todo caso observable, solo con el código `INVALID_TRANSITION` en vez del más específico. | No corregido: es el dominio congelado (autoridad #6); cambiarlo requeriría una solicitud formal de cambio (contrato §13), no una corrección de QA. Documentado y cubierto por prueba (`tests/domain-transitions.test.ts`). |
| **backlog** | Ver `docs/05-known-limitations.md` y la sección "Próximos pasos" de `README.md` para las limitaciones deliberadas de alcance (sin backend, sin notificaciones externas, matiz de "residente en rojo" con ronda vencida terminal hasta que exista un mecanismo de reapertura, etc.). | No aplica a v0.1.0; requieren una nueva versión del contrato. |

No se registraron hallazgos **blocker**.

## 5. Errores abiertos

Ninguno de severidad `blocker` o `high`. El único hallazgo `medium` (tabla ancha en
móvil muy angosto) y el `low` (código muerto documentado) quedan registrados arriba
y no impiden la demostración.
