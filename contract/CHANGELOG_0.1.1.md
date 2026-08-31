# Contrato CareSignal MVP — Cambio v0.1.1

**Fecha de aprobación:** 2026-08-30  
**Aprobado por:** Roberto García  
**Baseline anterior:** 0.1.0-workshop-frozen  
**Nueva versión:** 0.1.1  

## Cambio aprobado

### C-01 — Renombrar `Resident.monitoringFrequency` → `Resident.careLevel` + enum `CARE_LEVELS`

**Motivación:** El campo `monitoringFrequency: string` era un string libre sin valores controlados
(`'Cada 2 horas'`, `'Cada 4 horas'`, `'Cada 6 horas'`). Esto divergía de la taxonomía canónica
(DIV-01 identificado en el análisis transversal de docs/16) y era inconsistente con el patrón de
enums establecido para todos los demás catálogos del dominio.

**Cambio:**
- `Resident.monitoringFrequency: string` → `Resident.careLevel: CareLevel`
- `CARE_LEVELS = ['low', 'medium', 'high'] as const` en `src/domain/taxonomy.ts`
- `CareLevel` e `isCareLevel()` exportados desde `taxonomy.ts`
- Mapeo de valores seed: `'Cada 6 horas'` → `'low'` · `'Cada 4 horas'` → `'medium'` · `'Cada 2 horas'` → `'high'`

**Archivos afectados:**
- `src/domain/taxonomy.ts`
- `src/domain/types.ts`
- `src/data/seed.ts`
- `src/pages/ResidentDetailPage.tsx`
- `docs/01-domain-taxonomy.yaml`
- `docs/03-data-model.md`
- `docs/14-vocabulario-maestro.yaml`

**Reglas del contrato que aplican:** §8.1 (modelo Resident), §13 (change request), §16 (log de cambios).  
**Ningún otro campo ni entidad se modifica en esta versión.**
