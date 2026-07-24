# Domain Discovery — Open Career Profile

> **Task:** TASK-003 — Domain Discovery
> **Date:** 2026-07-24
> **Status:** Proposal — awaiting architectural review
> **Scope:** Business domain analysis only. No technology, no schemas, no APIs.

---

## 1. Core Business Concepts

### 1.1 Professional Profile

The central concept of the entire system. A Professional Profile is a structured, persistent collection of all professional information belonging to one person. It is the single source of truth.

A Professional Profile exists independently of any document generated from it. It may exist without a CV, without a portfolio, without any output. The Profile IS the data. Outputs are derived views.

---

### 1.2 Profile Section

A Profile Section is a thematic grouping of information within a Professional Profile. Each section represents one dimension of a person's professional identity.

Identified sections:

- **Personal Information** — name, contact details, location, professional summary
- **Work Experience** — employment history, roles, responsibilities, achievements
- **Education** — academic degrees, diplomas, courses, training
- **Certifications** — professional certifications, licenses, accreditations
- **Skills** — technical skills, soft skills, languages, proficiency levels
- **Projects** — personal or professional projects, contributions, outcomes
- **Publications** — articles, papers, books, talks, presentations
- **Awards and Recognitions** — honors, distinctions, scholarships
- **Professional Affiliations** — memberships in professional organizations
- **Volunteering** — non-paid professional activities, community service
- **References** — professional references (optional, privacy-sensitive)

A Professional Profile may have any combination of sections. No section is mandatory except Personal Information.

---

### 1.3 Source Document

A Source Document is a physical or digital document that contains original professional information. It is the raw material from which profile data may be extracted.

Examples:
- A diploma (PDF or photo)
- An employment contract
- A certification badge
- A letter of recommendation
- A pay slip
- A course completion certificate
- A portfolio piece

A Source Document exists in the system as a stored file. It is NOT the profile data — it is the origin of data.

---

### 1.4 Evidence

Evidence is a link between a piece of profile data and the Source Document that supports it. Evidence provides provenance — it answers "where did this information come from?"

Evidence does not contain the information itself. It is a relationship that says: "this claim in section X is supported by this Source Document."

Evidence is optional. A person may add information to their profile without linking evidence. But the system should encourage and facilitate evidence linking.

---

### 1.5 Institution

An Institution is any organization that is referenced in a Professional Profile. Institutions appear in multiple contexts:

- An employer (Work Experience)
- A university or school (Education)
- A certifying body (Certifications)
- A professional organization (Affiliations)
- A client or partner (Projects)

An Institution is a reusable entity. The same institution may appear across multiple sections. It has identity (name, type) but the system does NOT manage institution data comprehensively — it only tracks what is relevant to the person's profile.

---

### 1.6 Time Period

A Time Period represents the temporal boundaries of a professional event. Most profile entries (jobs, education, certifications) have associated time periods.

A Time Period may be:
- A range (start date → end date)
- An open range (start date → present / ongoing)
- A point in time (date of certification)
- Approximate (year only, month + year)

Time is essential for ordering, chronology, and timeline generation in outputs.

---

### 1.7 Output

An Output is a document generated FROM the Professional Profile. It is a derived artifact — never a source of truth.

Types of outputs:
- CV (Curriculum Vitae)
- Portfolio
- Academic profile
- Institutional format
- Government format
- Custom format

An Output is produced by applying a Template to a selection of Profile data. Different Outputs may use different subsets of the same Profile.

---

### 1.8 Template

A Template defines HOW profile data is transformed into an Output. It is a presentation specification — it determines structure, layout, ordering, and formatting of the generated document.

A Template does NOT contain profile data. It only describes how data should be arranged and rendered.

Templates are community-extensible. Anyone can create a Template without modifying the system core.

Templates may be:
- General purpose (a standard CV format)
- Institution-specific (a university's required format)
- Government-specific (an official professional record format)
- Domain-specific (a developer portfolio, a medical CV)

---

### 1.9 Template Rule

A Template Rule is a constraint or requirement imposed by a specific Template. Some Templates (especially institutional or governmental ones) have rules about:

- Which sections are mandatory
- Maximum lengths for certain fields
- Required ordering of sections
- Required date formats
- Fields that must be included or excluded

Template Rules are part of the Template definition. They validate whether a Profile can satisfy a Template's requirements BEFORE generating the Output.

---

### 1.10 Output Generation Request

An Output Generation Request is the act of a user requesting a specific Output from their Profile using a specific Template. It involves:

- Selecting which Template to use
- Selecting which Profile sections/data to include
- Configuring output-specific options (format, language, etc.)
- Validating the Profile against Template Rules
- Producing the Output

---

### 1.11 Plugin

A Plugin is an extension unit that adds new capability to the system without modifying the core. Plugins are the mechanism for community contributions.

Types of Plugins:
- OCR providers (extract data from Source Documents)
- AI providers (suggest, enrich, or validate profile data)
- Render providers (alternative ways to generate Output)
- Validation providers (institutional rules, format validators)
- Import providers (import data from external platforms)
- Export providers (additional output formats)

A Plugin must be optional. Removing a Plugin must never break core functionality.

---

### 1.12 Adapter

An Adapter is a specific type of Plugin that implements a system-defined interface (port). While a Plugin may add entirely new capability, an Adapter replaces or provides an implementation for a capability the system already defines.

Examples:
- The system defines an OCR port → Tesseract.js adapter implements it
- The system defines a Render port → Puppeteer adapter implements it
- The system defines an AI port → Ollama adapter implements it

---

### 1.13 Extraction

An Extraction is the process of deriving structured profile data from a Source Document. It may be manual (user types the information) or assisted (OCR reads a document and suggests data).

An Extraction produces candidate data that must be confirmed by the user before it becomes part of the Profile. Extracted data is never automatically committed.

---

### 1.14 Profile Version

A Profile Version represents the state of a Professional Profile at a specific point in time. The Profile evolves as the person's career progresses. Version history allows:

- Tracking changes over time
- Reverting mistakes
- Comparing past and present state
- Understanding career progression

---

### 1.15 User

A User is the person who owns a Professional Profile. In a local-first system, there is typically one User per installation. However, the domain should not preclude multi-user scenarios (e.g., a career counselor managing profiles for clients).

A User has full authority over their profile data. No external entity may access, modify, or export data without the User's explicit action.

---

## 2. Relationships Between Concepts

A **User** owns exactly one **Professional Profile**.

A **Professional Profile** contains one or more **Profile Sections**.

Each **Profile Section** contains zero or more entries (jobs, degrees, certifications, etc.).

A **Source Document** is uploaded or referenced by the User.

An **Evidence** link connects one entry within a Profile Section to one or more Source Documents. This is how provenance is tracked.

An **Extraction** process takes a Source Document and produces candidate data. Once the User confirms the extracted data, it becomes entries in Profile Sections.

An **Institution** is referenced by entries across multiple Profile Sections. The same Institution (e.g., a university) may appear in Education, Certifications, and Projects.

A **Time Period** is associated with most entries (jobs have durations, certifications have issue dates, education has enrollment periods).

A **Template** defines how Profile data should be arranged for output. Templates contain **Template Rules** that specify requirements.

An **Output** is produced when a User makes an **Output Generation Request**: selecting a Template, choosing Profile data, and generating the result.

A **Plugin** extends system capability. An **Adapter** is a Plugin that implements a specific system-defined interface.

A **Profile Version** captures the state of the Profile at a moment in time.

---

## 3. Domain Boundaries

### Belongs to the Domain (business logic)

- Professional Profile and its sections
- Source Documents and Evidence links
- Extraction process (the concept of extracting data, confirming it, linking evidence)
- Templates and Template Rules (the concept of what a template requires)
- Output generation (the concept of selecting data and producing a derived document)
- Profile versioning (tracking changes over time)
- Institutions as reusable entities
- Time Periods and chronology
- Validation against Template Rules
- User ownership and data authority

### Belongs to Infrastructure (behind adapters)

- How Source Documents are stored (filesystem, database, cloud)
- How OCR reads a document (Tesseract, cloud service, etc.)
- How AI suggests data (Ollama, external API, etc.)
- How PDF is rendered (Puppeteer, alternative engines)
- How data is persisted (PostgreSQL, JSON files, etc.)
- How the system is deployed (Docker, bare metal, etc.)
- How authentication works (if needed)

### Belongs to Presentation

- How the User interacts with the Profile (web UI, CLI, mobile)
- How Templates are visually designed (HTML/CSS, layout tools)
- How Output previews are shown
- How the extraction workflow is presented to the User
- How settings and configuration screens look

---

## 4. Business Language (Ubiquitous Language — First Draft)

| Term | Definition |
|------|-----------|
| Professional Profile | The single, persistent, authoritative collection of all professional information for one person |
| Profile Section | A thematic grouping within a Professional Profile (e.g., Work Experience, Education) |
| Entry | A single item within a Profile Section (e.g., one job, one degree, one certification) |
| Source Document | A file (physical or digital) that contains original professional information |
| Evidence | A link between a Profile entry and a Source Document that supports it |
| Provenance | The traceable origin of a piece of information (which Source Document, when extracted) |
| Institution | An organization referenced in the Profile (employer, university, certifying body) |
| Time Period | The temporal boundaries of a professional event (start, end, ongoing, point-in-time) |
| Output | A document generated from the Professional Profile using a Template |
| Template | A presentation specification that defines how Profile data is arranged in an Output |
| Template Rule | A constraint imposed by a Template on what data must be present or how it must be formatted |
| Output Generation Request | The user's act of selecting a Template, choosing data, and producing an Output |
| Extraction | The process of deriving structured data from a Source Document (manual or assisted) |
| Candidate Data | Information produced by Extraction that has not yet been confirmed by the User |
| Plugin | An extension that adds capability to the system without modifying the core |
| Adapter | A Plugin that implements a system-defined interface (port) |
| Profile Version | A snapshot of the Professional Profile at a specific point in time |
| User | The person who owns and controls a Professional Profile |
| Core | The business logic of the system, independent of any external technology |

---

## 5. Business Invariants

These rules are always true in the domain, regardless of technology:

### Profile Invariants

1. A Professional Profile may exist without any Output ever being generated from it.
2. A Professional Profile always has exactly one owner (User).
3. A Profile Section may be empty. An empty section is still a valid section.
4. Deleting an Output never affects the Professional Profile.
5. The Professional Profile is the single source of truth. No Output may modify or override it.

### Evidence Invariants

6. Evidence is always optional. Information may be added to the Profile without linked evidence.
7. A single Source Document may generate evidence for multiple entries across multiple sections.
8. Evidence always preserves provenance: the link records which document, which page/section, and when.
9. Removing evidence from an entry does not remove the entry itself.
10. A Source Document may exist in the system without being linked as evidence to anything.

### Extraction Invariants

11. Extracted data is never automatically committed to the Profile. The User must confirm.
12. An Extraction may produce candidate data that the User rejects entirely.
13. An Extraction from one Source Document may produce candidates for multiple Profile Sections.

### Output Invariants

14. An Output is always derived. It never exists independently — it is produced from Profile data via a Template.
15. An Output may use a subset of Profile data. Not all data must appear in every Output.
16. If the Profile changes after an Output is generated, the Output does NOT auto-update. It is a snapshot.
17. Template Rules are validated before generation. If the Profile does not satisfy the rules, the Output cannot be generated.

### Template Invariants

18. A Template does not contain user data. It only specifies structure and presentation.
19. A Template may define mandatory sections. If the Profile lacks those sections, generation fails with a clear message.
20. Templates are independent of each other. Using one Template does not affect another.

### Plugin/Adapter Invariants

21. Removing any Plugin must never break core functionality.
22. An Adapter implements exactly one system-defined interface.
23. Multiple Adapters may exist for the same interface. Only one is active at a time.

### Time Invariants

24. Entries without Time Periods are valid (e.g., a skill with no date).
25. Time Periods may overlap (a person may have two jobs simultaneously).
26. "Present" or "ongoing" is a valid end boundary for a Time Period.

---

## 6. Unknowns

These are domain questions that require decisions from the project owner before modeling:

### 6.1 Profile Sharing

Is there a concept of "sharing" a Profile or an Output with someone else? If so:
- Is sharing a core domain concept or a future plugin?
- Does sharing produce a new Output, or expose the Profile directly?
- What are the privacy controls for sharing?

**Current assumption:** Sharing is NOT a core concept. Outputs can be exported as files. No built-in sharing mechanism in MVP.

---

### 6.2 Multi-Profile Support

Can a User have multiple Professional Profiles? Examples:
- One profile for academic career, another for industry
- Profiles in different languages

**Current assumption:** One User = one Profile. Multi-profile is a possible future extension.

---

### 6.3 Collaborative Profiles

Can someone other than the owner contribute to a Profile? Examples:
- A career counselor adding entries on behalf of a client
- An institution verifying a certification

**Current assumption:** Only the owner modifies the Profile. External verification is a future concept.

---

### 6.4 Template Authoring

Who creates Templates? Is there a Template authoring domain?
- Do templates have their own lifecycle (draft, published, deprecated)?
- Is there a marketplace or registry concept?
- Can templates have dependencies on other templates (inheritance)?

**Current assumption:** Templates are static files created by developers/community. No lifecycle management in MVP.

---

### 6.5 Source Document Metadata

How much metadata does a Source Document carry?
- Document type (diploma, contract, certificate, etc.)
- Issue date
- Issuing institution
- Language
- Verification status

**Decision needed:** Is Source Document metadata structured or free-form?

---

### 6.6 Skill Taxonomy

Are Skills free-form text or drawn from a taxonomy?
- If taxonomy: who defines it? Is it extensible? Is it standardized (e.g., ESCO, O*NET)?
- If free-form: how is consistency ensured? Can AI suggest standardization?

**Decision needed:** The system may support both but needs a default approach.

---

### 6.7 Profile Completeness

Is there a concept of "profile completeness"?
- Can the system suggest what sections or data are missing?
- Is completeness relative to a specific Template (what's needed for a particular output)?
- Is this a core concept or an AI-assisted feature?

**Decision needed:** Scope of completeness as a domain concept vs. UX feature.

---

### 6.8 Data Import

Is importing data from external platforms (LinkedIn, GitHub, etc.) a core domain concept?
- If so, is it an Extraction from a "virtual" Source Document?
- Or is it a distinct concept (Import)?

**Current assumption:** Import is a Plugin capability, not a core domain concept. It may use the Extraction mechanism.

---

### 6.9 Localization of Profile Data

Can a Profile contain information in multiple languages?
- Is "language" a property of the entire Profile or of individual entries?
- Can the same entry exist in multiple languages (translated)?

**Decision needed:** Whether multi-language is a domain concept or an output concern.

---

### 6.10 Evidence Verification

Is there a concept of evidence "verification" beyond just linking?
- Can evidence be marked as "verified by institution"?
- Is verification status a core concept or a future extension?

**Current assumption:** Not in MVP. Evidence linking provides provenance, not verification.

---

## 7. Final Report

### Discovered Concepts (15)

1. Professional Profile
2. Profile Section
3. Entry
4. Source Document
5. Evidence
6. Institution
7. Time Period
8. Output
9. Template
10. Template Rule
11. Output Generation Request
12. Extraction (+ Candidate Data)
13. Plugin / Adapter
14. Profile Version
15. User

### Potentially Missing Concepts (require decisions)

| Concept | Why it might be needed | Status |
|---------|----------------------|--------|
| Tag / Category | Grouping or labeling entries across sections | Uncertain — might be a UX concern only |
| Profile Completeness Score | Measuring how complete a profile is | Uncertain — might be AI/UX, not domain |
| Import Source | Representing external platforms as data origins | Uncertain — might be covered by Source Document + Plugin |
| Notification / Reminder | Alerting user about expiring certifications, etc. | Uncertain — might be a future plugin |
| Access Control | Fine-grained control over who sees what | Uncertain — depends on sharing decisions |

### Possible Bounded Contexts

Based on the discovered concepts, the domain may naturally divide into:

| Bounded Context | Core Concepts | Responsibility |
|-----------------|--------------|----------------|
| **Profile Management** | Professional Profile, Profile Section, Entry, Institution, Time Period, Profile Version, User | Creating, editing, versioning professional information |
| **Evidence Management** | Source Document, Evidence, Extraction, Candidate Data | Storing documents, linking evidence, extracting data |
| **Output Generation** | Output, Template, Template Rule, Output Generation Request | Producing derived documents from profile data |
| **Extension System** | Plugin, Adapter | Managing and registering extensions |

These contexts have clear interfaces between them:
- Output Generation reads from Profile Management (but cannot write to it)
- Evidence Management writes to Profile Management (after user confirmation)
- Extension System provides implementations to all other contexts via adapters

---

### Recommendations for Domain Modeling

1. **Start with Profile Management.** It is the core bounded context. Everything else depends on it.

2. **Model Evidence as a separate aggregate.** Evidence has its own lifecycle (upload, extraction, linking) and should not be embedded inside Profile entries.

3. **Model Output Generation as a read-only consumer.** It should never modify the Profile. It receives data and produces documents.

4. **Define interfaces (ports) at bounded context boundaries.** This naturally maps to the Ports & Adapters architecture.

5. **Resolve the Unknowns in section 6 before modeling.** Especially: multi-profile, sharing, skill taxonomy, and Source Document metadata. These affect cardinality and entity relationships.

6. **Use the Ubiquitous Language (section 4) in all future Specs and code.** Class names, method names, and variable names should match these terms exactly.

7. **Do not model infrastructure concepts.** Database tables, API endpoints, and UI components will be derived from the domain model — not the other way around.

---

# End of Document
