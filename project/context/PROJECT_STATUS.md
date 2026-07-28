# Estado del Proyecto

> Snapshot actual. Se actualiza cada vez que el estado del proyecto cambia.

---

## Fase

Production (Fase 11 — desplegado en producción, funcional de punta a punta)

---

## Deploy en Producción

| Servicio | URL | Plataforma |
|----------|-----|-----------|
| Frontend | https://open-career-profile-web.vercel.app | Vercel |
| Backend API | https://open-career-profile-api.onrender.com | Render |
| Base de datos | PostgreSQL (Supabase) | Supabase |
| Repositorio | https://github.com/Infrodri/open-career-profile | GitHub |

---

## Trabajo Actual

Sistema en producción. Todas las SPECs del plan de desarrollo principal implementadas y desplegadas.

---

## Completado

| # | Qué | Fecha |
|---|-----|-------|
| 1 | Repositorio y documentación consolidada | 2026-07 |
| 2 | SPEC-001: Modelo de dominio (@ocp/core) — 28 tests | 2026-07 |
| 3 | SPEC-002: Persistencia (@ocp/persistence) — Prisma + PostgreSQL | 2026-07 |
| 4 | SPEC-003: API REST (@ocp/api) — CRUD + output + documentos + IA | 2026-07 |
| 5 | SPEC-004: Motor de output (@ocp/output-engine) — HTML/PDF — 9 tests | 2026-07 |
| 6 | SPEC-005: AI adapter (@ocp/ai-adapter) — OpenAI-compatible — 18 tests | 2026-07 |
| 7 | SPEC-005: OCR adapter (@ocp/ocr-adapter) — Tesseract.js — 9 tests | 2026-07 |
| 8 | Frontend React completo en español con Design System | 2026-07 |
| 9 | Flujo documento → OCR → IA → datos → perfil (endpoints + UI) | 2026-07 |
| 10 | Docker Compose para despliegue completo | 2026-07 |
| 11 | SPEC-006: Almacenamiento de documentos y evidencias (@ocp/storage-adapter) | 2026-07 |
| 12 | SPEC-007: Motor de reglas institucionales (@ocp/rules-engine) — 28 tests | 2026-07 |
| 13 | Plantillas institucionales CRUD (modelo + API + frontend) | 2026-07 |
| 14 | SPEC-008: Plantillas dinámicas de diseño (output-engine refactorizado + editor) | 2026-07 |
| 15 | SPEC-009: Adaptación de formato con IA (analyze-format + adapt-profile + generate-template) | 2026-07 |
| 16 | SPEC-010: Motor de búsqueda de empleo (@ocp/job-scanner) — 25 tests | 2026-07 |
| 17 | Deploy producción: Vercel (frontend) + Render (API) + Supabase (BD) | 2026-07 |
| 18 | Deduplicación de documentos (SHA-256 + fileName/size) | 2026-07 |
| 19 | Sanitización de errores de IA (nunca filtra URLs ni keys) | 2026-07 |
| 20 | Plantilla SENASAG (formato institucional boliviano built-in) | 2026-07 |
| 21 | Acciones por entrada: ver detalle, editar en modal, verificar (upload o manual) | 2026-07 |
| 22 | 5 portales de empleo: CompuTrabajo, Google, LinkedIn, Trabajopolis, RemoteOK | 2026-07 |

---

## Funcionalidades disponibles

| Funcionalidad | Estado |
|--------------|--------|
| Crear/editar/ver perfil profesional | ✅ Funcional |
| Subir documento (foto/PDF/imagen) | ✅ Funcional |
| Deduplicación de documentos (hash + nombre/tamaño) | ✅ Funcional |
| Almacenamiento persistente de documentos | ✅ Funcional (LocalFileStorage) |
| Vinculación evidencia ↔ entradas del perfil | ✅ Funcional |
| Extracción de texto de PDF | ✅ Funcional (pdf-parse) |
| OCR de imágenes | ✅ Funcional (Tesseract.js) |
| IA extrae perfil COMPLETO del documento (multi-pass 16 secciones) | ✅ Funcional |
| Usuario revisa y edita todo lo extraído | ✅ Funcional |
| Importar perfil completo de una vez | ✅ Funcional |
| Generar CV en HTML o PDF | ✅ Funcional |
| Plantillas de CV: Estándar, Minimalista, SENASAG | ✅ Funcional (3 built-in) |
| Plantillas de diseño dinámicas (Handlebars + editor) | ✅ Funcional |
| Plantillas institucionales (reglas de contenido) | ✅ Funcional |
| Validar perfil contra reglas institucionales | ✅ Funcional |
| Generar CV adaptado con reglas institucionales | ✅ Funcional |
| Importar formato institucional con IA (detecta reglas + genera plantilla) | ✅ Funcional |
| Adaptar textos del perfil con IA | ✅ Funcional |
| Ver detalle de entrada (modal) | ✅ Funcional |
| Editar entrada en modal flotante | ✅ Funcional |
| Verificar entrada: subir documento O marcar manualmente | ✅ Funcional |
| Verificar masivamente (POST /verify-all) | ✅ Funcional |
| Búsqueda de empleo: 5 portales (CompuTrabajo, Google, LinkedIn, Trabajopolis, RemoteOK) | ✅ Funcional |
| Búsqueda de empleo: evaluar ofertas con IA (score 1-5, gaps) | ✅ Funcional |
| Búsqueda de empleo: tracking de postulaciones | ✅ Funcional |
| Descarte de documentos limpia archivo del servidor | ✅ Funcional |
| Sistema de plugins | ❌ Pendiente (arquitectura lista) |

---

## Siguiente

Opciones de mejora:
- SPEC-011: Autenticación local (contraseña maestra + JWT)
- SPEC-012: Completar cobertura del dominio (todas las 16 secciones en UI)
- CV adaptado POR oferta de empleo (integrar scanner con output-engine)
- Sistema de plugins formal
- Escaneo programado de portales

---

## Bloqueantes

Ninguno. El sistema está funcional y desplegado.

---

## Métricas

- Paquetes: 8 (core, persistence, output-engine, ai-adapter, ocr-adapter, storage-adapter, rules-engine, job-scanner) + 1 API + 1 app web
- Tests unitarios: 111 (rules-engine 28 + job-scanner 25 + output-engine 9 + api 20 + ai-adapter 18 + ocr-adapter 9 + core 2)
- Endpoints API: 31 (perfil CRUD + output + validate + verify-all + document CRUD + evidence + AI analyze + AI analyze-format + AI adapt-profile + AI generate-template + institutional templates + output-templates CRUD + preview + job-configs CRUD + scan + listings CRUD + evaluate + providers + entry PATCH)
- Templates de renderizado: 3 built-in (standard, minimal, senasag) + dinámicas ilimitadas
- Portales de empleo: 5 (CompuTrabajo Bolivia, Google Empleos, LinkedIn Público, Trabajopolis Bolivia, RemoteOK)
- Páginas frontend: 11 (Home, Perfil, Crear, Editar, Documento, Documentos, Plantillas, Diseño, Importar Formato, Generar, Empleo)

---

## Última Actualización

2026-07-27
