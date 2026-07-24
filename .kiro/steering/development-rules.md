# Reglas de Desarrollo

> Convenciones de código y reglas de proceso.

---

## Política de Idioma

- Código: inglés
- Documentación del proyecto: español
- Documentación de código (JSDoc, TypeDoc): inglés
- Commits y PRs: inglés

## TypeScript

- Strict mode habilitado.
- No usar `any`. Usar `unknown` + type guards.
- Preferir interfaces para objetos.
- Preferir `const`. No usar `var`.
- No usar enums de TypeScript. Usar `as const`.
- Solo named exports. No default exports.
- Solo named imports. No `import *`.

## Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Variables, funciones | camelCase | `getUserProfile` |
| Constantes de módulo | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Tipos, interfaces | PascalCase | `ProfileSection` |
| Archivos | kebab-case | `profile-service.ts` |
| Archivos de test | kebab-case.test | `profile-service.test.ts` |
| Carpetas | kebab-case | `output-engine` |
| Variables de entorno | Prefijo OCP_ | `OCP_DATABASE_URL` |

## Manejo de Errores

- No usar try/catch genéricos. Capturar errores específicos.
- Los servicios retornan patrón Result<T, E> para flujos esperados.
- Clases de error custom con `code` tipado.

## Validación

- Usar Zod para validación de entrada en endpoints.
- Schemas de Zod como fuente de verdad para tipos de DTO.
- Validar siempre en la frontera (API boundary), nunca dentro del dominio.

## Git

- Conventional Commits: `<type>(<scope>): <description>`
- Types: feat, fix, docs, refactor, test, build, chore
- Ramas: `main`, `develop`, `feat/<scope>/<desc>`, `fix/<scope>/<desc>`
- Squash merge a develop, merge commit a main.

## Testing

- Lógica de negocio: tests unitarios (Vitest).
- Endpoints de API: tests de integración (Vitest + Supertest).
- Flujos de usuario: tests E2E (Playwright).
- Cobertura objetivo: 80% en paquetes core.
- Nombres de test describen comportamiento.

## Dependencias

- Versiones exactas (sin ^ ni ~).
- Evaluar antes de agregar.
- Dev dependencies en devDependencies.

## Seguridad

- Nunca loguear datos sensibles.
- Sanitizar todo input de usuario.
- Queries parametrizadas (Prisma por defecto).
- Headers de seguridad en Express (Helmet).
- npm audit en CI.

---

# Fin del Documento
