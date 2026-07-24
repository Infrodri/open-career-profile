# Architecture Principles

> Permanent constraints. Changes require an ADR.

---

## Offline First

No core workflow requires network connectivity.

## Privacy First

All processing happens locally. Data never leaves the machine without explicit user action.

## Local Processing

The entire stack runs on the user's machine.

## Domain First

The Professional Profile is the central concept. Architecture revolves around the domain, not infrastructure.

## Ports & Adapters

Business logic defines interfaces (ports). Concrete implementations (adapters) satisfy those contracts. Business logic never imports infrastructure directly.

## Plugin Architecture

Extensions via plugins/adapters. The following are replaceable:
- OCR engines
- AI providers
- Render engines
- Validation engines
- Templates

## Single Source of Truth

The Professional Profile is the only permanent data. Outputs are derived and disposable.

## Modular Monorepo

Clear separation of responsibilities. Explicit dependencies between packages.

---

## Dependency Rules

- Apps never import from other apps.
- Plugins never import from apps.
- Core never imports concrete implementations.
- No circular dependencies.

---

# End of Document
