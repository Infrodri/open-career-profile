# Open Career Profile — Stack Tecnológico

> Este documento se subordina a `project-identity.md`, que es la fuente de verdad del proyecto.
> Las tecnologías aquí listadas son las oficialmente aprobadas. No deben reemplazarse sin un ADR aprobado.

## Lenguaje principal

| Tecnología | Versión mínima | Justificación |
|-----------|---------------|---------------|
| TypeScript | 5.4+ | Tipado estático, mejor DX, ecosistema maduro para full-stack |
| Node.js | 20 LTS+ | Runtime estable, soporte nativo de ES modules, ecosistema amplio |

## Backend

| Tecnología | Justificación |
|-----------|---------------|
| Express.js | Framework HTTP maduro, ecosistema de middleware extenso, amplia documentación y soporte comunitario |
| Prisma ORM | Type-safe, migraciones declarativas, introspección de DB, generación automática de cliente tipado |
| PostgreSQL | Base de datos relacional robusta, JSONB para flexibilidad, extensiones para búsqueda |
| Docker | Containerización para entorno reproducible y despliegue local consistente |

## Frontend

| Tecnología | Justificación |
|-----------|---------------|
| React | Librería de UI con ecosistema maduro, componentes reutilizables, amplia comunidad |
| Vite | Build tool rápido, HMR instantáneo, configuración mínima, soporte nativo TypeScript |

## OCR

| Tecnología | Justificación |
|-----------|---------------|
| Tesseract.js | OCR open-source que funciona en el navegador y en Node.js, sin dependencias de servicios externos |

> La arquitectura de adaptadores permite añadir proveedores OCR adicionales en el futuro sin modificar el core.

## Inteligencia Artificial

| Tecnología | Justificación |
|-----------|---------------|
| Ollama | Ejecución local de modelos LLM, sin dependencia cloud, privacidad del usuario preservada |

> **La IA es estrictamente opcional.** La aplicación debe ser 100% funcional sin ella.
> Ollama fue elegido por su naturaleza local-first, alineada con los principios del proyecto.

## Generación de PDF

| Tecnología | Justificación |
|-----------|---------------|
| Puppeteer | Generación de PDF desde HTML renderizado, fidelidad visual, funciona localmente |

## Gestión del monorepo

| Tecnología | Justificación |
|-----------|---------------|
| pnpm workspaces | Gestión eficiente de dependencias, deduplicación, soporte nativo de workspaces |
| Turborepo | Orquestación de builds, caching local, ejecución paralela de tareas entre paquetes |

## Testing

| Tecnología | Alcance | Justificación |
|-----------|---------|---------------|
| Vitest | Unit + Integration | Compatible con Vite, rápido, API compatible con Jest, soporte nativo TypeScript |
| Playwright | E2E (web) | Cross-browser, API moderna, buena integración CI |
| Supertest | API | Testing de endpoints HTTP sin levantar servidor |

## Calidad de código

| Tecnología | Justificación |
|-----------|---------------|
| ESLint | 9+ (flat config) | Linting con reglas TypeScript, detección de errores, consistencia |
| Prettier | Formateo automático, elimina debates de estilo |
| Husky + lint-staged | Pre-commit hooks para asegurar calidad antes de cada commit |
| Commitlint | Convención de commits (Conventional Commits) |

## Control de versiones e infraestructura

| Tecnología | Justificación |
|-----------|---------------|
| Git | Control de versiones distribuido |
| GitHub | Hosting del repositorio, issues, PRs, GitHub Actions para CI/CD |
| Docker Compose | Orquestación local del stack completo (API + DB + App) |

## Documentación

| Tecnología | Justificación |
|-----------|---------------|
| TypeDoc | Documentación de API generada desde código TypeScript |
| OpenAPI / Swagger | Especificación de la API REST |

## Criterios de selección

Las tecnologías fueron elegidas siguiendo estos principios:

1. **Local-first** — Prioridad a herramientas que funcionan completamente offline sin servicios externos.
2. **Madurez y estabilidad** — Librerías con mantenimiento activo y comunidad establecida.
3. **Type-safety** — Prioridad a herramientas que aprovechan el sistema de tipos de TypeScript.
4. **Reemplazabilidad** — Cada herramienta es reemplazable a través de adaptadores sin afectar al core.
5. **Open-source friendly** — Licencias permisivas compatibles con Apache License 2.0.
6. **Developer Experience** — Tiempos de build rápidos, hot reload, mensajes de error claros.
7. **Privacidad** — Ninguna tecnología requiere enviar datos del usuario a servicios externos.

## Reglas de gobernanza tecnológica

- Ninguna tecnología aprobada puede ser reemplazada sin un ADR (Architecture Decision Record) aprobado.
- Los agentes de IA NO deben introducir frameworks no aprobados oficialmente.
- Nuevas dependencias deben evaluarse contra los criterios de selección antes de su adopción.
- La adición de proveedores (OCR, AI, render) se hace mediante adaptadores, no reemplazando la tecnología base.

## Versiones y compatibilidad

- **Node.js**: Se soporta la versión LTS activa (actualmente 20.x).
- **TypeScript**: Se actualiza dentro del ciclo minor sin breaking changes.
- **Dependencias**: Versiones exactas en `package.json`. Actualizaciones evaluadas mensualmente.
