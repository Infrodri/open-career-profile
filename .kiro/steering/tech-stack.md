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
| Fastify | Framework HTTP (ligero, rápido, plugin system nativo) |
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
| pnpm | Package manager (workspace engine) |
| Turborepo | Build system de monorepo y ejecución de tareas |
| Vitest | Testing unitario e integración |
| Playwright | Testing end-to-end (E2E) |
| ESLint + Prettier | Linting, formateo y calidad de código |
| GitHub Actions | Pipelines de CI/CD automatizados |

---

## Justificación de la elección

- **Un solo lenguaje (TypeScript)** en todo el stack: simplifica tooling, monorepo, plugins y trabajo con AI.
- **Fastify sobre Express**: más rápido, soporte nativo de schemas, plugin system robusto, sin la complejidad de NestJS.
- **Sin Redis**: para mantener la promesa local-first sin infraestructura adicional.
- **Todo gratuito y open source**: licencias MIT/Apache compatibles con Apache 2.0.

---

# Fin del Documento
