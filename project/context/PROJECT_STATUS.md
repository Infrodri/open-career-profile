# Estado del Proyecto

> Snapshot actual. Se actualiza cada vez que el estado del proyecto cambia.

---

## Fase

Development (Fase 7 — integración en curso)

---

## Trabajo Actual

Flujo completo de captura de documentos implementado. Sistema funcional de punta a punta.

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

---

## Funcionalidades disponibles

| Funcionalidad | Estado |
|--------------|--------|
| Crear/editar/ver perfil profesional | ✅ Funcional |
| Subir documento (foto/PDF/imagen) | ✅ Funcional |
| Extracción de texto de PDF | ✅ Funcional (pdf-parse) |
| OCR de imágenes | ✅ Funcional (Tesseract.js) |
| IA extrae perfil COMPLETO del documento | ✅ Funcional (todas las secciones a la vez) |
| IA genera recomendaciones de qué falta | ✅ Funcional |
| Usuario revisa y edita todo lo extraído | ✅ Funcional |
| Importar perfil completo de una vez | ✅ Funcional (POST /api/profiles/import) |
| Generar CV en HTML o PDF | ✅ Funcional |
| Motor de reglas institucionales | ❌ Pendiente |
| Sistema de plugins | ❌ Pendiente (arquitectura lista) |

---

## Siguiente

Motor de reglas institucionales: permitir que diferentes instituciones definan sus requisitos de formato y contenido.

---

## Bloqueantes

Ninguno.

---

## Métricas

- Paquetes: 6 (core, persistence, output-engine, ai-adapter, ocr-adapter, api) + 1 app web
- Tests unitarios: 59
- Endpoints API: 7 (CRUD + output + document extract + AI analyze + section add)
- Templates: 2 (standard, minimal)

---

## Última Actualización

2026-07-25
