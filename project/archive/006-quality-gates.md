# 006 — Quality Gates

> This document defines the mandatory validations every AI agent must pass before delivering any work. No delivery is complete until all applicable gates pass.

---

## Purpose

Quality gates prevent defective, non-compliant or unauthorized work from being delivered. They are checkpoints, not suggestions. Every gate must be explicitly verified.

---

## Gate Categories

### A — Compliance Gates (always mandatory)

These gates apply to ALL work, regardless of type.

| # | Gate | Verification |
|---|------|-------------|
| A1 | No unapproved technologies introduced | Check all imports, dependencies and tools against `tech-stack.md` and `project-identity.md` |
| A2 | Architecture boundaries respected | Business logic does not import infrastructure directly. Ports & adapters pattern followed. |
| A3 | No contradiction with Project Identity | Verify work aligns with mission, principles and rules in `project-identity.md` |
| A4 | No contradiction with Steering | Verify work aligns with architecture, tech stack, development rules and structure |
| A5 | Scope matches approved Spec | Implementation does not exceed or fall short of what the Spec defines |
| A6 | No sensitive data exposed | No secrets, tokens, PII or credentials in code, logs or comments |

### B — Code Quality Gates (for implementation tasks)

| # | Gate | Verification |
|---|------|-------------|
| B1 | TypeScript compiles without errors | Run `tsc --noEmit` or equivalent typecheck |
| B2 | ESLint passes with no errors | Run `pnpm lint` in affected workspaces |
| B3 | Prettier formatting applied | Run `pnpm format` or verify no formatting issues |
| B4 | All tests pass | Run `pnpm test` in affected workspaces |
| B5 | No `any` types introduced | Verify no use of `any` in new or modified code |
| B6 | Named exports used (no default exports) | Verify export style follows conventions |
| B7 | Naming conventions followed | Variables, files, folders match `development-rules.md` |
| B8 | Error handling follows Result pattern | Services use `Result<T, E>`, no generic try/catch for expected flows |

### C — Architecture Gates (for code that touches system boundaries)

| # | Gate | Verification |
|---|------|-------------|
| C1 | Core package has no infrastructure imports | `packages/core` does not import Prisma, Express, Tesseract, Ollama, Puppeteer or any concrete implementation |
| C2 | Adapters implement defined interfaces | Every adapter implements the port interface from `packages/core` |
| C3 | No cross-app imports | Apps do not import from other apps |
| C4 | No plugin-to-app imports | Plugins do not import from apps |
| C5 | No circular dependencies | Verify dependency graph has no cycles |
| C6 | New interfaces documented | Any new port/interface has JSDoc describing its contract |

### D — Documentation Gates (for documentation tasks)

| # | Gate | Verification |
|---|------|-------------|
| D1 | Consistent with decision hierarchy | Document does not contradict higher-level documents |
| D2 | Correct location | File is placed in the correct folder per `project-structure.md` |
| D3 | No assumptions documented as facts | Uncertain items are marked as open questions |
| D4 | Cross-references valid | All references to other documents point to existing files |

### E — Git Gates (for any deliverable)

| # | Gate | Verification |
|---|------|-------------|
| E1 | Conventional Commit format | Commit message follows `<type>(<scope>): <description>` |
| E2 | Scope is correct | Scope matches affected package/app |
| E3 | Only relevant files staged | No unrelated changes included |
| E4 | No `.env` files committed | Environment files with real values are excluded |

---

## Applicability Matrix

| Task type | A (Compliance) | B (Code) | C (Architecture) | D (Docs) | E (Git) |
|-----------|:-:|:-:|:-:|:-:|:-:|
| Implementation | ✔ | ✔ | ✔ | — | ✔ |
| Bug fix | ✔ | ✔ | ✔ | — | ✔ |
| Documentation | ✔ | — | — | ✔ | ✔ |
| Refactoring | ✔ | ✔ | ✔ | — | ✔ |
| New adapter/plugin | ✔ | ✔ | ✔ | ✔ | ✔ |
| Spec creation | ✔ | — | — | ✔ | ✔ |

---

## Failure Handling

If a gate fails:

1. **Do not deliver.** Fix the issue first.
2. If the fix is within your autonomous scope, apply it and re-verify.
3. If the fix requires an architectural decision or technology change, stop and report.
4. Never bypass a gate. Never mark a gate as "will fix later."

---

## Verification Checklist Template

Before delivering, mentally verify each applicable gate:

```
[ ] A1 — No unapproved technologies
[ ] A2 — Architecture boundaries respected
[ ] A3 — No contradiction with Project Identity
[ ] A4 — No contradiction with Steering
[ ] A5 — Scope matches Spec
[ ] A6 — No sensitive data exposed
[ ] B1 — TypeScript compiles
[ ] B2 — Lint passes
[ ] B3 — Formatting applied
[ ] B4 — Tests pass
[ ] B5 — No `any` types
[ ] B6 — Named exports
[ ] B7 — Naming conventions
[ ] B8 — Error handling pattern
[ ] C1 — Core has no infra imports
[ ] C2 — Adapters implement interfaces
[ ] C3 — No cross-app imports
[ ] C4 — No plugin-to-app imports
[ ] C5 — No circular deps
[ ] C6 — New interfaces documented
[ ] E1 — Conventional Commit
[ ] E2 — Correct scope
[ ] E3 — Only relevant files
[ ] E4 — No .env committed
```

---

# End of Document
