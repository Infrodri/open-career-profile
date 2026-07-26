# Estado del Proyecto

> Snapshot actual. Se actualiza cada vez que el estado del proyecto cambia.

---

## Fase

Development (Fase 10 — plantillas dinámicas y adaptación con IA completados)

---

## Trabajo Actual

Todas las SPECs del plan de desarrollo principal están implementadas. El sistema es funcional de punta a punta con plantillas dinámicas, adaptación con IA, y búsqueda de empleo.

---

## Completado

| # | Qué | Fecha |
|---|-----|-------|
| 1 | Repositorio y documentación consolidada | 2026-07 |
| 2 | SPEC-001: Modelo de dominio (@ocp/core) — 28 tests | 2026-07 |
| 3 | SPEC-002: Persistencia (@ocp/persistence) — Prisma + PostgreSQL | 2026-07 |
| 4 | SPEC-003: API REST (@ocp/api) — CRUD + output + documentos + IA | 2026-07 |
| 5 | SPEC-004: Motor de output (@ocp/output-engine) — HTML/PDF — 9 tests | 2026-07 |
| 6 | SPEC-005: AI adapter (@ocp/ai-adapter) — OpenAI-compatible — 13 tests | 2026-07 |
| 7 | SPEC-005: OCR adapter (@ocp/ocr-adapter) — Tesseract.js — 9 tests | 2026-07 |
| 8 | Frontend React completo en español con Design System | 2026-07 |
| 9 | Flujo documento → OCR → IA → datos → perfil (endpoints + UI) | 2026-07 |
| 10 | Docker Compose para despliegue completo | 2026-07 |
| 11 | SPEC-006: Almacenamiento de documentos y evidencias (@ocp/storage-adapter) | 2026-07 |
| 12 | SPEC-007: Motor de reglas institucionales (@ocp/rules-engine) — 28 tests | 2026-07 |
| 13 | Plantillas institucionales CRUD (modelo + API + frontend) | 2026-07 |
| 14 | SPEC-008: Plantillas dinámicas de diseño (output-engine refactorizado + editor) | 2026-07 |
| 15 | SPEC-009: Adaptación de formato con IA (analyze-format + adapt-profile) | 2026-07 |
| 16 | SPEC-010: Motor de búsqueda de empleo (@ocp/job-scanner) — 25 tests | 2026-07 |

---

## Funcionalidades disponibles

| Funcionalidad | Estado |
|--------------|--------|
| Crear/editar/ver perfil profesional | ✅ Funcional |
| Subir documento (foto/PDF/imagen) | ✅ Funcional |
| Almacenamiento persistente de documentos | ✅ Funcional (LocalFileStorage) |
| Vinculación evidencia ↔ entradas del perfil | ✅ Funcional |
| Extracción de texto de PDF | ✅ Funcional (pdf-parse) |
| OCR de imágenes | ✅ Funcional (Tesseract.js) |
| IA extrae perfil COMPLETO del documento | ✅ Funcional (multi-pass) |
| IA genera recomendaciones de qué falta | ✅ Funcional |
| Usuario revisa y edita todo lo extraído | ✅ Funcional |
| Importar perfil completo de una vez | ✅ Funcional |
| Generar CV en HTML o PDF | ✅ Funcional |
| Plantillas institucionales (reglas de contenido) | ✅ Funcional |
| Validar perfil contra reglas institucionales | ✅ Funcional |
| Generar CV adaptado con reglas institucionales | ✅ Funcional |
| Plantillas de diseño dinámicas (Handlebars) | ✅ Funcional |
| Editor de plantillas con preview en vivo | ✅ Funcional |
| Helpers seguros: formatDate, join, truncate, ifEquals, hasItems | ✅ Funcional |
| Importar formato institucional con IA | ✅ Funcional |
| Adaptar textos del perfil con IA | ✅ Funcional |
| Búsqueda de empleo: configurar y escanear portales | ✅ Funcional |
| Búsqueda de empleo: evaluar ofertas con IA | ✅ Funcional |
| Búsqueda de empleo: tracking de postulaciones | ✅ Funcional |
| Sistema de plugins | ❌ Pendiente (arquitectura lista) |

---

## Siguiente

Opciones de mejora:
- SPEC-010 extendido: providers adicionales (LinkedIn, RemoteOK, Indeed) + CV adaptado por oferta
- SPEC-011: Autenticación local
- SPEC-012: Completar cobertura del dominio (12 secciones)
- Sistema de plugins formal

---

## Bloqueantes

- `prisma generate` tiene un file lock en Windows. Los modelos OutputTemplate, JobSearchConfig y JobListing existen en el schema pero requieren regenerar el client.

---

## Métricas

- Paquetes: 8 (core, persistence, output-engine, ai-adapter, ocr-adapter, storage-adapter, rules-engine, job-scanner) + 1 API + 1 app web
- Tests unitarios: 102 (rules-engine 28 + job-scanner 25 + output-engine 9 + api 20 + ai-adapter 13 + ocr-adapter 9)
- Endpoints API: 28 (perfil CRUD + output + validate + document CRUD + evidence + AI analyze + AI analyze-format + AI adapt-profile + institutional templates + output-templates CRUD + preview + job-configs CRUD + scan + listings CRUD + evaluate + providers)
- Templates de renderizado: 2 built-in (standard, minimal) + dinámicas ilimitadas
- Portales de empleo: 1 (CompuTrabajo Bolivia)
- Páginas frontend: 11 (Home, Perfil, Crear, Editar, Documento, Documentos, Plantillas, Diseño, Importar Formato, Generar, Empleo)

---

## Última Actualización

2026-07-25
