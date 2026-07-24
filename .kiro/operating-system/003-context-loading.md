# 003 — Context Loading

> This document defines the official context loading sequence every AI agent must follow before beginning any work.

---

## Purpose

Correct context loading ensures the agent operates with full awareness of the project's identity, current state, rules, architecture and planned work. Loading documents in the wrong order risks operating on stale assumptions or violating project constraints.

---

## Official Loading Sequence

Every AI agent must load context in this exact order:

```
1. project/manifest/PROJECT_MANIFEST.md
2. project/context/PROJECT_STATUS.md
3. .kiro/steering/
4. .kiro/operating-system/
5. project/decisions/
6. project/roadmap/
7. specs/
```

---

## Why This Order

### 1. Project Manifest — WHO are we?

**Location:** `project/manifest/PROJECT_MANIFEST.md`

Load first because it establishes the project's identity, mission, and boundaries. Without this context, the agent cannot evaluate whether subsequent documents are consistent or whether a task is even appropriate for this project.

This document answers: What is this project? What is it not? What are the non-negotiable principles?

---

### 2. Project Status — WHERE are we right now?

**Location:** `project/context/PROJECT_STATUS.md`

Load second because it provides the current snapshot: what phase we are in, what task is active, what is blocked, and what comes next. This prevents the agent from attempting work that is out of phase or already completed.

This document answers: What phase is active? What was the last thing done? What is blocked?

---

### 3. Steering — HOW do we work?

**Location:** `.kiro/steering/` (all files)

Load third because steering defines the permanent rules of engagement: architecture principles, approved technologies, development conventions, and project structure. These constraints govern everything the agent does.

This document answers: What technologies are approved? What patterns must be followed? What conventions apply?

Key files:
- `project-identity.md` — highest authority document (overrides everything)
- `architecture.md` — architectural principles and permanent constraints
- `tech-stack.md` — approved technologies
- `development-rules.md` — coding and process conventions
- `project-structure.md` — folder organization and dependency rules
- `product-vision.md` — product scope and vision

---

### 4. Operating System — WHAT are the agent's rules?

**Location:** `.kiro/operating-system/` (all files)

Load fourth because these documents define how the agent itself must behave: its role, process, quality gates, and definition of done.

**Why AFTER Steering?** The Operating System documents reference Steering content directly (e.g., "do not contradict `project-identity.md`", "use only technologies from `tech-stack.md`", "follow conventions in `development-rules.md`"). Those references are meaningless unless the agent has already loaded the Steering documents they point to. Steering provides the WHAT; Operating System provides the HOW of agent behavior within those constraints.

This document answers: What is my role? What process do I follow? What quality standards apply?

---

### 5. Decisions — WHAT was decided and why?

**Location:** `project/decisions/`

Load fifth because ADRs document specific architectural decisions with context and rationale. They explain why certain choices were made, which is essential when the agent needs to extend or work alongside those decisions.

This document answers: What architectural decisions have been made? What was the reasoning?

---

### 6. Roadmap — WHAT is planned?

**Location:** `project/roadmap/`

Load sixth because the roadmap provides future direction. Understanding what comes next helps the agent make decisions that don't create obstacles for planned work.

This document answers: What is planned? What is the sequence of future work?

---

### 7. Specs — WHAT am I building right now?

**Location:** `.kiro/specs/` (only the active spec for the current task)

> **Note:** This folder does not exist yet. It will be created when the first Spec is authored. Until then, this step is skipped during context loading.

Load last because specs are task-specific. The agent needs all prior context to properly interpret and execute a spec. Only load the spec relevant to the current task — not all specs.

This document answers: What are the requirements? What is the design? What tasks must I complete?

---

## Rules

1. **Never skip steps 1-4.** These are mandatory for every session regardless of task type.

2. **Steps 5-6 are mandatory if they contain content.** Empty files may be noted and skipped.

3. **Step 7 is task-specific.** Only load the active spec relevant to the current work.

4. **If `project-identity.md` exists in steering, it takes absolute precedence over all other documents.** It is the highest authority in the repository.

5. **If a document does not exist or is empty**, note its absence but continue. Do not create missing documents unless explicitly instructed.

6. **If a document contradicts a higher-priority document**, the higher-priority document wins (see `005-decision-hierarchy.md`).

---

## Context Refresh

If the session context is compacted or reset:

1. Re-read `project/manifest/PROJECT_MANIFEST.md` (or `project-identity.md` if manifest is empty).
2. Re-read `project/context/PROJECT_STATUS.md`.
3. Re-read the active task or Spec.
4. Re-read any source files you were modifying.
5. Confirm your position in the working process before continuing.

---

## What NOT to Load

- Implementation code unrelated to the current task.
- Other projects' documentation.
- External documentation (unless the task explicitly requires research).
- Archived or deprecated Specs (unless investigating history).
- Files not part of the official loading sequence without explicit instruction.

---

# End of Document
