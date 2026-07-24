# 007 — Definition of Done

> This document defines the criteria that must be met before any unit of work can be considered complete. "Done" means fully done — not partially done, not "done pending review."

---

## Purpose

A clear Definition of Done eliminates ambiguity about whether work is finished. It protects against incomplete deliveries, untested code and undocumented decisions.

---

## Definition of Done — Implementation Task

A Spec task is done when ALL of the following are true:

### Functional Completeness

- [ ] All requirements defined in the Spec are satisfied.
- [ ] No requirement has been partially implemented.
- [ ] No requirement has been skipped without explicit approval from the project owner.
- [ ] Edge cases identified in the Spec are handled.

### Code Quality

- [ ] TypeScript compiles without errors (`tsc --noEmit`).
- [ ] ESLint passes with zero errors.
- [ ] Prettier formatting applied.
- [ ] No `any` types in new or modified code.
- [ ] Naming conventions followed per `development-rules.md`.
- [ ] Error handling uses the documented pattern (Result type for expected flows).

### Testing

- [ ] Unit tests exist for all new business logic.
- [ ] Integration tests exist for new API endpoints.
- [ ] All existing tests still pass.
- [ ] Tests cover the happy path and at least the most critical error paths.
- [ ] Test names describe the expected behavior clearly.

### Architecture

- [ ] Business logic in `packages/core` has no infrastructure imports.
- [ ] New adapters implement their corresponding port interface.
- [ ] No cross-app or plugin-to-app imports introduced.
- [ ] No circular dependencies introduced.
- [ ] New interfaces (ports) are documented with JSDoc.

### Documentation

- [ ] Public functions have JSDoc (`@param`, `@returns`, `@throws`).
- [ ] New ports/interfaces have contract documentation.
- [ ] If a local implementation decision was non-obvious, it has a brief code comment explaining "why."

### Compliance

- [ ] No unapproved technologies introduced.
- [ ] No contradiction with `project-identity.md`.
- [ ] No contradiction with Steering documents.
- [ ] Implementation does not exceed Spec scope.
- [ ] No sensitive data in code, logs or comments.

---

## Definition of Done — Bug Fix

A bug fix is done when ALL of the following are true:

- [ ] The root cause is identified and documented (in the commit message or PR description).
- [ ] The fix addresses the root cause, not just the symptom.
- [ ] A test exists that reproduces the bug and verifies the fix.
- [ ] All existing tests still pass.
- [ ] No regressions introduced.
- [ ] Code quality gates pass.
- [ ] Architecture boundaries are not violated by the fix.

---

## Definition of Done — Documentation Task

A documentation task is done when ALL of the following are true:

- [ ] Document is in the correct location per `project-structure.md`.
- [ ] Content does not contradict higher-level documents (see `005-decision-hierarchy.md`).
- [ ] All cross-references point to existing files.
- [ ] No assumptions are presented as facts.
- [ ] Open questions are explicitly marked.
- [ ] Language follows project conventions (Spanish for project docs, English for code docs).

---

## Definition of Done — New Adapter or Plugin

A new adapter or plugin is done when ALL of the following are true:

- [ ] Implements the defined port interface completely.
- [ ] Has its own `package.json` with exact dependency versions.
- [ ] Has unit tests for its functionality.
- [ ] Has a README documenting setup and usage.
- [ ] Does not import from apps or other plugins.
- [ ] Registers correctly through the plugin system.
- [ ] The system continues to function normally if this adapter/plugin is removed.

---

## Definition of Done — Spec Creation

A Spec is done (ready for review) when ALL of the following are true:

- [ ] `requirements.md` has clear, numbered, testable requirements.
- [ ] `requirements.md` lists out-of-scope items explicitly.
- [ ] `design.md` describes how requirements will be satisfied.
- [ ] `design.md` identifies which components and interfaces are involved.
- [ ] `design.md` uses only approved technologies.
- [ ] `tasks.md` has ordered, small, actionable implementation tasks.
- [ ] `tasks.md` documents dependencies between tasks.
- [ ] No contradiction with `project-identity.md` or Steering.

---

## What "Done" Does NOT Mean

- "It compiles" is not done.
- "It works on my machine" is not done.
- "Tests pass but I didn't write new ones" is not done.
- "I implemented it but it's slightly different from the Spec" is not done.
- "I'll add tests later" is not done.
- "I used a different technology but it's better" is not done.

---

## Delivery Statement

When delivering completed work, include a brief confirmation:

```
✅ Done.

- All Spec requirements satisfied.
- Quality gates passed: [list which categories applied].
- Files modified: [list].
- Decisions made within autonomous scope: [list or "none"].
- Open items: [list or "none"].
```

If any criterion cannot be met, state it explicitly. Do not claim "done" with caveats hidden.

---

# End of Document
