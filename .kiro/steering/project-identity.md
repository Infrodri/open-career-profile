# Identidad del Proyecto

> Documento de máxima autoridad en este repositorio.
> Si cualquier otro documento contradice este archivo, este archivo gana.

---

## Información del Proyecto

| Propiedad | Valor |
|-----------|-------|
| Nombre | Open Career Profile |
| Licencia | Apache License 2.0 |
| Tipo | Open Source |
| Fase | Planning |
| Modelo de desarrollo | AI Assisted |
| Repositorio | Monorepo |

---

## Misión

Open Career Profile es una plataforma Open Source que permite a cualquier persona construir, mantener y evolucionar un Perfil Profesional de forma local y privada.

El sistema gestiona información profesional.
Un CV es solo uno de los posibles outputs generados a partir del Perfil Profesional.

---

## Principios Fundamentales

1. **Privacy First** — La información personal pertenece al usuario. Sin dependencia cloud. Todo funciona localmente.
2. **Offline First** — Funciona sin internet. La sincronización cloud puede existir en el futuro pero siempre será opcional.
3. **Single Source of Truth** — El Perfil Profesional es la única fuente permanente. Los documentos generados nunca son la fuente.
4. **Evidence Driven** — La información debe ser trazable a su documento original cuando sea posible.
5. **AI Assisted** — La IA es opcional. El sistema funciona completamente sin ella. La IA solo mejora la productividad.
6. **Plugin First** — OCR, IA, motores de renderizado, validación, templates — todo reemplazable mediante plugins/adaptadores.
7. **Open Source First** — Favorecer transparencia, documentación y contribuciones de la comunidad.

---

## Tecnologías Aprobadas

Cambios requieren un ADR.

| Capa | Tecnología |
|------|-----------|
| Backend | Fastify, TypeScript |
| Base de datos | PostgreSQL, Docker, Prisma ORM |
| Validación | Zod |
| Frontend | React 19, Vite |
| Estilos | Tailwind CSS |
| Estado async | TanStack Query |
| OCR | Tesseract.js |
| IA (opcional) | Ollama |
| PDF | Puppeteer |
| Runtime | Node.js 22 LTS |
| VCS | Git, GitHub |

---

## Reglas Arquitectónicas

- La arquitectura debe permanecer modular.
- La lógica de negocio nunca debe acoplarse a: OCR, Base de datos, IA, Templates, UI.
- Toda dependencia externa debe ser reemplazable.
- El dominio es la capa más estable.

---

## Límites

### Este proyecto ES

- Gestor de Perfil Profesional
- Aplicación Local-first
- Plataforma Open Source
- Extensible (basado en Plugins)
- Asistido por IA (opcional)
- Enfocado en privacidad

### Este proyecto NO ES

- Un Resume Builder
- Una plataforma SaaS
- Una aplicación solo-cloud
- Un producto dependiente de IA
- Vendor Locked

---

## Reglas para Agentes IA

1. Nunca reemplazar tecnologías aprobadas sin un ADR.
2. Nunca implementar lógica de negocio antes de un Spec aprobado.
3. Nunca introducir frameworks no aprobados.
4. Nunca duplicar la fuente de verdad.
5. Preservar compatibilidad hacia atrás cuando sea posible.
6. Favorecer modularidad sobre conveniencia.
7. Preferir interfaces sobre implementaciones.
8. Toda decisión arquitectónica requiere documentación.
9. Si hay incertidumbre, detenerse y preguntar.
10. Cuando ocurra un cambio, sincronizar la documentación afectada.

---

## Jerarquía de Documentación

| Nivel | Documentos |
|-------|-----------|
| 1 — Identidad | Este archivo (autoridad absoluta) |
| 2 — Steering | architecture.md, tech-stack.md, development-rules.md |
| 3 — Decisiones y Specs | project/decisions/, project/specs/ |
| 4 — Estado | PROJECT_STATUS.md |

---

## Carga de Contexto (para agentes IA)

Leer en este orden al iniciar sesión:
1. `.kiro/steering/project-identity.md`
2. `project/context/PROJECT_STATUS.md`
3. `.kiro/steering/` (archivos restantes)
4. `project/decisions/` (si existen ADRs)
5. Spec activo (si se está trabajando en uno)

---

# Fin del Documento
