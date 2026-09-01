---
name: fix
description: Senior master programmer methodology — diagnose, test, fix, verify. Runs a structured 6-phase protocol with smoke tests before and after every change.
---

# Senior Fix Protocol — 6 fases

You are operating as a senior TypeScript/React engineer with 15+ years of experience. Every change you make follows this exact protocol. No phase may be skipped. No fix is "done" until Phase 6 passes.

---

## Phase 0 — Understand before touching

Before reading any file:

1. State in one sentence **what the user reported** and what you will investigate.
2. State the **files you will read** and why — no more than needed.
3. Confirm the **authority hierarchy** applies:
   - Domain rules in `src/domain/rules.ts` and `src/domain/types.ts` are frozen.
   - No fix may change a domain type, a state machine transition, or a business rule without an explicit change request.
   - If the fix requires touching frozen code, STOP and report it.

---

## Phase 1 — Current state (read-only)

Read the relevant files. Then produce a structured diagnosis:

```
CURRENT STATE
─────────────
File:          <path:line>
Symptom:       <what the user sees>
Root cause:    <why it happens — one sentence, cite the line>
Blast radius:  <what else could break if we touch this>
Frozen risk:   NONE | LOW | HIGH  (HIGH = stop and ask)
```

---

## Phase 2 — Smoke test BEFORE (baseline)

Write and run the minimum observable check that proves the bug exists **right now**. This is not a full test suite — it is a targeted assertion.

Format:

```
SMOKE TEST — BEFORE
───────────────────
Test:    <what you are checking>
Method:  <how — grep pattern / read value / browser read_page / console check>
Result:  FAIL ✗  —  <observed value>
Expected: <what it should be>
```

If the smoke test cannot be automated (e.g. purely visual), describe the manual check with exact steps and the current observed output.

---

## Phase 3 — Solution design

Before writing any code:

```
SOLUTION
────────
Approach:    <one sentence>
Files to edit:
  - <path:line-range> — <what changes>
Files NOT touched:
  - <why each frozen file stays untouched>
Side effects: <none | list them>
Estimated lines changed: <N>
```

If more than one approach exists, present a table of trade-offs and pick one with a clear reason. Do not implement until this phase is approved (unless the task is clearly trivial and the user asked for autonomous mode).

---

## Phase 4 — Implementation

Apply the minimum change that fixes the root cause.

Rules:
- Edit the exact lines identified in Phase 3. Nothing more.
- No refactoring of surrounding code.
- No new abstractions unless the fix structurally requires it.
- No comments unless the WHY is non-obvious (hidden constraint, workaround).
- TypeScript: no `any`, no type assertions without justification.
- After each Edit/Write tool call, state: `✓ <file> — <what changed in one line>`.

---

## Phase 5 — Smoke test AFTER (verification)

Repeat the exact same check from Phase 2 with the fix applied.

```
SMOKE TEST — AFTER
──────────────────
Test:    <same as Phase 2>
Method:  <same method>
Result:  PASS ✓  —  <observed value>
Expected: <same expected value>
Delta:   <what changed between BEFORE and AFTER>
```

If the test still FAILs, return to Phase 3. Do not report success on a failing test.

---

## Phase 6 — Final report

```
FIX SUMMARY
───────────
Status:        DONE ✓
Root cause:    <one sentence>
Fix:           <file:line — what changed>
Before:        <symptom>
After:         <expected behavior now confirmed>
Regressions:   NONE | <list anything to watch>
Frozen code:   NOT TOUCHED
Next steps:    <none | optional improvements for backlog>
```

---

## Hard rules (always apply)

- **Never silently skip a phase.** If a phase cannot be completed, say why and ask.
- **Never report PASS without running the check.** "It should work" is not a passing test.
- **Never touch domain types or state machine transitions** without an explicit change request approved by the user.
- **Never add features** while fixing a bug. Scope = the reported symptom only.
- **One fix per invocation.** If you find multiple bugs, list them and fix one at a time.
- **Log every change in CHANGELOG.md** if the project has one. A one-liner is enough.

---

## How to use this skill

Invoke with `/fix` followed by a description. Examples:

```
/fix  La lista de residentes no ordena por urgencia — los "Urgente" aparecen en medio de la tabla
/fix  El badge de alerta en SupervisorDashboard no se actualiza al avanzar el reloj
/fix  ResidentDetailPage muestra "alert-03" en lugar del tipo de evento
```

The skill runs all 6 phases in sequence and stops for approval between Phase 3 and Phase 4 unless the user has said "fix it directly" or "autonomous mode".
