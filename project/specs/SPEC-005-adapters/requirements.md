# SPEC-005 — Adaptadores de IA y OCR

> Estado: ✅ Completada
> Fecha de implementación: 2026-07

---

## Resumen

Implementar adaptadores de IA y OCR como paquetes independientes siguiendo el patrón Ports & Adapters. La IA es opcional (degrada con gracia) y soporta cualquier proveedor OpenAI-compatible. El OCR extrae texto de imágenes localmente.

---

## Requisitos

### R1. Puerto de IA (`AiProvider`)

El dominio define un puerto para generación de texto por IA.

**Interfaz:**
```typescript
interface AiProvider {
  complete(prompt: string): Promise<string>;
  isAvailable(): boolean;
}
```

**Criterio de aceptación:**
- La interfaz vive dentro del paquete `@ocp/ai-adapter`.
- `isAvailable()` retorna `false` si el proveedor no está configurado.
- `complete()` nunca lanza excepciones: devuelve mensajes de error como string.
- La IA es completamente opcional. El sistema funciona sin ella.

---

### R2. Adaptador OpenAI-Compatible (`OpenAiCompatibleAdapter`)

Implementación que funciona con OpenAI, Ollama, OpenRouter, Together, y cualquier API compatible.

**Criterio de aceptación:**
- Usa `fetch()` nativo, sin SDKs externos.
- Timeout de 60 segundos con `AbortController`.
- Si `apiKey` está vacío, no envía header `Authorization` (compatible con Ollama local).
- Si el `baseUrl` incluye `openrouter.ai`, agrega headers de atribución.
- Errores HTTP se reportan como `[AI error] HTTP {status}: {body}`.
- Errores de red se reportan como `[AI error] {message}`.
- Incluye método `checkConnection()` para diagnóstico.

---

### R3. Configuración por variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `OCP_AI_BASE_URL` | `http://localhost:11434/v1` | URL base de la API |
| `OCP_AI_API_KEY` | `""` | API key (vacío para proveedores locales) |
| `OCP_AI_MODEL` | `llama3` | Nombre del modelo |
| `OCP_AI_MAX_TOKENS` | `1000` | Máximo de tokens en respuesta |
| `OCP_AI_TEMPERATURE` | `0.7` | Temperatura de generación |

**Criterio de aceptación:**
- Valores inválidos en numeros usan el default.
- Sin variables configuradas, apunta a Ollama local.

---

### R4. Puerto de OCR (`OcrProvider`)

Puerto para extracción de texto de imágenes.

**Interfaz:**
```typescript
interface OcrProvider {
  extractText(imageBuffer: Buffer, language?: string): Promise<string>;
  isAvailable(): boolean;
}
```

**Criterio de aceptación:**
- `isAvailable()` retorna `false` si el OCR está deshabilitado.
- `extractText()` nunca lanza: retorna string vacío en error.
- Soporta override de idioma por llamada.

---

### R5. Adaptador Tesseract.js (`TesseractAdapter`)

Implementación de OCR local con Tesseract.js.

**Criterio de aceptación:**
- Usa `tesseract.js` v5 directamente.
- Idioma default configurable por env var.
- Si está deshabilitado, retorna string vacío inmediatamente.
- Errores internos de Tesseract se capturan y retornan string vacío.

---

### R6. Configuración OCR

| Variable | Default | Descripción |
|----------|---------|-------------|
| `OCP_OCR_ENABLED` | `true` | Habilitar/deshabilitar OCR |
| `OCP_OCR_LANGUAGE` | `eng` | Código de idioma Tesseract |

---

### R7. Análisis multi-pass de documentos

Servicio en la API que usa el adaptador de IA para extraer un perfil profesional completo de un documento.

**Criterio de aceptación:**
- Pass 1: extrae información personal + detecta qué secciones existen.
- Pass 2-N: un prompt enfocado por sección detectada.
- Cada llamada es rápida (3-8s) y usa pocos tokens.
- Si una sección falla, el resto continúa.
- Devuelve `confidence` basado en cuánta información se extrajo.
- Callback de progreso para el frontend.

---

### R8. Endpoints de API

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/ai/status` | Verifica conectividad con el proveedor de IA |
| POST | `/api/ai/analyze` | Analiza texto y extrae perfil completo (multi-pass) |

**Criterio de aceptación:**
- Si la IA no está disponible, `/analyze` devuelve respuesta vacía con recomendación, nunca falla.
- `/status` nunca falla (informa el estado como datos).

---

## Verificación

- 13 tests unitarios en `@ocp/ai-adapter` (disponibilidad, request format, auth headers, errores).
- 9 tests unitarios en `@ocp/ocr-adapter` (disponibilidad, extracción, idioma, errores, config).
- `npx tsc --noEmit` limpio en ambos paquetes.

---

## Paquetes creados

- `@ocp/ai-adapter` — 0 dependencias runtime
- `@ocp/ocr-adapter` — tesseract.js 5.1.1

---

# Fin del Documento
