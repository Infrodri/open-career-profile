# Project Identity

> **Open Career Profile** is the official identity document for the project.
>
> This document is the highest-priority source of truth for every AI agent working on this repository.
>
> If any Steering document, Spec, Design or Task contradicts this file, this file always takes precedence.

---

# Project Information

| Property | Value |
|----------|-------|
| Project Name | Open Career Profile |
| Repository | open-career-profile |
| License | Apache License 2.0 |
| Project Type | Open Source |
| Status | Architecture Phase |
| Development Model | AI Assisted Development |
| Repository Strategy | Monorepo |

---

# Project Mission

Open Career Profile is an Open Source platform that allows any person to build, maintain and evolve a professional career profile locally and privately.

The system does NOT manage resumes.

The system manages professional information.

A Resume (CV) is only one possible output generated from the Professional Profile.

---

# Long-Term Vision

Build the world's most extensible Open Source Professional Profile platform.

The architecture must allow the community to create:

- CV templates
- Institution-specific formats
- Government formats
- Professional portfolios
- Academic profiles
- Digital professional records
- Future integrations

without modifying the application core.

---

# Core Principles

## Privacy First

Personal information belongs to the user.

No cloud dependency is required.

Everything must work locally.

---

## Offline First

The application must continue working without Internet access.

Cloud synchronization may exist in the future but must always remain optional.

---

## Single Source of Truth

The Professional Profile is the only permanent source of information.

Generated documents must never become the source of truth.

---

## Evidence Driven

Every piece of information stored in the profile should be traceable to its original document whenever possible.

---

## AI Assisted

Artificial Intelligence is optional.

The system must remain fully functional without AI.

AI exists only to improve productivity.

---

## Plugin First

The system must be extensible.

OCR engines

AI providers

Render engines

Validation engines

Institution rules

Templates

must all be replaceable through plugins or adapters.

---

## Open Source First

Every architectural decision should favor transparency, documentation and community contributions.

---

# Official Technology Decisions

These technologies are officially approved.

AI agents must NOT replace them without an approved ADR.

## Backend

Express.js

TypeScript

---

## Database

PostgreSQL

Docker

Prisma ORM

---

## Frontend

React

Vite

---

## OCR

Tesseract.js

Future providers may be added through adapters.

---

## Artificial Intelligence

Ollama

Optional only.

The application must never depend on AI.

---

## PDF Generation

Puppeteer

---

## Version Control

Git

GitHub

---

# Architectural Rules

The architecture must remain modular.

Business logic must never be coupled to:

- OCR
- Database
- AI
- Templates
- UI

Every external dependency must be replaceable.

---

# What this project IS

✔ Professional Profile Manager

✔ Local-first Application

✔ Open Source Platform

✔ Extensible Architecture

✔ Plugin-based Platform

✔ AI Assisted

✔ Privacy-focused

✔ Community Driven

---

# What this project IS NOT

✘ Resume Builder

✘ SaaS Platform

✘ Cloud-only Application

✘ AI-dependent Product

✘ Vendor Locked

---

# AI Agent Rules

Every AI agent working on this repository must follow these rules.

1.

Never replace approved technologies.

2.

Never redesign the architecture without an ADR.

3.

Never implement business logic before an approved Spec.

4.

Never introduce frameworks not officially approved.

5.

Never duplicate the source of truth.

6.

Always preserve backward compatibility whenever possible.

7.

Favor modularity over convenience.

8.

Prefer interfaces over implementations.

9.

Every important architectural decision requires documentation.

10.

If uncertain, stop and ask instead of assuming.

---

# Current Phase

Current Phase:

Architecture Definition

No implementation should begin before the architecture is approved.

---

# End of Document