# Open Career Profile — Reglas de Desarrollo

> Este documento se subordina a `project-identity.md`, que es la fuente de verdad del proyecto.

## Idioma

- **Código**: inglés (nombres de variables, funciones, clases, módulos, comentarios técnicos).
- **Documentación de proyecto**: español (steering, manifests, decisiones, roadmap).
- **Documentación de código público** (README de paquetes, JSDoc/TypeDoc, OpenAPI): inglés.
- **Commits y PRs**: inglés.

## Reglas de agentes IA

Extraídas de `project-identity.md`:

1. Nunca reemplazar tecnologías aprobadas.
2. Nunca rediseñar la arquitectura sin un ADR.
3. Nunca implementar lógica de negocio antes de un Spec aprobado.
4. Nunca introducir frameworks no aprobados oficialmente.
5. Nunca duplicar la fuente de verdad.
6. Siempre preservar compatibilidad hacia atrás cuando sea posible.
7. Favorecer modularidad sobre conveniencia.
8. Preferir interfaces sobre implementaciones.
9. Toda decisión arquitectónica importante requiere documentación.
10. Si hay incertidumbre, detenerse y preguntar en vez de asumir.

## Convenciones de código

### TypeScript

- Strict mode habilitado (`"strict": true` en tsconfig).
- No usar `any`. Usar `unknown` cuando el tipo no se conoce y refinar con type guards.
- Preferir interfaces sobre types para objetos. Usar types para uniones, intersecciones y utilidades.
- Preferir `const` sobre `let`. No usar `var`.
- Funciones: preferir arrow functions para callbacks y funciones anónimas; named functions para exportaciones de módulo.
- Evitar clases salvo cuando el patrón lo requiera explícitamente (plugins, servicios con estado). Preferir composición funcional.
- No usar enums de TypeScript. Usar `as const` objects con tipos derivados.
- Imports: usar named imports, nunca `import *`. Ordenar imports con el plugin de ESLint.
- Evitar `default exports`. Usar named exports para mejor refactoring y tree-shaking.

### Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Variables y funciones | camelCase | `getUserProfile` |
| Constantes de módulo | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Tipos e interfaces | PascalCase | `ProfileSection` |
| Archivos de módulo | kebab-case | `profile-service.ts` |
| Archivos de test | kebab-case + .test | `profile-service.test.ts` |
| Carpetas | kebab-case | `output-engine` |
| Variables de entorno | UPPER_SNAKE_CASE con prefijo | `OCP_DATABASE_URL` |

### Manejo de errores

- No usar `try/catch` genéricos. Capturar errores específicos.
- Crear clases de error custom que extiendan `Error` con un `code` tipado.
- Los servicios devuelven `Result<T, E>` pattern (éxito o error tipado), nunca lanzan excepciones para flujos esperados.
- Logging de errores con contexto suficiente para debugging (sin datos sensibles).

### Async

- Siempre usar `async/await` sobre `.then()` chains.
- No dejar promesas sin `await` (regla ESLint `no-floating-promises`).
- Usar `Promise.all` para operaciones paralelas independientes.
- Timeouts explícitos en todas las operaciones de red.

## Arquitectura de código

### Separación de concerns

La lógica de negocio **nunca** debe importar directamente:

- Prisma o cualquier cliente de DB
- Tesseract.js o cualquier motor OCR
- Ollama o cualquier proveedor de IA
- Puppeteer o cualquier motor de renderizado
- Express o cualquier framework HTTP

En su lugar, la lógica de negocio define **interfaces (ports)** que las implementaciones concretas (adapters) satisfacen.

### Estructura de archivos por módulo

```
feature/
├── feature.service.ts      # Lógica de negocio (no importa infraestructura)
├── feature.repository.ts   # Interface del repositorio (port)
├── feature.routes.ts       # Definición de endpoints (solo en apps/api)
├── feature.schema.ts       # Schemas de validación
├── feature.types.ts        # Tipos específicos del feature
├── feature.test.ts         # Tests unitarios
└── index.ts                # Barrel exports públicos
```

### Adaptadores

```
adapters/
├── persistence/
│   ├── prisma-profile.repository.ts   # Implementación con Prisma
│   └── fs-profile.repository.ts       # Implementación con filesystem
├── ocr/
│   ├── ocr.port.ts                    # Interface del adaptador
│   └── tesseract.adapter.ts           # Implementación con Tesseract.js
├── ai/
│   ├── ai.port.ts                     # Interface del adaptador
│   └── ollama.adapter.ts              # Implementación con Ollama
└── render/
    ├── render.port.ts                 # Interface del adaptador
    └── puppeteer.adapter.ts           # Implementación con Puppeteer
```

## Git y control de versiones

### Commits

- Formato: [Conventional Commits](https://www.conventionalcommits.org/)
- Estructura: `<type>(<scope>): <description>`
- Types permitidos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`
- Scope: nombre del paquete o app (`api`, `web`, `cli`, `core`, `output-engine`)
- Descripción en imperativo, minúsculas, sin punto final
- Ejemplos:
  - `feat(core): add certifications section to profile model`
  - `fix(api): handle empty experience array validation`
  - `docs(web): update local setup instructions`

### Branches

- `main` — rama principal, siempre desplegable
- `develop` — integración de features en progreso
- `feat/<scope>/<short-description>` — features nuevas
- `fix/<scope>/<short-description>` — correcciones
- `chore/<description>` — mantenimiento

### Pull Requests

- Título sigue formato Conventional Commits.
- Descripción incluye: qué cambia, por qué, cómo probar.
- Requiere al menos 1 review aprobatorio.
- CI debe pasar (lint, tests, build) antes de merge.
- Squash merge a `develop`, merge commit de `develop` a `main`.

## Testing

### Principios

- Todo código de negocio tiene tests unitarios.
- Los endpoints de API tienen tests de integración.
- Cobertura mínima objetivo: 80% en líneas para paquetes core.
- Tests como documentación: el nombre del test describe el comportamiento esperado.
- Los adaptadores se testean con tests de integración contra su implementación real.
- La lógica de negocio se testea con mocks de los ports.

### Estructura de tests

```typescript
describe('ProfileService', () => {
  describe('createProfile', () => {
    it('creates a valid profile with required fields', () => { ... });
    it('rejects profile with invalid email format', () => { ... });
    it('generates a unique slug from display name', () => { ... });
  });
});
```

### Naming

- `describe`: nombre del módulo/clase/función bajo test.
- `it`: frase que describe el comportamiento en presente, empezando con verbo.

## Dependencias

- Fijar versiones exactas en `package.json` (no `^` ni `~`).
- Evaluar antes de añadir: tamaño, mantenimiento, licencia, alternativas nativas.
- No duplicar funcionalidad entre dependencias.
- Dependencias de desarrollo van en `devDependencies`.
- Shared dependencies se elevan al root `package.json` del workspace.
- Nuevas dependencias deben ser compatibles con uso offline/local.

## Variables de entorno

- Prefijo `OCP_` para todas las variables custom del proyecto.
- Archivo `.env.example` con todas las variables documentadas (sin valores reales).
- Validación de variables al iniciar la app (fail-fast si falta alguna requerida).
- Nunca commitear `.env` con valores reales.
- Variables para features opcionales (AI, OCR) tienen defaults que desactivan el feature.

## Documentación de código

- Funciones públicas exportadas: JSDoc con `@param`, `@returns`, `@throws`, `@example`.
- Interfaces (ports): documentar el contrato esperado y comportamiento.
- Funciones internas complejas: comentario breve explicando el "por qué", no el "qué".
- No documentar lo obvio. El código debe ser autoexplicativo primero.

## Seguridad

- Nunca loguear datos sensibles (tokens, passwords, PII).
- Sanitizar todo input de usuario antes de renderizar (prevención XSS).
- Usar queries parametrizadas (Prisma lo hace por defecto, verificar en raw queries).
- Validar input contra schema antes de procesar.
- Headers de seguridad en respuestas HTTP (Helmet para Express).
- Dependencias auditadas en CI (`pnpm audit`).
- Datos del usuario nunca se envían a servicios externos sin consentimiento explícito.

## Performance

- No optimizar prematuramente. Medir antes de optimizar.
- Queries a DB: evitar N+1, usar `select` explícito con Prisma.
- Paginación obligatoria en endpoints que devuelven listas.
- Lazy loading de plugins y adaptadores no utilizados.
- El procesamiento OCR y AI puede ser asíncrono para no bloquear la UI.

## Accesibilidad (Web)

- HTML semántico como base.
- WCAG 2.1 nivel AA como objetivo mínimo.
- Contraste de colores verificado en templates.
- Navegación por teclado funcional.
- Atributos ARIA donde el HTML semántico no sea suficiente.
- Textos alternativos en imágenes.
