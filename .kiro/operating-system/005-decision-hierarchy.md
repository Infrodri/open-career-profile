# 005 — Decision Hierarchy

> This document defines the authority hierarchy between all project documents. When two documents contradict each other, the higher-authority document always wins.

---

## Hierarchy (highest to lowest)

```
Level 1 ─── project-identity.md
                │
Level 2 ─── Operating System (.kiro/operating-system/)
                │
Level 3 ─── Steering (.kiro/steering/)
                │
Level 4 ─── ADRs (project/decisions/)
                │
Level 5 ─── Approved Specs (.kiro/specs/)
                │
Level 6 ─── Implementation Code
                │
Level 7 ─── Agent's autonomous decisions
```

---

## Level Descriptions

### Level 1 — Project Identity

**File:** `.kiro/steering/project-identity.md`

- Absolute highest authority.
- Defines mission, principles, approved technologies and AI agent rules.
- Overrides everything below it.
- Can only be modified by the project owner.

### Level 2 — Operating System

**Folder:** `.kiro/operating-system/`

- Defines how agents operate within this repository.
- Overrides Steering in matters of agent behavior and process.
- Does not override Project Identity.
- Can only be modified by the project owner.

### Level 3 — Steering

**Folder:** `.kiro/steering/`

- Defines product vision, architecture, tech stack, development rules and project structure.
- Must be consistent with Project Identity.
- Overrides ADRs if there is a conflict (Steering is the consolidated view; ADRs are individual decisions).
- Can only be modified by the project owner or with explicit instruction.

### Level 4 — ADRs (Architecture Decision Records)

**Folder:** `project/decisions/`

- Individual architectural decisions with context and rationale.
- Must not contradict Project Identity or Steering.
- Approved ADRs authorize specific changes that may update Steering.
- An ADR is required before changing any approved technology or architectural pattern.

### Level 5 — Approved Specs

**Folder:** `.kiro/specs/`

- Define scope, design and tasks for specific units of work.
- Must not contradict any higher level.
- Authorize implementation within their defined scope.
- An agent may implement only what an approved Spec specifies.

### Level 6 — Implementation Code

**Folders:** `apps/`, `packages/`, `plugins/`

- The actual source code of the system.
- Must conform to all levels above.
- If code contradicts a higher-level document, the code is wrong (not the document).

### Level 7 — Agent's Autonomous Decisions

- Local implementation choices made by the agent (variable names, internal algorithms, private helpers).
- Lowest authority — overridden by any documented decision above.
- Must still follow Development Rules conventions.

---

## Conflict Resolution Rules

### Rule 1 — Higher level always wins

If Level 3 (Steering) says "use Express.js" and Level 5 (a Spec) says "use Fastify", the Spec is invalid. Express.js must be used.

### Rule 2 — Report conflicts, do not resolve them

If you detect a conflict between documents at the same level or between adjacent levels, stop and report the conflict to the project owner. Do not choose a winner yourself.

### Rule 3 — Absence is not permission

If a topic is not covered in higher-level documents, that does not mean you can decide freely. If the decision is architectural or involves technology choice, escalate.

### Rule 4 — Explicit overrides implicit

A specific statement in a higher-level document overrides a general principle in a lower-level document.

### Rule 5 — Newer ADRs override older ADRs

If two ADRs conflict, the more recent approved ADR takes precedence (assuming it was created with awareness of the prior one).

---

## Who Can Modify Each Level

| Level | Who can modify |
|-------|---------------|
| 1 — Project Identity | Project owner only |
| 2 — Operating System | Project owner only |
| 3 — Steering | Project owner, or agent with explicit instruction |
| 4 — ADRs | Project owner creates; agent may draft if asked |
| 5 — Specs | Project owner approves; agent may draft if asked |
| 6 — Code | Agent implements per approved Specs |
| 7 — Autonomous | Agent decides within documented conventions |

---

## Practical Examples

| Situation | Resolution |
|-----------|-----------|
| Steering says "use Prisma" but a Spec says "use raw SQL" | Steering wins. Use Prisma. Report the Spec inconsistency. |
| Project Identity says "AI is optional" but a Spec makes AI required for a feature | Project Identity wins. The feature must work without AI. Report to owner. |
| No Steering document covers a specific topic | Check ADRs. If absent there too, escalate to owner. |
| Two Steering files give different guidance on the same topic | Report the conflict. Do not choose. |
| Code exists that contradicts Steering | The code is wrong. Correct it if within current task scope, or report. |

---

# End of Document
