# Open Career Profile

Open Source platform to build, manage and maintain a Professional Profile as a single source of verifiable information — locally and privately.

---

## What is this?

Open Career Profile allows any person to build a **Master Professional Profile** that acts as the single source of truth for all their career information.

From this profile, different documents can be generated (CVs, portfolios, institutional formats) without re-entering information.

The system also allows incorporating new information by uploading documents, certificates or images, automatically extracting relevant data for the user to validate before storing.

---

## Problem

Professional information is scattered across multiple documents: IDs, academic degrees, certificates, contracts, old resumes, PDFs, photos. Every new application requires gathering this information again, verifying dates, filling forms, and adapting content to different formats.

---

## Solution

A **Master Professional Profile** as the only source of truth. Generate any document from it. Never recreate information manually again.

---

## Principles

- **Open Source** — public project, community contributions welcome
- **Local First** — all information stays on the user's computer
- **Offline First** — works completely without internet
- **Privacy First** — personal documents never sent to external services
- **Single Source of Truth** — the Profile is the only official source
- **AI Assisted** — AI is optional, improves productivity, never required
- **Plugin First** — modular and extensible architecture

---

## Scope

The system manages:

- Personal information
- Education and academic background
- Work experience
- Certifications
- Courses
- Languages
- Skills
- References
- Supporting documents
- Professional evidence

---

## System Flow

```
User
 ↓
Upload documents
 ↓
Processing (OCR extraction)
 ↓
User validates extracted data
 ↓
Professional Profile updated
 ↓
Generate required document (CV, portfolio, institutional format)
```

---

## Technology

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM, Docker |
| Frontend | React, Vite |
| OCR | Tesseract.js |
| AI (optional) | Ollama |
| PDF Generation | Puppeteer |
| Version Control | Git, GitHub |

---

## Expected Result

Any user can:

1. Create their Professional Profile.
2. Add information via documents or forms.
3. Validate automatically extracted data.
4. Keep their profile updated.
5. Generate different professional documents from the same profile.
6. Keep all information private and local.

---

## Current Phase

**Planning** — architecture approved, preparing first functional specification.

---

## License

Apache License 2.0
