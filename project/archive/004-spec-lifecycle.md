# 004 — Spec Lifecycle

> This document defines the lifecycle of a Spec — from creation to completion — and the rules an agent must follow at each stage.

---

## What is a Spec

A Spec is a structured document that formalizes a unit of work. It defines:

- What needs to be built (requirements).
- How it should be built (design).
- What tasks are needed to implement it.

No business logic implementation should begin without an approved Spec.

---

## Spec Location

All Specs live in: `.kiro/specs/<spec-name>/`

Each Spec folder may contain:

```
.kiro/specs/<spec-name>/
├── requirements.md       # What needs to be built
├── design.md             # How it will be built
└── tasks.md              # Implementation tasks
```

---

## Lifecycle Stages

```
Draft → Review → Approved → In Progress → Completed → Archived
```

### 1. Draft

- The Spec is being written.
- Requirements are being gathered and documented.
- Design is being explored.
- The agent MAY help write a Spec if explicitly asked by the project owner.
- The agent MUST NOT implement anything from a Draft Spec.

### 2. Review

- The Spec is complete and awaiting approval from the project owner.
- The agent MAY answer questions about the Spec.
- The agent MAY suggest improvements if asked.
- The agent MUST NOT implement anything from a Spec under review.

### 3. Approved

- The project owner has approved the Spec.
- Implementation may begin.
- The agent MAY start working on the tasks defined in the Spec.
- The Spec becomes the authoritative source for the scope of work.

### 4. In Progress

- Implementation tasks are being executed.
- The agent works through tasks sequentially unless dependencies allow parallelism.
- If a task reveals that the Spec is incomplete or incorrect, the agent MUST stop and report the issue rather than improvising a solution.

### 5. Completed

- All tasks in the Spec are done.
- Quality gates have been passed (see `006-quality-gates.md`).
- Definition of Done criteria are met (see `007-definition-of-done.md`).
- The Spec is marked as completed.

### 6. Archived

- The Spec is preserved for historical reference.
- No further work should reference an archived Spec as active.

---

## Agent Rules per Stage

| Stage | Can implement? | Can modify Spec? | Can create tasks? |
|-------|---------------|-----------------|-------------------|
| Draft | No | Only if asked | Only if asked |
| Review | No | No | No |
| Approved | Yes | No | No (tasks are fixed) |
| In Progress | Yes | No — stop and report issues | No — stop and report gaps |
| Completed | No | No | No |
| Archived | No | No | No |

---

## Creating a Spec

When the project owner asks to create a Spec, follow this structure:

### requirements.md

- Clear, numbered requirements.
- Each requirement is testable and verifiable.
- Acceptance criteria for each requirement.
- Out-of-scope items explicitly listed.

### design.md

- How the requirements will be satisfied.
- Which components are involved.
- Which interfaces (ports) are used or created.
- Data flow description.
- Must respect architecture defined in `architecture.md`.
- Must use only approved technologies from `tech-stack.md`.

### tasks.md

- Ordered list of implementation tasks.
- Each task is small enough to complete in a single session.
- Each task has clear start and end conditions.
- Dependencies between tasks are documented.

---

## Spec Scope Rules

1. A Spec must not span multiple unrelated features. One Spec = one cohesive unit of work.
2. A Spec must not require unapproved technologies.
3. A Spec must not contradict `project-identity.md` or existing Steering.
4. A Spec must reference which architectural components it touches.
5. If a Spec requires a new interface (port), that design must be explicit in `design.md`.

---

## When No Spec Exists

If the project owner asks to implement something and no Spec exists:

1. Inform the owner that no Spec exists for this work.
2. Ask if a Spec should be created first.
3. Do NOT begin implementation without explicit authorization.

Exception: trivial fixes (typos, formatting, obvious bugs) do not require a Spec if the project owner explicitly authorizes them.

---

# End of Document
