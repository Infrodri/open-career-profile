# Open Career Profile — Estructura del Proyecto

> Este documento se subordina a `project-identity.md`, que es la fuente de verdad del proyecto.

## Visión general

El proyecto es un monorepo gestionado con pnpm workspaces y Turborepo. La estructura separa aplicaciones desplegables (`apps/`), paquetes compartidos del core (`packages/`), extensiones (`plugins/`), y configuración de infraestructura (`docker/`).

El sistema es local-first y offline-first. Toda la estructura refleja una aplicación que se ejecuta en la máquina del usuario.

## Árbol de directorios

```
open-career-profile/
├── .github/                    # Workflows de CI/CD y templates de issues/PRs
│   ├── workflows/
│   └── PULL_REQUEST_TEMPLATE.md
├── .kiro/                      # Configuración de Kiro (steering, hooks, settings)
│   ├── steering/
│   └── settings/
├── apps/                       # Aplicaciones desplegables
│   ├── api/                    # API REST local (Express.js)
│   ├── web/                    # Interfaz de usuario (React + Vite)
│   └── cli/                    # Herramienta CLI
├── packages/                   # Paquetes compartidos internos
│   ├── core/                   # Dominio: modelo de datos, lógica de negocio, interfaces (ports)
│   ├── output-engine/          # Motor de generación de documentos (templates → PDF/HTML)
│   ├── config/                 # Configuración compartida (ESLint, TSConfig, Prettier)
│   └── utils/                  # Utilidades comunes (validación, formateo, helpers)
├── plugins/                    # Plugins y adaptadores de extensión
│   ├── adapter-ocr-tesseract/  # Adaptador OCR: Tesseract.js
│   ├── adapter-ai-ollama/      # Adaptador AI: Ollama (opcional)
│   ├── adapter-render-puppeteer/ # Adaptador render: Puppeteer
│   └── plugin-example/         # Ejemplo de plugin comunitario
├── docker/                     # Configuración de Docker
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── docker-compose.yml
├── scripts/                    # Scripts de automatización y mantenimiento
│   ├── setup.ts                # Setup inicial del proyecto
│   └── generate-types.ts       # Generación de tipos desde schema
├── templates/                  # Templates de output distribuibles
│   ├── cv-default/
│   ├── cv-minimal/
│   └── portfolio-developer/
├── project/                    # Documentación interna del proyecto
│   ├── architecture/           # Diagramas y documentación de arquitectura
│   ├── context/                # Changelog y contexto histórico
│   ├── decisions/              # ADRs (Architecture Decision Records)
│   ├── glossary/               # Glosario de términos del dominio
│   ├── manifest/               # Manifiesto del proyecto
│   ├── prompts/                # Prompts reutilizables para desarrollo con IA
│   └── roadmap/                # Roadmap y planificación
├── .env.example                # Variables de entorno documentadas
├── .gitignore
├── .npmrc                      # Configuración de pnpm
├── LICENSE                     # Apache License 2.0
├── README.md                   # Documentación principal del proyecto
├── package.json                # Root package.json (workspaces)
├── pnpm-workspace.yaml         # Definición de workspaces
├── turbo.json                  # Configuración de Turborepo
└── tsconfig.base.json          # TSConfig base compartido
```

## Responsabilidades por directorio

### `apps/` — Aplicaciones desplegables

Cada subdirectorio es una aplicación independiente con su propio `package.json`, configuración y punto de entrada. Las apps importan de `packages/` pero nunca entre sí.

| App | Responsabilidad | Puerto default |
|-----|----------------|----------------|
| `api` | API REST local (Express.js), endpoints CRUD, orquestación de servicios | 3000 |
| `web` | Interfaz de usuario local (React + Vite), gestión visual del perfil | 5173 |
| `cli` | Gestión de perfiles por línea de comandos, exportación, automatización | N/A |

### `packages/` — Paquetes compartidos

Paquetes internos consumidos por las apps y plugins. No se publican a npm (son workspace dependencies).

| Package | Responsabilidad |
|---------|----------------|
| `core` | **Dominio del sistema.** Modelo de datos del Perfil Profesional, lógica de negocio pura, interfaces (ports) para persistencia/OCR/AI/render. No importa ninguna implementación concreta. |
| `output-engine` | Motor de generación de documentos. Transforma datos del perfil en outputs (PDF, HTML) usando templates. Usa el port de render. |
| `config` | Configuraciones compartidas de herramientas (ESLint, TypeScript, Prettier) para DRY en el monorepo |
| `utils` | Helpers genéricos: slugify, date formatting, sanitización, error classes comunes |

### `plugins/` — Extensiones y adaptadores

Cada plugin/adaptador es un paquete con una interfaz definida que extiende funcionalidad sin modificar el core.

**Adaptadores (implementaciones de ports):**

| Adaptador | Implementa | Tecnología |
|-----------|-----------|------------|
| `adapter-ocr-tesseract` | OCR Port | Tesseract.js |
| `adapter-ai-ollama` | AI Port | Ollama (opcional) |
| `adapter-render-puppeteer` | Render Port | Puppeteer |

**Plugins comunitarios (extensiones):**

- Nuevos formatos de output (CV institucional, formato gubernamental, portfolio).
- Reglas de validación específicas de instituciones.
- Integraciones con servicios externos (opcionales).
- Enriquecimiento de datos.

Estructura mínima de un plugin/adaptador:

```
plugin-example/
├── src/
│   ├── index.ts          # Punto de entrada, registra el plugin
│   └── ...
├── package.json
├── tsconfig.json
└── README.md
```

### `docker/` — Infraestructura local

Dockerfiles y compose para ejecución local reproducible.

- `docker-compose.yml` levanta el stack completo (API + PostgreSQL + Web) localmente.
- Dockerfiles multi-stage para builds optimizados.
- Volúmenes para persistencia de datos en desarrollo.
- No requiere conexión a internet una vez construidas las imágenes.

### `scripts/` — Automatización

Scripts ejecutables para tareas de mantenimiento y desarrollo:

- Setup inicial del entorno.
- Generación de tipos desde el modelo de datos.
- Migraciones de base de datos (Prisma).
- Validación pre-release.

### `templates/` — Templates de output distribuibles

Templates para generación de documentos desde el Perfil Profesional. Cada template es una carpeta con:

```
template-name/
├── template.hbs          # Template principal (o formato del render adapter)
├── partials/             # Parciales reutilizables
├── styles/               # Estilos específicos del template
├── preview.png           # Preview para selección de template
└── manifest.json         # Metadata del template (nombre, autor, versión, tipo)
```

Tipos de templates posibles:

- CV (currículum vitae)
- Portfolio profesional
- Perfil académico
- Formato institucional
- Formato gubernamental

### `project/` — Documentación interna

Documentación de gestión del proyecto que NO se publica como parte del producto:

| Carpeta | Contenido |
|---------|-----------|
| `architecture` | Diagramas C4, diagramas de secuencia, documentación de diseño |
| `context` | Changelog, notas de contexto para onboarding |
| `decisions` | ADRs (Architecture Decision Records) — requeridos para cambios arquitectónicos |
| `glossary` | Definiciones de términos del dominio |
| `manifest` | Manifiesto del proyecto (visión, scope, stakeholders) |
| `prompts` | Prompts optimizados para desarrollo asistido por IA |
| `roadmap` | Planificación por fases, milestones |

## Reglas de dependencias

```
apps/api     → packages/core, packages/utils
apps/web     → packages/core, packages/output-engine, packages/utils
apps/cli     → packages/core, packages/output-engine, packages/utils
plugins/*    → packages/core (solo interfaces/ports), packages/utils
```

**Prohibido:**
- Apps importando de otras apps.
- Plugins importando de apps.
- Dependencias circulares entre packages.
- `packages/core` importando implementaciones concretas (Prisma, Tesseract, Ollama, Puppeteer).
- Cualquier paquete importando directamente de `plugins/` (los plugins se registran en runtime).

## Convenciones de archivos de configuración

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| `package.json` | Root + cada workspace | Dependencias y scripts |
| `tsconfig.json` | Cada workspace | Extiende `tsconfig.base.json` del root |
| `turbo.json` | Root | Pipeline de tasks (build, test, lint) |
| `pnpm-workspace.yaml` | Root | Declaración de workspaces |
| `.env.example` | Root + apps que lo necesiten | Documentación de variables de entorno |
| `vitest.config.ts` | Cada workspace con tests | Configuración de testing |
| `prisma/schema.prisma` | `apps/api` | Schema de base de datos |

## Scripts del root package.json

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "format": "prettier --write .",
    "clean": "turbo clean",
    "typecheck": "turbo typecheck"
  }
}
```

Turborepo ejecuta cada script en los workspaces que lo tengan definido, respetando el grafo de dependencias.
