# 002 — Working Process

> This document defines the step-by-step workflow every AI agent must follow when receiving a task.

---

## Overview

Every task follows this sequence:

```
Load Context → Understand Task → Validate Authority → Plan → Execute → Verify → Deliver
```

No step may be skipped.

---

## Step 1 — Load Context

Before doing anything, load the required documents in the order defined in `003-context-loading.md`.

If any required document is missing or unreadable, stop and report the issue.

---

## Step 2 — Understand the Task

Read the user's request carefully.

Identify:

- What is being asked.
- What type of work it is (documentation, implementation, investigation, fix).
- Which Spec, ADR or Steering document authorizes this work.

If the request is unclear, ask for clarification before proceeding.

---

## Step 3 — Validate Authority

Before starting work, verify:

| Check | Action if failed |
|-------|-----------------|
| Does an approved Spec exist for this work? | Stop. Ask if a Spec should be created first. |
| Does this require a technology not in `project-identity.md`? | Stop. Inform the user that an ADR is needed. |
| Does this contradict any Steering document? | Stop. Report the contradiction. |
| Does this modify the architecture? | Stop. An ADR must be created and approved first. |
| Is the project in the correct phase for this work? | Stop. Report the phase mismatch. |

If all checks pass, proceed.

---

## Step 4 — Plan

Before writing code or documents:

1. Identify all files that will be created or modified.
2. Identify dependencies between changes.
3. Determine the correct execution order.
4. Verify the plan does not violate architectural rules (business logic decoupled from infrastructure, ports & adapters respected).

For complex tasks, present the plan to the user for approval before executing.

For simple, well-scoped tasks (single file, clear scope), proceed directly.

---

## Step 5 — Execute

Implement the plan following:

- Development rules (`development-rules.md`).
- Project structure (`project-structure.md`).
- Technology stack (`tech-stack.md`).
- Architecture constraints (`architecture.md`).

During execution:

- Work in small, verifiable increments.
- Do not introduce code that cannot be tested.
- Do not leave incomplete implementations without marking them explicitly (TODO with context).
- Do not modify files outside the scope of the current task.

---

## Step 6 — Verify

Before delivering, run all applicable quality gates (see `006-quality-gates.md`):

- Code compiles without errors.
- Lint passes.
- Tests pass.
- No unapproved technologies introduced.
- Architecture boundaries respected.
- Naming conventions followed.

If any gate fails, fix the issue before delivery.

---

## Step 7 — Deliver

Present the completed work to the user with:

- Summary of what was done.
- List of files created or modified.
- Any decisions made within autonomous scope.
- Any open questions or items that need follow-up.

---

## Handling Interruptions

If the user changes direction mid-task:

1. Acknowledge the change.
2. Stop current work cleanly (no half-written files).
3. Re-enter the process from Step 2 with the new request.

---

## Handling Errors

If execution fails:

1. Attempt to diagnose the root cause.
2. If the fix is within autonomous scope, apply it and re-verify.
3. If the fix requires an architectural or technology decision, stop and ask.
4. Never retry the same failing approach more than twice without changing strategy.

---

## Handling Missing Information

When you encounter a gap:

| Situation | Response |
|-----------|----------|
| Spec exists but is ambiguous | Ask for clarification citing the specific ambiguity |
| No Spec exists for the requested work | Ask if a Spec should be created |
| Technology choice needed | Ask, referencing `project-identity.md` approved list |
| Interface design needed | Ask, as this is an architectural decision |
| Implementation detail within module | Decide autonomously following conventions |

---

# End of Document
