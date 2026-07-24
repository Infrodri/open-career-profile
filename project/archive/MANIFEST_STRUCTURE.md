# MANIFEST_STRUCTURE — Structure Proposal for PROJECT_MANIFEST.md

> **Task:** TASK-002 — Manifest Research
> **Date:** 2026-07-24
> **Status:** Proposal — awaiting project owner review
> **Deliverable type:** Structural design only — no content written

---

## Purpose of the Project Manifest

The Project Manifest is the **first document loaded by any agent or contributor**. It establishes WHO the project is, WHY it exists, and WHAT boundaries define it.

It is NOT a technical document. It is a foundational identity and governance document that provides enough context to correctly interpret every other document in the repository.

### What makes it different from `project-identity.md`?

| Document | Scope | Audience | Mutability |
|----------|-------|----------|-----------|
| `project-identity.md` | Rules and constraints for AI agents. Technology decisions. Hard boundaries. | AI agents specifically | Rarely changes. Immutable principles. |
| `PROJECT_MANIFEST.md` | Project identity, context, stakeholders, domain, governance model. Human-readable project definition. | All contributors (human + AI) | Evolves as the project matures |

The Manifest answers: "If I know nothing about this project, what do I need to understand before I can contribute?"

`project-identity.md` answers: "What rules must I never break?"

They are complementary, not duplicative.

---

## Proposed Table of Contents

```
1. Project Overview
2. Problem Statement
3. Domain Definition
4. Stakeholders
5. Core Principles (immutable)
6. Boundaries
7. Governance Model
8. Document Map
9. Terminology Standard
10. Versioning and Evolution
11. Reserved Sections
```

---

## Section Descriptions

### 1. Project Overview

**Purpose:** Provide a one-paragraph summary of the project that any person can understand in 30 seconds.

**Must include:**
- Project name
- One-sentence mission
- Project type (open source, local-first, extensible)
- Current phase
- License

**Risk if omitted:** Contributors cannot quickly assess what the project is or whether their contribution is relevant.

---

### 2. Problem Statement

**Purpose:** Define the specific problem the project solves. Not the vision (that's aspirational) — the concrete pain that justifies the project's existence.

**Must include:**
- Who has this problem
- What the current situation looks like
- Why existing solutions fail
- What specific gap this project fills

**Risk if omitted:** Contributors build features that solve adjacent problems but miss the core purpose. Architecture decisions lose their grounding.

---

### 3. Domain Definition

**Purpose:** Formally define the domain concepts that form the backbone of the system. This is the authoritative source for domain language.

**Must include:**
- Core concept: Professional Profile (what it is, what it contains, what it is NOT)
- Supporting concepts: Evidence, Output, Section, Template, Adapter, Plugin
- Relationships between concepts (e.g., "an Output is derived from a Professional Profile")
- Explicit disambiguation (Professional Profile ≠ Resume ≠ CV ≠ Portfolio)

**Risk if omitted:** Contributors (especially AI agents) use domain terms inconsistently. "Profile" means different things in different contexts. Generated outputs get confused with the source of truth.

**Dependency:** This section feeds directly into `project/glossary/`.

---

### 4. Stakeholders

**Purpose:** Identify who the project serves and who governs it.

**Must include:**
- Primary users (who benefits from the software)
- Community contributors (who extends the platform)
- Project owner / governance structure
- Decision-making authority (who approves ADRs, Specs, technology changes)

**Risk if omitted:** Agents and contributors don't know who to ask when decisions are needed. Authority is ambiguous.

---

### 5. Core Principles (immutable)

**Purpose:** List the principles that will NEVER change without a fundamental rethinking of the project. These are constitutional — not preferences.

**Must include:**
- Privacy First
- Offline First
- Single Source of Truth
- Evidence Driven
- AI Optional
- Plugin First
- Open Source First

**Format:** Each principle should have:
- A one-sentence declaration
- Why it is immutable (what breaks if violated)
- The boundary it creates

**Risk if omitted:** Principles are treated as suggestions rather than constraints. Future contributors relax boundaries incrementally until the project loses its identity.

**Relationship with Steering:** `architecture.md` references these principles as architectural constraints. The Manifest establishes them; Steering enforces them technically.

---

### 6. Boundaries

**Purpose:** Explicitly state what the project IS and IS NOT. Define the edges of scope permanently.

**Must include:**
- What the project IS (positive scope)
- What the project IS NOT (negative scope — equally important)
- What might be considered in the future (growth vectors)
- What will NEVER be considered (hard exclusions)

**Risk if omitted:** Scope creep. Features get proposed that contradict the project identity. AI agents implement requirements that push the project toward being a SaaS or a resume builder.

---

### 7. Governance Model

**Purpose:** Define how the project is governed, how decisions are made, and what process changes require.

**Must include:**
- Development model (AI Assisted Development)
- Decision authority (who approves what)
- Change process (what requires an ADR, what requires a Spec)
- Document hierarchy (reference to `005-decision-hierarchy.md`)
- Contribution model (how external contributors interact)

**Risk if omitted:** No clear authority model. Agents don't know when to escalate. Contributions arrive without process alignment.

**Relationship with Operating System:** The Operating System defines HOW agents execute. The Manifest defines WHO governs and HOW decisions flow at the project level.

---

### 8. Document Map

**Purpose:** Provide a navigational map of all governance documentation. A contributor reading the Manifest should know exactly where to find any information.

**Must include:**
- Table of all governance documents with purpose and location
- Context loading sequence (reference to `003-context-loading.md`)
- Which documents are mutable vs immutable
- Who owns each document

**Risk if omitted:** Contributors waste time searching for the right document or create new documents that duplicate existing ones.

---

### 9. Terminology Standard

**Purpose:** Establish the canonical terms the project uses and the terms it explicitly rejects.

**Must include:**
- Official terms with definitions (Professional Profile, Output, Evidence, etc.)
- Rejected terms and why (Resume Builder, CV Manager, etc.)
- Language policy (code in English, project docs in Spanish, etc.)
- Reference to full glossary (`project/glossary/`)

**Risk if omitted:** Inconsistent terminology across documents. AI agents default to common industry terms ("resume", "CV") instead of project-specific terms.

---

### 10. Versioning and Evolution

**Purpose:** Define how the Manifest itself evolves. What changes require a new version? What is the process?

**Must include:**
- Versioning strategy for the Manifest (semantic? date-based?)
- What constitutes a breaking change to the Manifest
- Process for proposing Manifest changes
- History of significant changes (or pointer to changelog)

**Risk if omitted:** The Manifest becomes stale because no one knows the process to update it. Or it changes too frequently without traceability.

---

### 11. Reserved Sections

**Purpose:** Reserve space for sections that are not needed now but will be needed as the project grows.

**Suggested reservations:**
- Community Guidelines (when external contributors join)
- Licensing Details (when plugins have separate licenses)
- Integration Partners (when third-party integrations are formalized)
- Compliance Requirements (if the project enters regulated domains)
- Internationalization Strategy (when multi-language support is considered)

**Risk if omitted:** Future growth requires restructuring the Manifest, breaking established reference patterns.

---

## Dependencies Between Sections

```
1. Project Overview ──────────── (standalone, no dependencies)
         │
2. Problem Statement ─────────── depends on: Overview (context)
         │
3. Domain Definition ─────────── depends on: Problem Statement (what we're solving)
         │
4. Stakeholders ──────────────── depends on: Problem Statement (who has the problem)
         │
5. Core Principles ──────────── depends on: Domain Definition (what we protect)
         │
6. Boundaries ────────────────── depends on: Principles (what boundaries they create)
         │
7. Governance Model ─────────── depends on: Stakeholders (who decides), Principles (what governs)
         │
8. Document Map ──────────────── depends on: Governance (where things live)
         │
9. Terminology Standard ──────── depends on: Domain Definition (what terms mean)
         │
10. Versioning ───────────────── depends on: Governance (how changes happen)
         │
11. Reserved Sections ────────── depends on: Boundaries (growth vectors)
```

---

## Recommended Writing Order

| Order | Section | Rationale |
|-------|---------|-----------|
| 1st | 3. Domain Definition | Everything else depends on precise domain language. Without it, other sections use vague or inconsistent terms. |
| 2nd | 2. Problem Statement | Grounds the project in reality. Informs what principles protect and what boundaries exclude. |
| 3rd | 5. Core Principles | These are mostly defined in `project-identity.md` already. Formalize them with "why immutable" rationale. |
| 4th | 6. Boundaries | Derives directly from principles. Defines scope edges. |
| 5th | 1. Project Overview | Can now be written with precision because domain, problem, and principles are clear. |
| 6th | 4. Stakeholders | Identifies who the problem affects and who governs the solution. |
| 7th | 7. Governance Model | Requires stakeholders and principles to be defined first. |
| 8th | 9. Terminology Standard | Formal codification of terms established in Domain Definition. |
| 9th | 8. Document Map | Written last among active sections because all other documents must exist first. |
| 10th | 10. Versioning | Meta-section, written after the Manifest structure is stable. |
| 11th | 11. Reserved Sections | Placeholder, written last. |

---

## Relationship with Other Documents

### Relationship with Steering

| Manifest | Steering |
|----------|----------|
| Defines identity and principles | Enforces principles technically |
| Says "Privacy First is immutable" | Says "all data stays local, use Helmet for Express, no external API calls" |
| Says "the domain concept is Professional Profile" | Says "name the core package `packages/core`, use PascalCase for domain types" |
| Read FIRST in context loading | Read THIRD in context loading |

**Rule:** Steering must be consistent with the Manifest. If Steering contradicts the Manifest, the Manifest wins (subject to `project-identity.md` as highest authority).

### Relationship with ADRs

| Manifest | ADRs |
|----------|------|
| Defines what is immutable | Record specific decisions that implement or extend the Manifest |
| Says "Plugin First is a core principle" | Records "ADR-003: We chose adapter pattern for OCR because of Plugin First principle" |
| Does not change with individual decisions | Each ADR references which Manifest principle it supports |

**Rule:** An ADR cannot contradict a Manifest principle unless the Manifest itself is formally amended first.

### Relationship with Specs

| Manifest | Specs |
|----------|-------|
| Defines domain concepts and boundaries | Defines specific features within those boundaries |
| Says "Output is derived from Professional Profile" | Says "Spec-005: Implement PDF generation from profile sections X, Y, Z" |
| Provides terminology that Specs must use | Specs reference Manifest terms for consistency |

**Rule:** A Spec that uses terms not defined in the Manifest (or its glossary) should trigger a terminology update before implementation.

---

## Concepts That Require Formal Definitions

These terms MUST be formally defined in the Manifest (section 3 + section 9):

| Concept | Why it needs formal definition |
|---------|-------------------------------|
| Professional Profile | Core concept of the entire system. Must be unambiguous. |
| Output | Distinguished from the Profile itself. Prevents source-of-truth confusion. |
| Evidence | Unique to this project. Not a common industry term in this context. |
| Section (of a profile) | Defines the atomic units of professional information. |
| Template | Must be distinguished from "theme" or "layout" — it's a generation format. |
| Adapter | Must be distinguished from Plugin. Has a specific architectural meaning. |
| Plugin | Must be distinguished from Adapter. Adds new capability vs implements a port. |
| Port | Technical term from hexagonal architecture. Needs project-specific definition. |
| Source of Truth | Has a very specific meaning in this project (the Profile, never the outputs). |

---

## Risks if the Manifest is Not Written

| # | Risk | Impact | Likelihood |
|---|------|--------|-----------|
| 1 | Agents read `project-identity.md` as both rules AND identity, conflating two concerns | Medium | High (already happening) |
| 2 | Domain terms drift between documents as the project grows | High | High |
| 3 | New contributors (human or AI) have no single entry point to understand the project | Medium | Certain |
| 4 | Governance model remains implicit — authority questions arise with each decision | High | High |
| 5 | Principles are treated as guidelines rather than immutable constraints | High | Medium |
| 6 | Scope creep through well-intentioned features that violate boundaries | High | Medium |
| 7 | The relationship between Manifest, Steering, ADRs, and Specs remains informal | Medium | Already true |

---

## Open Questions for Project Owner

1. Should the Manifest be written in English or Spanish? (It's step 1 for all contributors including potential international community.)
2. Should section 5 (Core Principles) literally copy from `project-identity.md`, or reference it? (Duplication risk vs self-contained readability.)
3. Is there a governance structure beyond "project owner decides everything"? (Needed for section 7.)
4. Should the Manifest define the MVP scope, or leave that to `product-vision.md`? (Scope overlap risk.)
5. What level of domain modeling is appropriate for the Manifest vs a dedicated domain model document in `project/architecture/`?

---

# End of Document
