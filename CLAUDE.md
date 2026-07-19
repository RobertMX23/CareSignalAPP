# CLAUDE.md — CareSignal MVP

> Operating instructions for any AI or contributor working in this repo.
> The authoritative source of truth is the **frozen contract**:
> `contract/CareSignal_MVP_Proyecto_Ejecutivo_Contrato_v0.1.0_FROZEN.md`
> (baseline `0.1.0-workshop-frozen`, status `FROZEN / BASELINE APPROVED FOR BUILD`).
> This file summarizes and enforces that contract; on any conflict, the contract wins.

## What this project is

CareSignal is a **demo web app** for elder-care residences that lets caregivers and
supervisors: schedule/view rounds, start and complete rounds, detect delayed/overdue
rounds via a **simulated clock**, raise yellow/red alerts, assign/reassign/escalate,
run a verification, record an operational outcome, resolve and close, and keep an
auditable log.

It is an **operational demonstration MVP** — NOT a medical device, NOT a diagnostic
system, NOT an emergency service. Every screen must show the notice:
**"MVP operacional, no dispositivo médico"** and a visible **"Datos ficticios"** indicator.

## Authority hierarchy (highest wins on conflict)

1. `contract/CareSignal_MVP_...FROZEN.md` (frozen contract)
2. `docs/00-product-contract.md`
3. `docs/01-domain-taxonomy.yaml`
4. `docs/02-state-machine.md`
5. `src/domain/types.ts`
6. `src/domain/rules.ts`
7. `docs/04-acceptance-tests.md`
8. UI code and components
9. Any AI-generated suggestion (lowest authority)

An AI suggestion is **never** accepted merely because it is "best practice." If it
changes frozen scope it must be justified as a contract-compliance fix or sent to backlog.

## Build protocol — STRICT, GATED, ONE CHUNK AT A TIME

Execute in order. Each chunk ends at a review **gate** and does **not** authorize the
next automatically. Stop after each chunk and wait for human approval.

```
Prompt 0 (master instruction)
  → Chunk 1 → Gate C1   Contract, taxonomy, limits (docs only, NO React)
  → Chunk 2 → Gate C2   State machine + TS domain model
  → Chunk 3 → Gate C3   Fake data, repository, demo clock
  → Chunk 4 → Gate C4   App shell + navigation (5 pages)
  → Chunk 5 → Gate C5   Caregiver flow
  → Chunk 6 → Gate C6   Supervisor dashboard + alert lifecycle
  → Chunk 7 → Gate C7   Deterministic time engine + scenarios
  → Chunk 8 → Gate C8   QA, accessibility, release v0.1.0-workshop
```

**Current state: Gate C2 approved** — C0 (scaffold), C1 (docs 00/01/05 + CHANGELOG),
and C2 (docs 02/03 + `src/domain/{taxonomy,types,rules,transitions}.ts`) are done.
The next authorized step is **Chunk 3** (fake data, repository, deterministic demo
clock → Gate C3). See `docs/RESUME.md` for exact state and a paste-ready Chunk 3 prompt.
Do not advance past a gate without explicit human authorization.

Gate summaries:
- **C1**: alert ≠ incident; colors are derived; no medical language; no extra features.
- **C2**: code compiles, no `any`, taxonomy unchanged, forbidden transitions blocked.
- **C3**: all referenced IDs exist, audit coherent, clock deterministic, no direct `localStorage` from UI.
- **C4**: compiles, five pages exist, nav works, UI does not alter domain rules.
- **C5**: a normal round completes in ≤3 actions, no duplicate alerts, invalid transitions don't corrupt data.
- **C6**: full alert cycle works end to end, audit visible, cannot close without outcome.
- **C7**: scenarios deterministic and reproducible, full demo runs in <5 minutes.
- **C8**: release is `PASS`, no `blocker`, no demo-breaking `high`, no scope expansion.

## Frozen taxonomy (do NOT rename or add without a change request)

- **Roles**: `caregiver`, `supervisor`, `demo_admin`
- **Entities**: `resident`, `staff_member`, `round`, `alert`, `incident`, `audit_event`
- **Round types**: `routine_check`, `hydration_check`, `mobility_assistance`,
  `meal_assistance`, `custom_operational_check` (operational & fictional, NOT medical)
- **Round states**: `scheduled`, `due`, `in_progress`, `completed`, `overdue`, `cancelled`
- **Alert states**: `open`, `acknowledged`, `assigned`, `escalated`, `in_verification`,
  `resolved`, `closed`
- **Alert severity**: `yellow`, `red`
- **Incident states**: `open`, `verification_in_progress`, `resolved`, `closed`
- **Staff availability**: `available`, `busy`, `off_shift`
- **Derived resident status** (computed, never persisted): `green`, `yellow`, `red`

Alert vs incident: an alert signals an operational condition needing attention; the
incident documents verification/outcome/formal close. Resolve vs close: `resolved`
means a valid verification outcome exists; `closed` means the admin cycle ended (and
every closed alert must have been resolved first).

### Forbidden synonyms in code/state/entities
`paciente`, `emergencia médica`, `diagnóstico`, `evento clínico`, `visita médica`,
`muerte detectada`, `monitor cardíaco`, `expediente`, `alarma finalizada`.
UI text may only say **"evento que requiere verificación"**.

## Non-negotiable business rules (contract §6)

1. A round belongs to one resident; may have 0 or 1 assigned caregiver.
2. An overdue round may raise an alert; a round may not have two active alerts at once.
3. An alert has 0 or 1 active owner; every reassignment keeps the prior owner in audit.
4. Every transition records actor + date + time; every material action emits an `AuditEvent`.
5. A resolved alert requires a verification outcome; a closed alert must have been resolved.
6. Resident visual status is derived from rounds + alerts (`deriveResidentStatus()`, pure).
7. Completed rounds can't later become overdue; cancelled rounds raise no alert.
8. Invalid transitions return a controlled error.
9. UI components never touch `localStorage` directly — the repository layer is the only
   owner of persistence. Business logic lives in the domain layer, not in components.
10. Audit is append-only; it cannot be edited from the MVP UI.

## Out of scope for v0.1.0 (do NOT implement)

No backend, real auth, external APIs, secrets, or remote DB. No pulse/vitals, sensors,
wearables, fall detection, cameras, facial recognition, geolocation. No diagnosis,
medical records, medications, medical claims, death detection. No 911, WhatsApp, SMS,
email/notifications. No payments. No AI inside the product. No real personal data —
fictional data only. New entity/role/state/transition, meaning changes, or any of the
above require a formal change request and a new contract version (§13). Park ideas in
"Backlog v0.2" (contract §20), never silently implement.

## Tech constraints (contract §9)

React + strict TypeScript; responsive; local state; `localStorage` for persistence via a
single repository layer; deterministic simulated clock; no `any`; avoid unnecessary deps;
dates ISO 8601; stable string IDs; don't persist derived data (resident color).

## Target structure (contract §9.2)

```
docs/  00-product-contract.md 01-domain-taxonomy.yaml 02-state-machine.md
       03-data-model.md 04-acceptance-tests.md 05-known-limitations.md
src/   domain/{types,taxonomy,rules,transitions}.ts
       data/{seed,repository,demoClock,resetDemo}.ts
       features/{rounds,alerts,incidents,dashboard}/
       components/  pages/  App.tsx  main.tsx
tests/
README.md  WORKSHOP_DEMO_SCRIPT.md  CHANGELOG.md
```
(`contract/` holds the frozen baseline files; empty dirs currently hold `.gitkeep`.)

## Working mode (from Prompt 0 / control prompts §16)

Before editing: inspect current state, name the files affected, present a short plan,
preserve existing functions. After each chunk: list files created/modified, summarize,
run available validations, report errors/limitations, show how to test, then STOP.
Make minimal, traceable changes. Never auto-advance to another phase or add unrequested
features. Use the control prompts in contract §16 for repairs, scope guarding, change
requests, gate resumption, and red-teaming. Log every change in `CHANGELOG.md`; a frozen
version is never edited silently — an approved change creates a new version (e.g. `0.1.1`).
