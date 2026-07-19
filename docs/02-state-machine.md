# 02 — Máquina de estados (CONGELADA) — CareSignal MVP

> Derivado del contrato congelado §7. Autoridad #4. Implementado como lista blanca en
> `src/domain/transitions.ts`. Cualquier transición no listada se rechaza con un error
> controlado (`INVALID_TRANSITION`). Estado: Chunk 2 / Gate C2.

## 1. Round

```text
scheduled ──▶ due
scheduled ──▶ cancelled
due ──▶ in_progress
due ──▶ overdue
due ──▶ cancelled
in_progress ──▶ completed
```

### Transiciones válidas

| Desde | Hacia permitido |
|---|---|
| `scheduled` | `due`, `cancelled` |
| `due` | `in_progress`, `overdue`, `cancelled` |
| `in_progress` | `completed` |
| `completed` | — (terminal) |
| `overdue` | — (terminal; se atiende vía alerta/verificación) |
| `cancelled` | — (terminal) |

### Transiciones bloqueadas (rechazadas con error)

| Bloqueada | Razón (contrato) |
|---|---|
| `completed → overdue` | Una ronda completada no puede vencerse (§6.11). |
| `cancelled → due` | Una ronda cancelada es terminal (§6.12). |
| `completed → in_progress` | No se reabre una ronda completada. |
| `overdue → completed` (directo) | No puede completarse sin iniciar/verificar la acción (§7.1). |

## 2. Alert

```text
open ──▶ acknowledged
open ──▶ assigned
acknowledged ──▶ assigned
assigned ──▶ escalated
assigned ──▶ in_verification
escalated ──▶ assigned
escalated ──▶ in_verification
in_verification ──▶ resolved      (requiere verificationOutcome — regla 8)
resolved ──▶ closed               (requiere haber resuelto — regla 9)
```

### Transiciones válidas

| Desde | Hacia permitido |
|---|---|
| `open` | `acknowledged`, `assigned` |
| `acknowledged` | `assigned` |
| `assigned` | `escalated`, `in_verification` |
| `escalated` | `assigned`, `in_verification` |
| `in_verification` | `resolved` |
| `resolved` | `closed` |
| `closed` | — (terminal) |

### Transiciones bloqueadas y guardas

| Bloqueada / Guarda | Código de error |
|---|---|
| `closed → open` | `INVALID_TRANSITION` |
| `resolved → assigned` | `INVALID_TRANSITION` |
| `open → closed` | `INVALID_TRANSITION` |
| `assigned → closed` | `INVALID_TRANSITION` |
| `in_verification → closed` | `INVALID_TRANSITION` |
| resolver sin resultado de verificación | `MISSING_VERIFICATION_OUTCOME` |
| cerrar sin haber resuelto | `RESOLVE_BEFORE_CLOSE` |

## 3. Incident

```text
open ──▶ verification_in_progress
verification_in_progress ──▶ resolved   (requiere outcome)
resolved ──▶ closed
```

| Desde | Hacia permitido |
|---|---|
| `open` | `verification_in_progress` |
| `verification_in_progress` | `resolved` |
| `resolved` | `closed` |
| `closed` | — (terminal) |

## 4. Contrato de las funciones de transición

Cada aplicador (`transitionRound`, `transitionAlert`, `transitionIncident`) es **puro** y
devuelve una unión discriminada:

```ts
{ ok: true;  nextState; auditEvent; round|alert|incident }   // éxito
{ ok: false; error: { code, message } }                       // error controlado
```

El contexto (`actorId`, `timestamp`, `auditEventId`) se recibe como entrada para
mantener el determinismo. Toda transición válida produce un `AuditEvent` con
`previousState` y `nextState` (contrato §6.4, §6.17).
