# project/prompts/

## Purpose

This folder contains reusable prompts and procedural guides for AI-assisted development.

These are structured instructions that can be used to guide AI agents through recurring tasks, ensuring consistency and quality across sessions.

---

## Why It Exists

In an AI-assisted development model, certain procedures are repeated across sessions:

- Setting up a new module
- Creating a new adapter
- Writing a Spec
- Performing a code review
- Running a governance check

Documenting these as reusable procedures ensures every AI agent (regardless of session) executes them consistently.

---

## When It Will Be Used

This folder will be populated when:

- Implementation begins and recurring procedures emerge.
- A task is complex enough to benefit from a step-by-step guide.
- A new agent needs to perform a task that has been done before.

---

## Future Contents

Examples of documents that may live here:

- **create-new-adapter.md** — Step-by-step guide to create a new adapter/plugin
- **write-spec.md** — How to write a well-structured Spec
- **governance-review.md** — How to run a governance compliance check
- **module-setup.md** — How to scaffold a new module in the monorepo
- **release-checklist.md** — Steps to prepare a release

---

## Naming Convention

Files should be named as `<action-verb>-<subject>.md`:

- `create-new-adapter.md`
- `write-spec.md`
- `run-migration.md`

---

## Notes

> **Recommendation:** If this folder evolves to contain procedural playbooks rather than raw prompts, consider renaming it to `project/playbooks/` to better reflect its contents. See Architecture Review Report for details.
