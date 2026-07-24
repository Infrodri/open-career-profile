# project/architecture/

## Purpose

This folder contains the detailed architecture documentation of Open Career Profile.

While `.kiro/steering/architecture.md` defines **permanent principles and constraints**, this folder contains the **detailed design documentation** that describes how the system is actually structured: components, diagrams, communication flows, and technical specifications.

---

## Relationship with Steering

| Document | Location | Scope |
|----------|----------|-------|
| Architectural principles | `.kiro/steering/architecture.md` | Permanent constraints that never change without an ADR |
| Detailed architecture | `project/architecture/` (this folder) | Diagrams, component descriptions, flows, technical design |
| Architecture decisions | `project/decisions/` | Individual ADRs with context and rationale |

Steering defines the **rules**. This folder documents the **design** that follows those rules.

---

## Future Contents

This folder will contain:

- **system-overview.md** — High-level system diagram and component descriptions
- **component-catalog.md** — Detailed description of each package, app and plugin
- **communication-flows.md** — How components interact (HTTP, direct calls, events)
- **data-model.md** — Professional Profile domain model and relationships
- **adapter-interfaces.md** — Port definitions and adapter contracts
- **security.md** — Security considerations and threat model
- **deployment.md** — Local deployment architecture (Docker, filesystem, DB)
- **diagrams/** — C4 diagrams, sequence diagrams, dependency graphs

---

## When to Add Content

Content should be added to this folder when:

- The architecture is approved and detailed design begins.
- An ADR introduces a new component or changes an existing one.
- A Spec requires documenting a new subsystem design.

---

## Rules

- All content must be consistent with `.kiro/steering/architecture.md` principles.
- Diagrams should use standard notation (C4, UML sequence, or ASCII).
- Every document must reference which architectural principles it implements.
- Changes to this folder that affect principles require an ADR first.
