# Project Manifest — Open Career Profile

> This is the first document any contributor (human or AI) should read.
> It answers: "What is Open Career Profile?"
> It does NOT answer: "How will it be implemented?"
>
> For implementation rules, see `.kiro/steering/`.
> For AI agent behavior rules, see `.kiro/steering/project-identity.md`.

---

## 1. Project Overview

**Open Career Profile** is an Open Source platform that allows any person to build, maintain and evolve a Professional Profile locally and privately.

| Property | Value |
|----------|-------|
| Name | Open Career Profile |
| Type | Open Source Platform |
| License | Apache License 2.0 |
| Model | Local-first, Offline-first, Privacy-first |
| Development | AI Assisted Development |
| Phase | Architecture Definition |

The system manages professional information. It does not manage resumes. A resume is one possible output generated from the Professional Profile.

---

## 2. Problem Statement

### Who has this problem

Every working professional.

### The current situation

Professional information is scattered across proprietary platforms that control the data. People maintain multiple profiles (LinkedIn, job portals, university databases, government records) with no single authoritative source.

When someone needs a CV, a portfolio, or an institutional format, they recreate the information from memory or from outdated documents. There is no traceability between claims and their supporting evidence.

### Why existing solutions fail

- They are cloud-only — users lose access without internet.
- They are vendor-locked — data cannot be exported in a useful format.
- They treat the CV as the product — confusing the output with the source.
- They offer no evidence linking — information is declared but unverifiable.
- They are not extensible — institutions cannot create their own formats.

### The gap this project fills

An open, local, extensible system where the Professional Profile is the permanent source of truth, and any document (CV, portfolio, institutional format) is merely a derived output.

---

## 3. Domain Definition

### Core Concept: Professional Profile

A Professional Profile is the structured, persistent, authoritative collection of all professional information belonging to one person. It is the single source of truth.

A Professional Profile:
- Exists independently of any document generated from it.
- May exist without a CV, without a portfolio, without any output.
- IS the data. Outputs are derived views.
- Belongs entirely to its owner. No external service controls it.

### Supporting Concepts

| Concept | Definition | Is NOT |
|---------|-----------|--------|
| Profile Section | A thematic grouping within the Profile (e.g., Work Experience, Education, Skills) | A page or a tab — it is a logical grouping of data |
| Entry | A single item within a Section (one job, one degree, one certification) | The entire section |
| Source Document | A file (physical or digital) containing original professional information | Profile data — it is the raw origin of data |
| Evidence | A link between a Profile entry and a Source Document that supports it | Proof of truth — it is a link showing provenance |
| Output | A document generated FROM the Professional Profile using a Template | The source of truth — it is always a derived artifact |
| Template | A presentation specification that defines how Profile data becomes an Output | A theme or layout — it is a generation format with rules |
| Institution | An organization referenced in the Profile (employer, university, certifying body) | Comprehensive organization data — only what is relevant to the person |
| Time Period | The temporal boundaries of a professional event | Always required — some entries have no time |

### Key Relationships

- A person owns exactly one Professional Profile.
- A Profile contains Sections. Sections contain Entries.
- Source Documents are uploaded by the owner.
- Evidence links Entries to Source Documents (optional but encouraged).
- Templates define how to arrange Profile data into Outputs.
- Outputs are generated on demand. They are snapshots, not live views.

### Critical Disambiguation

| Term | Meaning in this project | Common misunderstanding |
|------|------------------------|------------------------|
| Professional Profile | The permanent data source | "A fancy resume" — NO |
| Output | A derived document (CV, portfolio) | "The main product" — NO, the Profile is the product |
| Evidence | A provenance link | "Proof that something is true" — NO, it is a link to origin |
| Source of Truth | Always the Professional Profile | "The latest generated CV" — NEVER |

---

## 4. Stakeholders

### Primary Users

| Who | Need |
|-----|------|
| Any professional | Maintain a single, private, local source of truth for their career |
| Career-changing professionals | Organize and present their experience in multiple formats |
| Academic professionals | Generate academic profiles and publication lists |
| People in regulated fields | Produce institution-specific or government-required formats |

### Community

| Who | Role |
|-----|------|
| Template creators | Design new output formats for different contexts |
| Plugin developers | Extend the platform with new capabilities (OCR, AI, import, export) |
| Institutional contributors | Create format standards for their organizations |

### Governance

| Who | Authority |
|-----|-----------|
| Project owner | All architectural decisions, ADR approval, Spec approval, Manifest changes |
| AI agents | Implementation within approved Specs only, under Operating System rules |
| Community contributors | Submit proposals via PRs, subject to project owner approval |

---

## 5. Core Principles

These principles are immutable. They define what Open Career Profile IS. Violating any of them changes the fundamental nature of the project.

### Privacy First

Personal information belongs to the user. No cloud dependency is required. Everything must work locally.

**Why immutable:** If privacy is optional, users cannot trust the system with sensitive career data. The project becomes just another cloud platform.

**Boundary:** No feature may require sending user data to an external service.

---

### Offline First

The application must continue working without Internet access. Cloud synchronization may exist in the future but must always remain optional.

**Why immutable:** If offline breaks, the "local-first" promise is meaningless. Users in restricted networks, traveling, or in areas with poor connectivity would be excluded.

**Boundary:** No core workflow may require network connectivity.

---

### Single Source of Truth

The Professional Profile is the only permanent source of information. Generated documents must never become the source of truth.

**Why immutable:** If outputs become sources, data fragments and diverges. Users end up with 5 versions of their CV, each slightly different, none authoritative.

**Boundary:** No Output may modify or feed back into the Profile. Data flows one direction: Profile → Output.

---

### Evidence Driven

Every piece of information stored in the profile should be traceable to its original document whenever possible.

**Why immutable:** Without provenance, a Professional Profile is just another self-declared document. Evidence linking differentiates this from every other profile system.

**Boundary:** Evidence is always optional (never blocking), but the system must always provide the capability.

---

### AI Optional

Artificial Intelligence exists only to improve productivity. The system must remain fully functional without AI.

**Why immutable:** If AI becomes required, users without AI infrastructure are locked out. The system becomes dependent on volatile, rapidly-changing technology.

**Boundary:** No feature may fail or degrade in the absence of AI. AI always enhances, never enables.

---

### Plugin First

The system must be extensible. OCR, AI, render engines, validation, institution rules, and templates must all be replaceable through plugins or adapters.

**Why immutable:** If the system is not extensible, the community cannot create custom formats. The "world's most extensible" vision is dead.

**Boundary:** Core logic never imports concrete implementations directly.

---

### Open Source First

Every architectural decision should favor transparency, documentation and community contributions.

**Why immutable:** If decisions are opaque, the community cannot contribute meaningfully. If documentation is optional, the project becomes a single-person effort.

**Boundary:** All code is public. All decisions are documented. Architecture is explained.

---

## 6. Boundaries

### What this project IS

- A Professional Profile Manager
- A local-first application
- An open source platform
- An extensible architecture with plugin support
- AI-assisted (optionally)
- Privacy-focused
- Community-driven

### What this project IS NOT

- A Resume Builder (the resume is an output, not the product)
- A SaaS platform (no cloud service, no subscription)
- A cloud-only application (works entirely offline)
- An AI-dependent product (works fully without AI)
- Vendor locked (all data exportable, all components replaceable)

### Growth Vectors (may be explored in the future)

- Optional cloud synchronization between devices
- Multi-profile support (academic + industry)
- Collaborative workflows (career counselors)
- Template marketplace or registry
- Institutional verification of evidence
- Import from external platforms (LinkedIn, GitHub)

### Hard Exclusions (will NEVER be this project)

- A social network or profile-sharing platform
- A job matching or recruitment tool
- A platform that sells or monetizes user data
- A system that requires internet to create or edit a profile
- A system that requires AI to function

---

## 7. Governance Model

### Development Model

AI Assisted Development. AI agents perform implementation work under strict governance rules. The project owner makes all architectural, technology, and scope decisions.

### Decision Authority

| Decision type | Who decides | Process |
|--------------|-------------|---------|
| Principles and identity | Project owner | Manifest amendment |
| Architecture changes | Project owner | ADR required |
| Technology changes | Project owner | ADR required |
| Feature scope | Project owner | Spec required |
| Implementation details | AI agent / contributor | Within approved Spec |

### Change Process

| Change | Requires |
|--------|----------|
| New principle or boundary | Manifest amendment (highest bar) |
| New technology or pattern | ADR (Architecture Decision Record) |
| New feature or behavior | Spec (requirements → design → tasks) |
| Bug fix or trivial change | Project owner authorization |

### Document Hierarchy

The authority of project documents, from highest to lowest:

1. `project-identity.md` — absolute authority
2. `PROJECT_MANIFEST.md` — project identity for all contributors
3. Operating System — agent behavior rules
4. Steering — technical enforcement of principles
5. ADRs — individual decisions
6. Specs — feature definitions
7. Code — implementation

See `.kiro/operating-system/005-decision-hierarchy.md` for conflict resolution rules.

---

## 8. Document Map

| Document | Location | Purpose | Mutable? |
|----------|----------|---------|----------|
| Project Identity | `.kiro/steering/project-identity.md` | Highest authority. AI rules. Technology decisions. | Rarely |
| Project Manifest | `project/manifest/PROJECT_MANIFEST.md` | Project identity for all contributors | Evolves |
| Project Status | `project/context/PROJECT_STATUS.md` | Current state snapshot | Frequently |
| Architecture Principles | `.kiro/steering/architecture.md` | Permanent constraints | Rarely |
| Tech Stack | `.kiro/steering/tech-stack.md` | Approved technologies | Via ADR only |
| Development Rules | `.kiro/steering/development-rules.md` | Coding conventions | Evolves |
| Project Structure | `.kiro/steering/project-structure.md` | Folder organization | Evolves |
| Product Vision | `.kiro/steering/product-vision.md` | Scope and MVP | Evolves |
| Agent Operating System | `.kiro/operating-system/` | How agents work | Rarely |
| ADRs | `project/decisions/` | Architectural decisions | Append-only |
| Domain Discovery | `project/domain/` | Business domain analysis | Evolves |
| Roadmap | `project/roadmap/` | Planning | Frequently |
| Changelog | `project/context/CHANGELOG.md` | History | Append-only |

### Context Loading Sequence

Agents load documents in this order (see `003-context-loading.md` for rationale):

```
1. project/manifest/PROJECT_MANIFEST.md
2. project/context/PROJECT_STATUS.md
3. .kiro/steering/
4. .kiro/operating-system/
5. project/decisions/
6. project/roadmap/
7. .kiro/specs/
```

---

## 9. Terminology Standard

### Official Terms

| Term | Use this | Not this |
|------|----------|----------|
| Professional Profile | Always | "Resume", "CV", "Curriculum" (except as output names) |
| Output | When referring to generated documents | "Export", "Download", "File" |
| Evidence | When linking entries to source documents | "Proof", "Verification", "Attachment" |
| Source Document | The original file from which data is extracted | "Upload", "Attachment", "File" |
| Template | The format specification for output generation | "Theme", "Layout", "Skin" |
| Entry | A single item within a Profile Section | "Record", "Item", "Row" |
| Adapter | A plugin that implements a system-defined interface | "Driver", "Connector", "Integration" |
| Plugin | An extension that adds new capability | "Module", "Extension", "Add-on" |

### Rejected Terms (never use as project descriptors)

| Rejected term | Why |
|---------------|-----|
| Resume Builder | Implies the resume is the product. It is not. |
| CV Manager | Same confusion. The CV is an output, not the core. |
| Career Platform | Too broad. Implies social/networking features. |
| Cloud Profile | Contradicts local-first principle. |

### Language Policy

- Code: English
- Project documentation (steering, manifest, decisions): Spanish
- Code documentation (JSDoc, TypeDoc, README of packages): English
- Commits and PRs: English

---

## 10. Versioning and Evolution

### Manifest Version

This Manifest uses date-based versioning.

| Version | Date | Change |
|---------|------|--------|
| Draft 1 | 2026-07-24 | Initial draft based on approved structure |

### What Constitutes a Breaking Change

- Adding, removing, or modifying a Core Principle (section 5)
- Changing a Hard Exclusion (section 6)
- Changing the governance model (section 7)
- Redefining a core domain concept (section 3)

### Process for Changes

- Breaking changes: require explicit project owner decision and version bump
- Non-breaking additions: may be proposed by contributors and approved by project owner
- Corrections and clarifications: may be applied directly if they don't change meaning

---

## 11. Reserved Sections

The following sections are reserved for future use. They will be populated when the project reaches the appropriate maturity:

| Reserved Section | When to populate |
|-----------------|-----------------|
| Community Guidelines | When external contributors beyond the owner begin contributing |
| Licensing Details | When plugins may have separate licenses |
| Integration Partners | When third-party integrations are formalized |
| Compliance Requirements | If the project enters regulated domains |
| Internationalization Strategy | When multi-language profile support is designed |
| Accessibility Policy | When detailed a11y requirements are formalized beyond WCAG AA |

---

# End of Document
