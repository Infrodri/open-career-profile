# Project Identity

> Highest authority document in this repository.
> If any other document contradicts this file, this file wins.

---

## Project Information

| Property | Value |
|----------|-------|
| Name | Open Career Profile |
| License | Apache License 2.0 |
| Type | Open Source |
| Phase | Planning |
| Development Model | AI Assisted |
| Repository | Monorepo |

---

## Mission

Open Career Profile is an Open Source platform that allows any person to build, maintain and evolve a Professional Profile locally and privately.

The system manages professional information.
A Resume (CV) is only one possible output generated from the Professional Profile.

---

## Core Principles

1. **Privacy First** — Personal information belongs to the user. No cloud dependency. Everything works locally.
2. **Offline First** — Works without internet. Cloud sync may exist in the future but always optional.
3. **Single Source of Truth** — The Professional Profile is the only permanent source. Generated documents are never the source.
4. **Evidence Driven** — Information should be traceable to its original document when possible.
5. **AI Assisted** — AI is optional. The system works fully without it. AI only improves productivity.
6. **Plugin First** — OCR, AI, render engines, validation, templates — all replaceable through plugins/adapters.
7. **Open Source First** — Favor transparency, documentation and community contributions.

---

## Approved Technologies

Changes require an ADR.

| Layer | Technology |
|-------|-----------|
| Backend | Express.js, TypeScript |
| Database | PostgreSQL, Docker, Prisma ORM |
| Frontend | React, Vite |
| OCR | Tesseract.js |
| AI (optional) | Ollama |
| PDF | Puppeteer |
| VCS | Git, GitHub |

---

## Architectural Rules

- Architecture must remain modular.
- Business logic must never be coupled to: OCR, Database, AI, Templates, UI.
- Every external dependency must be replaceable.
- The domain is the most stable layer.

---

## Boundaries

### This project IS

- Professional Profile Manager
- Local-first Application
- Open Source Platform
- Extensible (Plugin-based)
- AI Assisted (optional)
- Privacy-focused

### This project IS NOT

- A Resume Builder
- A SaaS Platform
- A Cloud-only Application
- An AI-dependent Product
- Vendor Locked

---

## AI Agent Rules

1. Never replace approved technologies without an ADR.
2. Never implement business logic before an approved Spec.
3. Never introduce unapproved frameworks.
4. Never duplicate the source of truth.
5. Preserve backward compatibility when possible.
6. Favor modularity over convenience.
7. Prefer interfaces over implementations.
8. Every architectural decision requires documentation.
9. If uncertain, stop and ask.
10. When any change occurs, synchronize affected documentation.

---

## Documentation Hierarchy

| Level | Documents |
|-------|-----------|
| 1 — Identity | This file (absolute authority) |
| 2 — Steering | architecture.md, tech-stack.md, development-rules.md |
| 3 — Decisions & Specs | project/decisions/, project/specs/ |
| 4 — Status | PROJECT_STATUS.md |

---

## Context Loading (for AI agents)

Read in this order at session start:
1. `.kiro/steering/project-identity.md`
2. `project/context/PROJECT_STATUS.md`
3. `.kiro/steering/` (remaining files)
4. `project/decisions/` (if any ADRs exist)
5. Active Spec (if working on one)

---

# End of Document
