# SPEC-009 — Adaptación de Formato con IA

> Estado: ✅ Completada
> Fecha de implementación: 2026-07
> Dependencias: SPEC-007 (motor de reglas), SPEC-008 (plantillas dinámicas)

---

## Resumen

Permitir que el usuario suba el formato/formulario que le pide una institución. La IA analiza el documento, detecta qué campos y secciones requiere, y propone un `InstitutionalRuleSet` automáticamente. Además, puede adaptar los textos del perfil al tono institucional sin inventar información.

---

## Requisitos

### R1. Endpoint `POST /api/ai/analyze-format`

**Input:** `{ text: string }` (texto extraído del formato institucional).

**Prompt:** La IA recibe el texto del formato y debe identificar:
- Secciones obligatorias del perfil.
- Secciones a incluir/excluir.
- Si requiere foto.
- Si solo acepta información verificada.
- Límite de páginas/caracteres.
- Notas adicionales sobre el formato.

**Output:**
```typescript
{
  ruleSet: InstitutionalRuleSet; // propuesto, sin persistir
  confidence: number;            // 0.0 - 1.0
  notes: string;                 // observaciones de la IA
}
```

**Criterio de aceptación:**
- Si la IA no está disponible, retorna un ruleSet vacío con confidence 0 y un mensaje explicativo. Nunca falla.
- Si la respuesta de la IA no es parseable, retorna el fallback.
- Las section keys del ruleSet propuesto se validan contra PROFILE_SECTION_KEYS.

---

### R2. Endpoint `POST /api/ai/adapt-profile`

**Input:** `{ profileId: string, ruleSetId: string }`

**Prompt:** La IA recibe el perfil y las reglas del formato, y produce:
- Resumen profesional reescrito para el tono institucional.
- Lista de información faltante para cumplir el formato.
- Sugerencias concretas de mejora.

**Output:**
```typescript
{
  adaptedSummary: string;
  adaptedDescriptions: Array<{ section, entryId, original, adapted }>;
  missingInfo: string[];
  suggestions: string[];
}
```

**Criterio de aceptación:**
- **No modifica el perfil.** Solo devuelve la propuesta.
- Nunca inventa experiencia ni habilidades que no estén en el perfil.
- Solo reformula lo que ya existe.
- Si la IA no está disponible, retorna estructura vacía con sugerencia.
- 404 si el perfil o la plantilla no existen.

---

### R3. Degradación sin IA

**Criterio de aceptación:**
- Ambos endpoints responden 200 con estructura vacía cuando `aiProvider.isAvailable() === false`.
- El mensaje indica que la IA no está configurada.
- Nunca retornan 500 por falta de IA.

---

### R4. Frontend — FormatImportPage (`/importar-formato`)

Flujo de 3 pasos:

**Paso 1:** Subir formato institucional (PDF o imagen).
- Reutiliza `DocumentUploader` existente.
- Al subir, llama a `/api/documents/extract` para obtener el texto.

**Paso 2:** Analizar con IA.
- Muestra preview del texto extraído.
- Botón "Analizar formato con IA".
- Llama a `POST /api/ai/analyze-format`.

**Paso 3:** Revisar y guardar.
- Muestra las reglas detectadas con código de colores:
  - Rojo: secciones obligatorias.
  - Verde: secciones a incluir.
  - Gris: secciones excluidas.
  - Badges: "Solo verificados", "Requiere foto".
- Muestra confianza (%) y notas de la IA.
- Botón "Guardar como formato institucional" → persiste como `InstitutionalTemplate`.
- Botón "Empezar de nuevo" para reiniciar el flujo.

**Criterio de aceptación:**
- Cada paso es claro y reversible.
- El usuario siempre revisa antes de guardar (human-in-the-loop).
- Funciona sin IA (se queda en paso 2 con mensaje explicativo).

---

### R5. Navegación

**Criterio de aceptación:**
- Item "Importar Formato" en el sidebar con ícono de upload.
- Ruta `/importar-formato`.
- Accesible desde la navegación principal.

---

## Verificación

- `npx tsc --noEmit` limpio en api y web.
- Tests existentes sin regresiones.
- Endpoint analyze-format con mock de IA devuelve un ruleSet bien formado.
- Endpoint adapt-profile con mock de IA devuelve adaptedSummary sin inventar.
- Sin IA disponible, ambos responden 200 con estructura vacía.
- FormatImportPage funciona de punta a punta.

---

## Archivos creados/modificados

- `apps/api/src/routes/ai-format.routes.ts` (nuevo)
- `apps/web/src/pages/FormatImportPage.tsx` (nuevo)
- `apps/web/src/api/ai-format.api.ts` (nuevo)
- `apps/api/src/app.ts` (wiring)
- `apps/web/src/App.tsx` (ruta)
- `apps/web/src/components/Layout.tsx` (nav item)

---

# Fin del Documento
