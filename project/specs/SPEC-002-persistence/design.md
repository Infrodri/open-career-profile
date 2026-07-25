# SPEC-002 — Diseño Técnico

---

## Ubicación del código

```
packages/
└── persistence/
    ├── src/
    │   ├── prisma-profile-repository.ts   ← Adaptador (implementa ProfileRepository)
    │   ├── mappers/
    │   │   └── profile.mapper.ts          ← Dominio ↔ Prisma
    │   ├── prisma/
    │   │   ├── schema.prisma              ← Schema de BD
    │   │   └── migrations/                ← Auto-generadas
    │   └── index.ts
    ├── tests/
    │   └── prisma-profile-repository.test.ts
    ├── package.json
    ├── tsconfig.json
    └── vitest.config.ts

docker/
└── docker-compose.yml                     ← PostgreSQL para desarrollo
```

---

## Schema de Prisma

```prisma
model Profile {
  id             String   @id @default(uuid())
  fullName       String
  email          String?
  phone          String?
  city           String?
  country        String?
  summary        String?
  photo          String?
  birthDate      String?
  identityDocument String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  links           ProfileLink[]
  workExperience  WorkExperience[]
  education       Education[]
  certifications  Certification[]
  courses         Course[]
  languages       Language[]
  skills          Skill[]
  projects        Project[]
  publications    Publication[]
  awards          Award[]
  affiliations    Affiliation[]
  volunteering    Volunteering[]
  references      Reference[]
}

model ProfileLink {
  id        String  @id @default(uuid())
  profileId String
  label     String
  url       String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
}
```

Cada sección sigue el mismo patrón: tabla propia con `profileId` como FK y `onDelete: Cascade`.

---

## Mapper

```typescript
// mappers/profile.mapper.ts
function toDomain(prismaProfile: PrismaProfileWithRelations): ProfessionalProfile
function toPrisma(profile: ProfessionalProfile): PrismaProfileCreateInput
```

El mapper:
- Convierte DateTimes de Prisma a Date de JS.
- Maneja campos opcionales (null ↔ undefined).
- Mantiene arrays vacíos cuando no hay entradas.
- Preserva los IDs generados por el dominio (no genera nuevos).

---

## Docker Compose

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ocp_dev
      POSTGRES_USER: ocp
      POSTGRES_PASSWORD: ocp_dev_password
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## Variables de entorno

```env
# .env.example
OCP_DATABASE_URL=postgresql://ocp:ocp_dev_password@localhost:5432/ocp_dev
```

---

## Dependencias del paquete

- `@ocp/core` (workspace dependency)
- `@prisma/client`
- `prisma` (devDependency)

---

# Fin del Documento
