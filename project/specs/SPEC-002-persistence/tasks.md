# SPEC-002 — Tareas de Implementación

---

## Orden de ejecución

---

### T1. Docker Compose para PostgreSQL

**Qué:** Configurar Docker Compose para levantar PostgreSQL localmente.

**Archivos a crear:**
- `docker/docker-compose.yml`
- `.env.example` (root)

**Criterio de fin:** `docker compose up -d` levanta PostgreSQL. Conexión funciona.

---

### T2. Paquete persistence — setup

**Qué:** Crear el paquete `@ocp/persistence` con Prisma configurado.

**Archivos a crear:**
- `packages/persistence/package.json`
- `packages/persistence/tsconfig.json`
- `packages/persistence/src/prisma/schema.prisma`
- `packages/persistence/src/index.ts`

**Criterio de fin:** `npx prisma generate` funciona. El paquete compila.

---

### T3. Schema de Prisma completo

**Qué:** Definir todos los modelos en el schema de Prisma.

**Modelos:** Profile, ProfileLink, WorkExperience, Education, Certification, Course, Language, Skill, Project, Publication, Award, Affiliation, Volunteering, Reference.

**Criterio de fin:** `npx prisma migrate dev` genera la primera migración sin errores.

---

### T4. Mapper dominio ↔ Prisma

**Qué:** Crear funciones de mapeo entre las entidades del dominio y los modelos de Prisma.

**Archivos a crear:**
- `packages/persistence/src/mappers/profile.mapper.ts`

**Criterio de fin:** El mapper convierte correctamente en ambas direcciones.

---

### T5. Implementación del PrismaProfileRepository

**Qué:** Implementar los 4 métodos de ProfileRepository usando Prisma Client.

**Archivos a crear:**
- `packages/persistence/src/prisma-profile-repository.ts`

**Criterio de fin:** Create, findById, update, delete funcionan contra PostgreSQL.

---

### T6. Tests de integración

**Qué:** Tests CRUD contra PostgreSQL real.

**Archivos a crear:**
- `packages/persistence/tests/prisma-profile-repository.test.ts`
- `packages/persistence/vitest.config.ts`

**Criterio de fin:** Todos los tests pasan con la base de datos Docker corriendo.

---

## Dependencias entre tareas

```
T1 (Docker) → T2 (setup) → T3 (schema) → T4 (mapper) → T5 (repository) → T6 (tests)
```

---

# Fin del Documento
