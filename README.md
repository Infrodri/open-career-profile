# Open Career Profile

**Plataforma Open Source para construir, mantener y evolucionar un Perfil Profesional de forma local y privada.**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22%20LTS-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org)

---

## Objetivo

Open Career Profile resuelve un problema real: la información profesional está dispersa en plataformas propietarias que controlan tus datos. Cuando necesitas un CV, un portafolio o un formato institucional, recreas la información de memoria o de documentos desactualizados.

**Esta plataforma es tu fuente única de verdad profesional.** Subes tus certificados, títulos y contratos una vez, y el sistema genera cualquier formato que necesites — automáticamente, con IA opcional, sin depender de la nube.

---

## Demo

| Funcionalidad | Descripción |
|--------------|-------------|
| Importar CV existente | Sube tu hoja de vida (PDF/foto) → la IA extrae TODA la información |
| Perfil Profesional | 16 secciones específicas para el contexto boliviano/latinoamericano |
| Generar CV institucional | Sube el formato que pide la institución → genera tu CV en ESE formato |
| Búsqueda de Empleo | Escanea portales (CompuTrabajo, Google, LinkedIn, RemoteOK) y evalúa ofertas contra tu perfil |
| Evidencias | Vincula cada entrada del CV con su documento original (certificado, título, contrato) |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                    │
│              Vite + TanStack Query + Tailwind            │
└───────────────────────────┬─────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────┐
│                    API (Express.js)                       │
│         28 endpoints · Zod validation · Helmet           │
└──┬────────┬────────┬────────┬────────┬────────┬─────────┘
   │        │        │        │        │        │
┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──────────┐
│Core │ │Pers.│ │Out. │ │Rules│ │Job  │ │AI/OCR/Storage│
│     │ │     │ │Eng. │ │Eng. │ │Scan │ │  Adapters    │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └──────────────┘
   │        │
   │   ┌────▼────┐
   │   │PostgreSQL│
   │   └─────────┘
   │
   └──→ Dominio puro (sin dependencias de infraestructura)
```

### Paquetes

| Paquete | Descripción |
|---------|-------------|
| `@ocp/core` | Modelo de dominio, entidades, interfaces (ports) |
| `@ocp/persistence` | Prisma ORM + PostgreSQL, mappers |
| `@ocp/output-engine` | Generación HTML/PDF con Handlebars + Puppeteer |
| `@ocp/rules-engine` | Validación y transformación de perfiles por reglas institucionales |
| `@ocp/job-scanner` | Scanner de portales de empleo (zero-token) |
| `@ocp/ai-adapter` | Adaptador OpenAI-compatible (cualquier proveedor) |
| `@ocp/ocr-adapter` | OCR con Tesseract.js |
| `@ocp/storage-adapter` | Almacenamiento local de documentos |

---

## Principios

1. **Privacy First** — Todo funciona localmente. Tus datos nunca salen de tu máquina sin acción explícita.
2. **Offline First** — Funciona sin internet. La IA es opcional.
3. **Single Source of Truth** — El Perfil Profesional es la única fuente permanente.
4. **Evidence Driven** — Cada entrada puede vincularse a su documento original.
5. **Plugin First** — OCR, IA, renderizado, todo es reemplazable.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Express.js, TypeScript (strict), Node.js 22 LTS |
| Base de datos | PostgreSQL, Prisma ORM |
| Frontend | React 19, Vite, TanStack Query, Tailwind CSS |
| IA (opcional) | OpenAI-compatible API (OpenRouter, Ollama, cualquiera) |
| OCR | Tesseract.js |
| PDF | Puppeteer |
| Monorepo | npm workspaces + Turborepo |
| Testing | Vitest (102+ tests) |

---

## Instalación Local

### Prerequisitos

- Node.js 22+
- Docker (para PostgreSQL)
- npm 10+

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/open-career-profile.git
cd open-career-profile

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env

# 4. Levantar PostgreSQL con Docker
docker compose -f docker/docker-compose.yml up -d postgres

# 5. Ejecutar migraciones
npx prisma db push --schema=packages/persistence/src/prisma/schema.prisma

# 6. Iniciar desarrollo
npm run dev --workspace=apps/api &
npm run dev --workspace=apps/web
```

La API estará en `http://localhost:3000` y el frontend en `http://localhost:5173`.

### Variables de Entorno

```env
# Base de datos
OCP_DATABASE_URL=postgresql://ocp:ocp_dev_password@localhost:5434/ocp_dev

# API
OCP_PORT=3000

# IA (opcional — funciona sin esto)
OCP_AI_BASE_URL=https://openrouter.ai/api/v1
OCP_AI_API_KEY=tu-api-key
OCP_AI_MODEL=openai/gpt-4o-mini

# OCR
OCP_OCR_ENABLED=true
OCP_OCR_LANGUAGE=eng
```

---

## Deploy (en producción)

| Servicio | URL |
|----------|-----|
| Frontend | https://open-career-profile-web.vercel.app |
| API | https://open-career-profile-api.onrender.com |
| Repositorio | https://github.com/Infrodri/open-career-profile |

Ver [DEPLOY.md](./DEPLOY.md) para instrucciones detalladas de configuración.

---

## Tests

```bash
# Ejecutar todos los tests
npm run test

# Tests de un paquete específico
npx vitest run --workspace=packages/rules-engine
npx vitest run --workspace=packages/job-scanner
npx vitest run --workspace=apps/api
```

---

## Métricas del Proyecto

- **8 paquetes** + 2 aplicaciones (API + Web)
- **102+ tests unitarios**
- **28 endpoints API**
- **11 páginas frontend**
- **5 portales de empleo** integrados
- **3 plantillas de CV** built-in (Estándar, Minimalista, SENASAG)

---

## Licencia

[Apache License 2.0](LICENSE)

---

## Contribuir

Las contribuciones son bienvenidas. Por favor lee la documentación en `project/` para entender la arquitectura antes de contribuir.

```bash
# Convenciones de commits
feat(scope): descripción    # Nueva funcionalidad
fix(scope): descripción     # Corrección de bug
docs: descripción           # Documentación
refactor(scope): descripción # Refactorización sin cambio funcional
test(scope): descripción    # Agregar o modificar tests
```
