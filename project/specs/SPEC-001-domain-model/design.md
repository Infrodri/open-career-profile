# SPEC-001 — Diseño Técnico

---

## Ubicación del código

```
packages/
└── core/
    ├── src/
    │   ├── entities/           ← Entidades del dominio
    │   ├── value-objects/      ← Objetos de valor
    │   ├── interfaces/         ← Ports (interfaces de persistencia)
    │   ├── validation/         ← Schemas Zod
    │   └── index.ts            ← Exports públicos
    ├── tests/
    │   ├── entities/
    │   └── validation/
    ├── package.json
    ├── tsconfig.json
    └── vitest.config.ts
```

---

## Entidades

### ProfessionalProfile (Aggregate Root)

```typescript
interface ProfessionalProfile {
  id: string                    // UUID v4
  personalInfo: PersonalInfo
  sections: ProfileSections
  createdAt: Date
  updatedAt: Date
}
```

### PersonalInfo (Value Object)

```typescript
interface PersonalInfo {
  fullName: string              // obligatorio
  email?: string
  phone?: string
  city?: string
  country?: string
  summary?: string
  photo?: string               // ruta al archivo
  links: PersonalLink[]
  birthDate?: string           // formato YYYY-MM o YYYY-MM-DD
  identityDocument?: string
}

interface PersonalLink {
  label: string
  url: string
}
```

### ProfileSections

```typescript
interface ProfileSections {
  workExperience: WorkExperience[]
  education: Education[]
  certifications: Certification[]
  courses: Course[]
  languages: Language[]
  skills: Skill[]
  projects: Project[]
  publications: Publication[]
  awards: Award[]
  affiliations: Affiliation[]
  volunteering: Volunteering[]
  references: Reference[]
}
```

### Cada entrada es un Value Object con id y timestamps

Ejemplo para WorkExperience:

```typescript
interface WorkExperience {
  id: string                   // UUID v4
  position: string             // obligatorio
  institution: string          // obligatorio
  startDate: string            // formato YYYY-MM o YYYY
  endDate?: string             // YYYY-MM, YYYY, o "present"
  description?: string
  achievements: string[]
  location?: string
  createdAt: Date
  updatedAt: Date
}
```

El mismo patrón aplica para todas las secciones (ver requirements.md para campos de cada una).

---

## Value Objects comunes

### TimePeriod

```typescript
interface TimePeriod {
  start?: string              // YYYY, YYYY-MM, o YYYY-MM-DD
  end?: string                // YYYY, YYYY-MM, YYYY-MM-DD, o "present"
}
```

### ProficiencyLevel

```typescript
type LanguageLevel = 'basic' | 'intermediate' | 'advanced' | 'native'
type SkillLevel = 'basic' | 'intermediate' | 'advanced' | 'expert'
type PublicationType = 'article' | 'book' | 'talk' | 'paper' | 'other'
```

---

## Validación (Zod)

Cada entidad tiene un schema Zod correspondiente en `src/validation/`:

```
validation/
├── personal-info.schema.ts
├── work-experience.schema.ts
├── education.schema.ts
├── certification.schema.ts
├── course.schema.ts
├── language.schema.ts
├── skill.schema.ts
├── project.schema.ts
├── publication.schema.ts
├── award.schema.ts
├── affiliation.schema.ts
├── volunteering.schema.ts
├── reference.schema.ts
└── profile.schema.ts          ← Schema completo del perfil
```

La validación se ejecuta:
- Al crear una entrada nueva.
- Al modificar una entrada existente.
- Antes de persistir (en la frontera, no dentro del dominio puro).

---

## Interfaces (Ports)

```typescript
// interfaces/profile-repository.ts
interface ProfileRepository {
  create(profile: ProfessionalProfile): Promise<ProfessionalProfile>
  findById(id: string): Promise<ProfessionalProfile | null>
  update(profile: ProfessionalProfile): Promise<ProfessionalProfile>
  delete(id: string): Promise<void>
}
```

Este port será implementado por un adaptador de Prisma en un Spec posterior. En este Spec solo se define la interfaz.

---

## Factory

```typescript
// entities/profile.factory.ts
function createProfile(personalInfo: PersonalInfo): ProfessionalProfile
function createEntry<T>(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T
```

Las factories generan IDs y timestamps automáticamente.

---

## Decisiones de diseño

1. **Sin clases** — usamos interfaces + funciones factory. Composición sobre herencia.
2. **Inmutabilidad** — las entidades son objetos planos. Las modificaciones producen nuevas instancias.
3. **Validación en la frontera** — el dominio puro no valida (asume datos correctos). Zod valida en el boundary antes de entrar al dominio.
4. **IDs generados internamente** — nunca se aceptan IDs externos. El sistema los genera.
5. **Fechas como strings** — para soportar formatos parciales (solo año, mes/año). La validación verifica el formato.

---

## Setup del monorepo

```
open-career-profile/
├── packages/
│   └── core/
│       ├── package.json       ← name: "@ocp/core"
│       ├── tsconfig.json      ← extends root tsconfig
│       └── vitest.config.ts
├── package.json               ← workspaces: ["packages/*"]
├── tsconfig.base.json         ← configuración TS compartida
├── turbo.json                 ← pipeline: build, test, lint
├── .eslintrc.js               ← configuración ESLint
├── .prettierrc                ← configuración Prettier
└── vitest.workspace.ts        ← workspace de Vitest
```

---

# Fin del Documento
