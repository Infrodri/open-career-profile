# project/glossary/

## Purpose

This folder contains the domain glossary — the official definitions of terms used throughout the project.

A shared glossary eliminates ambiguity in communication between contributors, documentation, code, and AI agents.

---

## Why It Exists

In a domain-driven project, precise terminology is essential. Terms like "Professional Profile," "output," "evidence," and "template" have specific meanings in this project that may differ from common usage.

---

## When It Will Be Used

This folder will be populated when:

- The domain model is formally defined (during or after Architecture phase).
- A term creates ambiguity or is used inconsistently across documents.
- New contributors need onboarding material.

---

## Future Contents

- **GLOSSARY.md** — Master glossary of domain terms with definitions and usage examples.

Example entries:

| Term | Definition | NOT to be confused with |
|------|-----------|------------------------|
| Professional Profile | The single source of truth containing all professional information of a user | A resume or CV |
| Output | A document generated from the Professional Profile (e.g., CV, portfolio) | The profile itself |
| Evidence | A document that supports a claim in the profile (e.g., diploma, certificate) | The profile data |
| Adapter | An implementation of a port interface that connects the domain to infrastructure | A plugin |
| Plugin | A community extension that adds new functionality to the platform | An adapter |

---

## Rules

- Every domain term used in code should be defined here.
- Definitions must be consistent with `project-identity.md`.
- The glossary is the authority on terminology — code and docs must match it.
