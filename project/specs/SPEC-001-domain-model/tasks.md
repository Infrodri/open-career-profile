# SPEC-001 — Tareas de Implementación

---

## Orden de ejecución

Las tareas se ejecutan secuencialmente. Cada una depende de la anterior.

---

### T1. Setup del monorepo

**Qué:** Configurar el repositorio como monorepo con npm workspaces y Turborepo.

**Archivos a crear:**
- `package.json` (root, con workspaces)
- `tsconfig.base.json`
- `turbo.json`
- `.eslintrc.js`
- `.prettierrc`
- `packages/core/package.json`
- `packages/core/tsconfig.json`
- `packages/core/vitest.config.ts`

**Criterio de fin:** `npm install` funciona. `turbo build` y `turbo test` ejecutan sin error (aunque no haya tests aún).

---

### T2. Entidades del dominio — Value Objects base

**Qué:** Crear los tipos e interfaces base del dominio.

**Archivos a crear:**
- `packages/core/src/value-objects/types.ts` (TimePeriod, niveles, enums)
- `packages/core/src/value-objects/personal-link.ts`
- `packages/core/src/index.ts` (barrel export)

**Criterio de fin:** Los tipos compilan sin error. Se exportan desde el paquete.

---

### T3. Entidades del dominio — PersonalInfo y secciones

**Qué:** Crear las interfaces de todas las secciones del perfil.

**Archivos a crear:**
- `packages/core/src/entities/personal-info.ts`
- `packages/core/src/entities/work-experience.ts`
- `packages/core/src/entities/education.ts`
- `packages/core/src/entities/certification.ts`
- `packages/core/src/entities/course.ts`
- `packages/core/src/entities/language.ts`
- `packages/core/src/entities/skill.ts`
- `packages/core/src/entities/project.ts`
- `packages/core/src/entities/publication.ts`
- `packages/core/src/entities/award.ts`
- `packages/core/src/entities/affiliation.ts`
- `packages/core/src/entities/volunteering.ts`
- `packages/core/src/entities/reference.ts`
- `packages/core/src/entities/professional-profile.ts` (aggregate root)

**Criterio de fin:** Todas las interfaces compilan. El perfil compone todas las secciones.

---

### T4. Schemas de validación (Zod)

**Qué:** Crear schemas Zod para cada entidad.

**Archivos a crear:**
- `packages/core/src/validation/personal-info.schema.ts`
- `packages/core/src/validation/work-experience.schema.ts`
- `packages/core/src/validation/education.schema.ts`
- `packages/core/src/validation/certification.schema.ts`
- `packages/core/src/validation/course.schema.ts`
- `packages/core/src/validation/language.schema.ts`
- `packages/core/src/validation/skill.schema.ts`
- `packages/core/src/validation/project.schema.ts`
- `packages/core/src/validation/publication.schema.ts`
- `packages/core/src/validation/award.schema.ts`
- `packages/core/src/validation/affiliation.schema.ts`
- `packages/core/src/validation/volunteering.schema.ts`
- `packages/core/src/validation/reference.schema.ts`
- `packages/core/src/validation/profile.schema.ts`
- `packages/core/src/validation/index.ts`

**Criterio de fin:** Cada schema valida datos correctos y rechaza datos inválidos.

---

### T5. Factories

**Qué:** Crear funciones factory para instanciar entidades con IDs y timestamps.

**Archivos a crear:**
- `packages/core/src/entities/factories.ts`

**Criterio de fin:** Las factories generan entidades válidas con UUID y timestamps automáticos.

---

### T6. Interfaces de persistencia (Ports)

**Qué:** Definir la interfaz del repositorio de perfil.

**Archivos a crear:**
- `packages/core/src/interfaces/profile-repository.ts`
- `packages/core/src/interfaces/index.ts`

**Criterio de fin:** La interfaz está definida y exportada. No hay implementación todavía (será un Spec posterior).

---

### T7. Tests unitarios

**Qué:** Tests para validación y factories.

**Archivos a crear:**
- `packages/core/tests/validation/personal-info.test.ts`
- `packages/core/tests/validation/work-experience.test.ts`
- `packages/core/tests/validation/profile.test.ts`
- `packages/core/tests/entities/factories.test.ts`

**Criterio de fin:**
- Los schemas aceptan datos válidos.
- Los schemas rechazan datos inválidos (campos obligatorios vacíos, emails malformados, URLs inválidas).
- Las factories generan IDs únicos y timestamps.
- `turbo test` pasa al 100%.

---

### T8. Exportación final y verificación

**Qué:** Asegurar que todo se exporta correctamente y el paquete es consumible.

**Verificar:**
- `packages/core/src/index.ts` exporta todas las entidades, schemas, interfaces y factories.
- TypeScript compila sin errores (`turbo build`).
- ESLint pasa sin errores (`turbo lint`).
- Todos los tests pasan (`turbo test`).

**Criterio de fin:** El paquete `@ocp/core` está completo, testeado y listo para ser consumido por futuras apps.

---

## Dependencias entre tareas

```
T1 (setup) → T2 (value objects) → T3 (entidades) → T4 (validación) → T5 (factories) → T6 (ports) → T7 (tests) → T8 (verificación)
```

Todas son secuenciales. No hay paralelismo posible.

---

# Fin del Documento
