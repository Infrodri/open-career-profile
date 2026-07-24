# Stack Tecnológico

> Tecnologías aprobadas. Cambios requieren un ADR.

---

## Core

| Tecnología | Rol |
|-----------|-----|
| TypeScript | Lenguaje (strict mode) |
| Node.js 22 LTS | Runtime principal |

## Backend

| Tecnología | Rol |
|-----------|-----|
| Express.js | Framework HTTP (maduro, ecosistema extenso) |
| Prisma ORM | Acceso a base de datos, schema y migraciones |
| PostgreSQL | Base de datos relacional principal |
| Zod | Validación de schemas y parsing de DTOs |
| Docker | Containerización local y paridad de entornos |

## Frontend

| Tecnología | Rol |
|-----------|-----|
| React 19 | Librería de UI |
| Vite | Build tool y servidor de desarrollo |
| TanStack Query | Manejo de estado asíncrono y cache de datos del servidor |
| Tailwind CSS | Framework de estilos utility-first |

## Procesamiento

| Tecnología | Rol |
|-----------|-----|
| Tesseract.js | OCR (mediante adaptador) |
| Ollama | Asistencia IA local (opcional, mediante adaptador) |
| Puppeteer | Generación de PDF (mediante adaptador) |

## Tooling e Infraestructura

| Tecnología | Rol |
|-----------|-----|
| npm | Package manager (workspaces nativos) |
| Turborepo | Build system de monorepo y ejecución de tareas |
| Vitest | Testing unitario e integración |
| Playwright | Testing end-to-end (E2E) |
| ESLint + Prettier | Linting, formateo y calidad de código |
| GitHub Actions | Pipelines de CI/CD automatizados |

---

## Justificación de la elección

- **Express sobre Fastify**: ecosistema maduro, más middleware disponible, y el desarrollador ya lo domina.
- **npm sobre pnpm**: familiar, workspaces nativos desde v7, sin curva de aprendizaje adicional.
- **Sin Redis**: para mantener la promesa local-first sin infraestructura adicional.
- **Todo gratuito y open source**: licencias MIT/Apache compatibles con Apache 2.0.

---

# Fin del Documento
