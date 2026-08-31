# 03 — Modelo de datos (CONGELADO) — CareSignal MVP

> Derivado del contrato congelado §8. Implementado en `src/domain/types.ts` (autoridad
> #5). TypeScript estricto, sin `any`. Estado: Chunk 2 / Gate C2.

## 1. Convenciones (contrato §8.7)

- Identificadores (`ID`): cadenas estables.
- Fechas (`ISODateTime`): cadenas en formato ISO 8601.
- Campos opcionales tipados explícitamente con `?`.
- Prohibido `any`.
- No se duplica información derivable.
- **No se persiste** el color del residente; se calcula con `deriveResidentStatus()`.
- Toda transición devuelve el nuevo estado + `AuditEvent`, o un error controlado.

## 2. Entidades

### Resident (§8.1)
`id`, `displayName`, `room`, `careLevel` (CareLevel: low|medium|high), `notes?`, `isActive`.
No contiene diagnóstico ni datos clínicos.

### StaffMember (§8.2)
`id`, `displayName`, `role`, `shift`, `availability`, `isActive`.

### Round (§8.3)
`id`, `residentId`, `assignedStaffId?`, `type`, `scheduledAt`, `dueAt`, `startedAt?`,
`completedAt?`, `status`, `completionNote?`, `completionOutcome?` (RoundOutcome: ok|needs_follow_up|no_response|other), `createdAt`, `updatedAt`.

### Alert (§8.4)
`id`, `roundId`, `residentId`, `severity`, `status`, `assignedStaffId?`, `createdAt`,
`acknowledgedAt?`, `escalatedAt?`, `resolvedAt?`, `closedAt?`, `verificationOutcome?`,
`resolutionNote?`.

### Incident (§8.5)
`id`, `alertId`, `residentId`, `status`, `openedAt`, `verificationStartedAt?`,
`resolvedAt?`, `closedAt?`, `outcome?`, `notes?`.

### AuditEvent (§8.6)
`id`, `entityType`, `entityId`, `action`, `actorId`, `previousState?`, `nextState?`,
`timestamp`, `metadata?`. Append-only; no editable desde la UI (§6.18).

## 3. Vocabulario (fuente única: `taxonomy.ts`)

Los tipos literales (`Role`, `RoundType`, `RoundStatus`, `AlertStatus`,
`AlertSeverity`, `IncidentStatus`, `StaffAvailability`, `ResidentDerivedStatus`,
`VerificationOutcome`, `EntityType`) se **derivan** de listas `as const` en
`taxonomy.ts` y se re-exportan desde `types.ts`. Esto evita duplicar el vocabulario y
mantiene una sola fuente en tiempo de ejecución y de compilación.

## 4. Decisiones de modelado

1. **DRY entre `taxonomy.ts` y `types.ts`.** Las uniones literales se derivan de las
   listas de runtime (`typeof LISTA[number]`), no se escriben dos veces. `types.ts`
   compone las interfaces de entidad y re-exporta los tipos.
2. **`VerificationOutcome` se define en Chunk 2** porque el modelo congelado (§8.4, §8.5)
   ya lo referencia en `Alert.verificationOutcome` e `Incident.outcome`. Sus valores son
   los seis resultados operacionales del contrato (Chunk 6), no categorías clínicas.
3. **Color del residente derivado, no persistido.** No existe campo de color en ninguna
   entidad; `deriveResidentStatus(residentId, rounds, alerts)` lo calcula puro.
4. **Pureza y determinismo.** Las transiciones reciben `actorId`, `timestamp` y
   `auditEventId` como entrada; no generan IDs ni leen el reloj, para ser reproducibles
   (el reloj simulado llega en Chunk 3/7).
5. **Errores controlados.** Las transiciones inválidas devuelven
   `{ ok: false, error }` en lugar de lanzar excepciones, para un manejo predecible en
   capas superiores.
6. **`Resident.room` es `string`, no FK a una entidad `Habitacion`.** En v0.1.0 la
   habitación es un identificador libre ('101', '2-B', etc.) vinculado al residente.
   No existe tabla de habitaciones porque el MVP es single-tenant y la complejidad no
   se justifica. `room` es candidata a convertirse en entidad con FK en v0.2
   (multi-residencia, capacidad, historial de ocupación).
7. **`completionOutcome?: RoundOutcome` en `Round` (v0.1.1, C-02).** Corrige DIV-04: el
   tipo local `RoundCompletionOutcome` en `roundOperations.ts` fue reemplazado por el enum
   canónico `ROUND_OUTCOMES = ['ok','needs_follow_up','no_response','other']` en `taxonomy.ts`.
   El campo se persiste en la entidad Round además de en `AuditEvent.metadata.completionOutcome`.

## 5. Integridad referencial (se valida con datos en Chunk 3)

`Round.residentId → Resident`, `Round.assignedStaffId → StaffMember`,
`Alert.roundId → Round`, `Alert.residentId → Resident`,
`Incident.alertId → Alert`, `AuditEvent.entityId → entidad de su `entityType``.
Las comprobaciones de existencia de IDs se ejercen al introducir la semilla de datos
(Gate C3).
