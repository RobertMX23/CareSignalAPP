# Contrato CareSignal MVP — Cambio v0.2.0

**Fecha de aprobación:** 2026-08-31  
**Aprobado por:** Roberto García  
**Baseline anterior:** 0.1.1  
**Nueva versión:** 0.2.0 (cambio incompatible — breaking change)

## Cambio aprobado

### C-01 — Agregar `residenciaId: ID` a las 6 interfaces del dominio (preparación multi-tenant)

**Motivación:** La arquitectura de producción objetivo (Google Cloud Run + Firebase + BigQuery)
es multi-tenant: cada residencia tiene su propio espacio de datos. La interfaz de las entidades
del dominio MVP debe incluir `residenciaId` desde ahora para que la migración a producción no
requiera renombrar campos. Identificado como GAP-03 en el análisis transversal (docs/16).

**Cambio:**
- `Resident`, `StaffMember`, `Round`, `Alert`, `Incident` y `AuditEvent` reciben `residenciaId: ID` (campo obligatorio)
- `TransitionContext` recibe `residenciaId: ID` para que las transiciones puras puedan poblarlo en los `AuditEvent`
- Todos los datos seed usan `residenciaId: 'residencia-demo-01'` (valor fijo single-tenant)
- `SCHEMA_VERSION` del repositorio localStorage bumpeado de `1` a `2` para descartar datos de sesiones anteriores incompatibles
- Constante `DEMO_RESIDENCIA_ID = 'residencia-demo-01'` exportada desde `seed.ts`

**Archivos afectados:**
- `src/domain/types.ts` (6 interfaces + re-export)
- `src/domain/transitions.ts` (TransitionContext + makeAudit)
- `src/data/seed.ts` (todos los literales de entidad + contextos de transición)
- `src/data/repository.ts` (SCHEMA_VERSION 1 → 2)
- `src/features/rounds/roundOperations.ts` (contextos + alert inline)
- `src/features/alerts/alertOperations.ts` (contextos + incident/auditEvent inline)
- `docs/01-domain-taxonomy.yaml` (meta.baseline, nota multi-tenant)
- `docs/03-data-model.md` (campo residenciaId en las 6 entidades)
- `docs/17-correcciones-contrato.yaml` (T14 → done)
- `tests/domain-transitions.test.ts` (baseRound, baseAlert, baseIncident, ctx helper)

**Reglas del contrato que aplican:** §8 (modelo completo), §13 (change request), §16 (log de cambios).  
**Invariante de demo:** el MVP siempre usa `'residencia-demo-01'`; no existe UI de selección de residencia en v0.2.0.
