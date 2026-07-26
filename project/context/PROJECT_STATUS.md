# Estado del Proyecto

> Snapshot actual. Se actualiza cada vez que el estado del proyecto cambia.

---

## Fase

Development (Fase 9 — motor de búsqueda de empleo implementado)

---

## Trabajo Actual

Motor de búsqueda de empleo funcional. El sistema escanea portales, evalúa ofertas con IA contra el perfil del usuario, y permite tracking de postulaciones.

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
| 14 | SPEC-010: Motor de búsqueda de empleo (@ocp/job-scanner) — 25 tests | 2026-07 |

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
| IA extrae perfil COMPLETO del documento | ✅ Funcional (todas las secciones a la vez) |
| IA genera recomendaciones de qué falta | ✅ Funcional |
| Usuario revisa y edita todo lo extraído | ✅ Funcional |
| Importar perfil completo de una vez | ✅ Funcional (POST /api/profiles/import) |
| Generar CV en HTML o PDF | ✅ Funcional |
| Plantillas institucionales (CRUD) | ✅ Funcional |
| Validar perfil contra reglas institucionales | ✅ Funcional (POST /api/profiles/:id/validate) |
| Generar CV adaptado con reglas institucionales | ✅ Funcional (ruleSetId en output) |
| Motor de reglas: filtrar secciones, solo verificados, truncar | ✅ Funcional |
| Búsqueda de empleo: configurar búsqueda | ✅ Funcional |
| Búsqueda de empleo: escanear portales (zero-token) | ✅ Funcional (CompuTrabajo Bolivia) |
| Búsqueda de empleo: evaluar ofertas con IA | ✅ Funcional (score 1-5, gaps, recomendación) |
| Búsqueda de empleo: tracking de postulaciones | ✅ Funcional |
| Búsqueda de empleo: UI completa (/empleo) | ✅ Funcional |
| Sistema de plugins | ❌ Pendiente (arquitectura lista) |

---

## Siguiente

Posibles mejoras al motor de búsqueda de empleo:
- Providers adicionales (LinkedIn público, RemoteOK, Indeed Bolivia)
- Generación de CV adaptado por oferta (integrar con rules-engine)
- Programación de escaneos automáticos

O continuar con SPECs pendientes:
- SPEC-008: Plantillas Dinámicas
- SPEC-009: Adaptación de Formato con IA

---

## Bloqueantes

- `prisma generate` tiene un file lock en Windows (el .dll está en uso). Requiere cerrar procesos que usen la BD antes de regenerar. Los modelos JobSearchConfig y JobListing existen en el schema pero el client tipado no los refleja aún.

---

## Métricas

- Paquetes: 8 (core, persistence, output-engine, ai-adapter, ocr-adapter, storage-adapter, rules-engine, job-scanner) + 1 API + 1 app web
- Tests unitarios: 102 (rules-engine 28 + job-scanner 25 + output-engine 9 + api 20 + ai-adapter 13 + ocr-adapter 9 - 2 overlap)
- Endpoints API: 22 (CRUD perfil + output + validate + document CRUD + evidence + AI analyze + templates + job-configs CRUD + scan + listings CRUD + evaluate)
- Templates de renderizado: 2 (standard, minimal)
- Portales de empleo: 1 (CompuTrabajo Bolivia)

---

## Última Actualización

2026-07-25
