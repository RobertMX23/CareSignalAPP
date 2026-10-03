# Estándares de código — CareSignal MVP

> Convenciones que todo el equipo sigue. Fuente de autoridad: `contract/` y `src/domain/`.

---

## TypeScript

- **Strict mode siempre** — `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes` activos.
- **Sin `any`** — si no sabes el tipo, busca en `src/domain/types.ts` o pregunta.
- **Interfaces para shapes, types para uniones** — `interface Round {...}` vs `type RoundState = 'scheduled' | 'due' | ...`
- **Exports nombrados** — sin `export default` salvo en componentes de página (convención de React Router).
- **Inmutabilidad en domain** — los objetos del dominio se reemplazan, no se mutan.

```ts
// ✅ Correcto
const updated: Round = { ...round, state: 'completed' };

// ❌ Incorrecto
round.state = 'completed';
```

---

## Estructura de archivos

```
src/domain/         Solo tipos, reglas y transiciones puras. Sin React, sin localStorage.
src/data/           Repository, seed, demoClock, resetDemo. Sin lógica de UI.
src/features/       Un subdirectorio por dominio: rounds/, alerts/, incidents/, dashboard/
  └─ rounds/
       RoundList.tsx      componente de lista
       RoundDetail.tsx    componente de detalle
       useRounds.ts       hook que lee del repository
src/components/     Componentes genéricos y reutilizables (badges, layout, nav)
src/pages/          Una página por ruta — solo composición, sin lógica de negocio
```

---

## Componentes React

- **Componentes funcionales siempre** — sin class components.
- **Un componente por archivo** — el nombre del archivo = nombre del componente.
- **Props tipadas explícitamente**:

```ts
// ✅ Correcto
interface RoundCardProps {
  round: Round;
  onComplete: (id: string) => void;
}
export function RoundCard({ round, onComplete }: RoundCardProps) { ... }
```

- **Sin lógica de dominio en componentes** — los componentes leen del repository y llaman transiciones del dominio.
- **Sin `localStorage` en componentes** — solo a través de `src/data/repository.ts`.

---

## Hooks

- **Un hook por feature** — `useRounds`, `useAlerts`, `useIncidents`.
- **Los hooks solo leen y escriben a través del repository**:

```ts
// ✅ Correcto
export function useRounds() {
  const [rounds, setRounds] = useState(() => repository.getRounds());
  const complete = (id: string) => {
    const updated = completeRound(rounds.find(r => r.id === id)!, clockService.now(), 'user-1');
    repository.saveRound(updated);
    setRounds(repository.getRounds());
  };
  return { rounds, complete };
}
```

---

## Domain layer (`src/domain/`)

- **Funciones puras** — sin side effects, sin I/O.
- **Transiciones retornan `Result<T, DomainError>`** — nunca lanzan excepciones.
- **Toda transición emite `AuditEvent`** — actor + timestamp + tipo de acción.
- **Derivaciones no se persisten** — `deriveResidentStatus()` se llama en render, no se guarda.

```ts
// ✅ Correcto — transición controlada con AuditEvent
export function completeRound(round: Round, now: Date, actorId: string): Result<{ round: Round; audit: AuditEvent }> {
  if (!VALID_COMPLETE_FROM.includes(round.state)) {
    return err({ code: 'INVALID_TRANSITION', from: round.state, to: 'completed' });
  }
  const updated: Round = { ...round, state: 'completed', completedAt: now };
  const audit: AuditEvent = { id: uuid(), entityId: round.id, actorId, action: 'ROUND_COMPLETED', timestamp: now };
  return ok({ round: updated, audit });
}
```

---

## Nombrado

| Cosa | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `RoundCard`, `AlertBadge` |
| Hooks | camelCase con `use` | `useRounds`, `useAlerts` |
| Funciones de dominio | camelCase, verbo + sustantivo | `completeRound`, `acknowledgeAlert` |
| Tipos e interfaces | PascalCase | `Round`, `AlertState` |
| Constantes | UPPER_SNAKE_CASE | `MAX_ALERTS_PER_ROUND` |
| Archivos de componentes | PascalCase | `RoundCard.tsx` |
| Archivos de utilidades | camelCase | `deriveResidentStatus.ts` |

---

## Fechas y tiempo

- **ISO 8601 siempre** — `"2024-03-15T10:30:00Z"` para persistencia.
- **`demoClock.now()`** en lugar de `new Date()` — para mantener el reloj simulado.
- **Nunca `Date.now()`** en código de negocio — solo en tests o utilidades.

---

## Pruebas

- **Una prueba por comportamiento**, no por función.
- **Nombres descriptivos**: `should raise alert when round is overdue` no `test round alert`.
- **Sin mocks de `localStorage`** — usa el repository real con datos de seed.
- **Arrange / Act / Assert** como estructura base.

```ts
// ✅ Correcto
it('should block completing an already-completed round', () => {
  const round = makeRound({ state: 'completed' });
  const result = completeRound(round, new Date(), 'actor-1');
  expect(result.ok).toBe(false);
  expect(result.error.code).toBe('INVALID_TRANSITION');
});
```

---

## Lo que no se hace

- No crear entidades, roles ni estados que no estén en `docs/01-domain-taxonomy.yaml`
- No usar los términos prohibidos del contrato en código, comentarios ni variables
- No agregar dependencias npm sin aprobación del PM
- No modificar `contract/` — es de solo lectura
- No escribir comentarios que explican QUÉ hace el código — los nombres ya lo dicen
