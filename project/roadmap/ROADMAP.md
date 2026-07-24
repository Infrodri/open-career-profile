# Roadmap — Open Career Profile

---

## Fase 1 — Consolidación (actual)

- Revisar y aprobar documentación base.
- Confirmar arquitectura y stack tecnológico.
- Preparar repositorio para desarrollo.
- Establecer flujo de trabajo con Specs.

---

## Fase 2 — Foundation

Primer Spec: el modelo de dominio (estructura de datos del Perfil Profesional).

- Definir entidades, relaciones e invariantes.
- Implementar paquete core del dominio.
- Configurar tooling del monorepo (pnpm, TypeScript, ESLint, Vitest).

---

## Fase 3 — Core

Specs para funcionalidad central:

- CRUD de Perfil (crear, leer, actualizar, eliminar).
- Gestión de secciones del perfil.
- Documentos fuente y vinculación de evidencias.
- Capa de persistencia (PostgreSQL + Prisma).
- API básica (Fastify).

---

## Fase 4 — Output

Specs para generación de documentos:

- Diseño del sistema de templates.
- Motor de output (datos del Perfil → HTML → PDF vía Puppeteer).
- Al menos 2 templates (CV estándar, CV mínimo).

---

## Fase 5 — Enhancement

Specs para features opcionales y avanzados:

- Extracción OCR (adaptador Tesseract.js).
- Asistencia IA (adaptador Ollama, opcional).
- Arquitectura del sistema de plugins.
- Formatos adicionales de importación/exportación.

---

## Fase 6 — Polish

- UI Frontend (React 19 + Vite + Tailwind).
- Flujos de experiencia de usuario.
- Accesibilidad (WCAG AA).
- Testing end-to-end (Playwright).
- Documentación de uso.

---

## Fase 7 — Release

- Primera versión estable.
- Setup con Docker Compose para despliegue con un solo comando.
- Publicar bajo Apache License 2.0.
- Guías de contribución para la comunidad.
- Mejora continua mediante nuevos Specs.

---

## Cómo funciona cada fase

Cada fase contiene uno o más Specs. Cada Spec sigue:

```
Requisitos → Diseño → Implementación → Verificación
```

Un Spec se completa de punta a punta antes de iniciar el siguiente.
La integración y validación ocurren continuamente, no como una fase separada.

---

# Fin del Documento
