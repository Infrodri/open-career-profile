# Manifest Review Notes

> **Task:** TASK-003b — Project Manifest Draft
> **Date:** 2026-07-24
> **Status:** Awaiting architectural approval

---

## What Was Done

Created the first draft of `project/manifest/PROJECT_MANIFEST.md` following the structure defined in `MANIFEST_STRUCTURE.md` and using only information already approved in existing project documents.

---

## Sources Used

| Source | What was drawn from it |
|--------|----------------------|
| `project-identity.md` | Mission, principles, boundaries, technology reference (not duplicated — referenced) |
| `MANIFEST_STRUCTURE.md` | Section structure, section ordering, relationships |
| `DOMAIN_DISCOVERY.md` | Domain concepts, terminology, relationships |
| `product-vision.md` | Problem statement, users, scope context |

---

## Design Decisions Made

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Written in English | The Manifest is the first document for ALL contributors including potential international community. However, this contradicts the language policy (project docs in Spanish). Flagged for review. |
| 2 | Principles include "Why immutable" and "Boundary" | Per MANIFEST_STRUCTURE.md recommendation. Makes each principle actionable rather than aspirational. |
| 3 | Domain Definition is simplified from DOMAIN_DISCOVERY.md | The Manifest needs essentials only. Full domain analysis remains in `project/domain/`. |
| 4 | Document hierarchy differs slightly from `005-decision-hierarchy.md` | The Manifest places itself at level 2 (below project-identity, above Operating System). This reflects its role as the broader identity document while project-identity.md retains absolute authority for AI agents. Needs alignment review. |
| 5 | No technology mentioned in the Manifest | The task explicitly prohibits technology choices. The Manifest answers WHAT, not HOW. |
| 6 | Growth vectors listed but not committed | These are possibilities, not promises. They signal where the project might evolve without creating expectations. |

---

## Potential Conflicts to Review

### Conflict 1: Document Hierarchy

The `005-decision-hierarchy.md` (Operating System) defines:
```
Level 1: project-identity.md
Level 2: Operating System
Level 3: Steering
```

The Manifest places itself at Level 2 (above Operating System, below project-identity). This creates a discrepancy.

**Recommendation:** Update `005-decision-hierarchy.md` to formally include the Manifest. Proposed hierarchy:
```
Level 1: project-identity.md
Level 2: PROJECT_MANIFEST.md
Level 3: Operating System
Level 4: Steering
Level 5: ADRs
Level 6: Specs
Level 7: Code
Level 8: Autonomous decisions
```

**Action required:** Project owner must decide where the Manifest sits in the hierarchy.

---

### Conflict 2: Language

The development rules state: "Documentación de proyecto: español."

The Manifest is written in English because:
- It is the first document for all contributors (potentially international).
- Domain terms are in English (Professional Profile, Evidence, Output).
- The domain discovery and structure proposal were both in English.

**Recommendation:** The Manifest should remain in English. Project governance docs in `project/` may use English while Steering docs in `.kiro/steering/` use Spanish. Or: standardize on one language for all docs.

**Action required:** Project owner must decide the language policy for the Manifest.

---

### Conflict 3: Duplication with product-vision.md

The Manifest's section 2 (Problem Statement) and section 6 (Boundaries) overlap with `product-vision.md`. Specifically:
- "What the project IS / IS NOT" appears in both
- Problem description appears in both
- Users/stakeholders appear in both

**Options:**
- (A) Accept controlled duplication — Manifest is self-contained, product-vision adds MVP scope and metrics.
- (B) Slim product-vision.md to only MVP scope and metrics, removing identity content.

**Recommendation:** Option B. The Manifest is now the canonical source for identity content. `product-vision.md` should focus exclusively on: MVP scope, metrics of success, and tactical product decisions.

**Action required:** Project owner decision. If approved, `product-vision.md` should be slimmed in a future task.

---

## What Was NOT Done (by design)

- No technology decisions made
- No architecture decisions made
- No database models created
- No APIs defined
- No domain entities formalized (that belongs to domain modeling phase)
- No Specs created
- No implementation code written
- No Steering documents modified
- No Operating System documents modified

---

## Risks

| # | Risk | Mitigation |
|---|------|-----------|
| 1 | Manifest hierarchy position is undecided | Flagged for project owner review |
| 2 | Language inconsistency | Flagged for project owner decision |
| 3 | Duplication with product-vision.md | Recommendation provided; awaiting decision |
| 4 | Domain section is simplified | Full domain analysis preserved in `project/domain/DOMAIN_DISCOVERY.md` |

---

## Recommended Next Steps

1. Project owner reviews and approves the Manifest.
2. Decision on language policy (English vs Spanish for project docs).
3. Decision on document hierarchy (where does Manifest sit?).
4. Decision on product-vision.md scope reduction.
5. Once Manifest is approved: create ADR-001 to formalize technology decisions.
6. Then: domain modeling based on approved concepts.

---

# End of Document
