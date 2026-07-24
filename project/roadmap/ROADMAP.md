# Roadmap — Open Career Profile

---

## Phase 1 — Consolidation (current)

- Review and approve base documentation.
- Confirm architecture and technology stack.
- Prepare repository for development.
- Establish Spec workflow.

---

## Phase 2 — Foundation

First Spec: the domain model (Professional Profile data structure).

- Define entities, relationships, and invariants.
- Implement core domain package.
- Set up monorepo tooling (pnpm, TypeScript, ESLint, Vitest).

---

## Phase 3 — Core

Specs for core functionality:

- Profile CRUD (create, read, update, delete).
- Profile sections management.
- Source documents and evidence linking.
- Persistence layer (PostgreSQL + Prisma).
- Basic API (Express).

---

## Phase 4 — Output

Specs for document generation:

- Template system design.
- Output engine (Profile data → HTML → PDF via Puppeteer).
- At least 2 templates (standard CV, minimal CV).

---

## Phase 5 — Enhancement

Specs for optional and advanced features:

- OCR extraction (Tesseract.js adapter).
- AI assistance (Ollama adapter, optional).
- Plugin system architecture.
- Additional import/export formats.

---

## Phase 6 — Polish

- Frontend UI (React + Vite).
- User experience workflows.
- Accessibility (WCAG AA).
- End-to-end testing.
- Usage documentation.

---

## Phase 7 — Release

- First stable version.
- Docker Compose setup for one-command deployment.
- Publish under Apache License 2.0.
- Community contribution guidelines.
- Continuous improvement via new Specs.

---

## How each phase works

Each phase contains one or more Specs. Each Spec follows:

```
Requirements → Design → Implementation → Verification
```

A Spec is completed end-to-end before starting the next one.
Integration and validation happen continuously, not as a separate phase.

---

# End of Document
