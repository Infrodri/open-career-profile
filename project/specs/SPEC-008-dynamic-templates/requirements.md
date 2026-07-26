# SPEC-008 — Plantillas Dinámicas de Diseño

> Estado: ✅ Completada
> Fecha de implementación: 2026-07
> Dependencias: SPEC-007 (motor de reglas)

---

## Resumen

Permitir que los usuarios creen, editen y previsualicen plantillas de diseño (Handlebars HTML) sin modificar el código del sistema. El output-engine se refactorizó para soportar plantillas inyectadas desde la BD además de las built-in.

---

## Requisitos

### R1. Modelo `OutputTemplate` en Prisma

```prisma
model OutputTemplate {
  id          String   @id @default(uuid())
  name        String
  description String?
  category    String   @default("cv") // cv | portfolio | academic | institutional | government
  source      String   @db.Text        // Handlebars HTML source
  isBuiltIn   Boolean  @default(false)
  ruleSetId   String?                  // Optional: associated InstitutionalTemplate id
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([category])
}
```

**Criterio de aceptación:**
- `source` almacena el contenido Handlebars completo.
- `isBuiltIn` protege las plantillas del sistema contra edición/eliminación.
- `category` permite filtrar por tipo de documento.
- `ruleSetId` vincula opcionalmente a una plantilla institucional.

---

### R2. Refactorizar `output-engine/templates/registry.ts`

**Criterio de aceptación:**
- Clase `TemplateRegistry` (singleton) reemplaza las funciones sueltas.
- Built-in (`standard`, `minimal`) se cargan desde archivos .hbs al arrancar.
- `registerTemplate(id, source)` — agrega plantillas dinámicas en runtime.
- `removeTemplate(id)` — elimina del cache (protege built-in).
- `invalidate(id, newSource)` — recompila una plantilla actualizada.
- `compilePreview(source)` — compila sin cachear (para previews efímeros).
- `getTemplate(id)` — retorna la plantilla compilada (lanza si no existe).
- `getTemplateIds()` — lista todos los IDs disponibles.
- `isBuiltIn(id)` — verifica si un ID es built-in.
- Funciones legacy `getTemplate()` y `getTemplateIds()` siguen exportándose para compatibilidad.

---

### R3. Helpers seguros de Handlebars

Registrados al inicializar el registry. Solo helpers que NO ejecutan código arbitrario.

| Helper | Uso | Ejemplo |
|--------|-----|---------|
| `formatDate` | Formatea fechas ISO a formato legible | `{{formatDate startDate}}` |
| `join` | Une un array con separador | `{{join skills ", "}}` |
| `truncate` | Trunca string a N caracteres | `{{truncate summary 200}}` |
| `ifEquals` | Bloque condicional por igualdad | `{{#ifEquals level "advanced"}}...{{/ifEquals}}` |
| `hasItems` | Bloque si el array tiene elementos | `{{#hasItems sections.idiomas}}...{{/hasItems}}` |

**Criterio de aceptación:**
- Handlebars compila con `noEscape: false` (escape HTML por defecto activo).
- `{{variable}}` escapa HTML automáticamente. Solo `{{{variable}}}` es raw.
- No se permiten helpers que ejecuten funciones arbitrarias.

---

### R4. Seguridad

**Criterio de aceptación:**
- El source Handlebars se compila con escape HTML por defecto.
- En el endpoint de preview, los tags `<script>` se eliminan del output renderizado.
- Las plantillas built-in no se pueden editar ni eliminar (403).
- Se valida que el source compile antes de guardarlo (400 si tiene errores).

---

### R5. Endpoints CRUD

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/output-templates` | Lista (filtro opcional `?category=`) |
| GET | `/api/output-templates/:id` | Obtiene una (incluye source) |
| POST | `/api/output-templates` | Crea (valida compilación del source) |
| PUT | `/api/output-templates/:id` | Actualiza (403 si isBuiltIn) |
| DELETE | `/api/output-templates/:id` | Elimina (403 si isBuiltIn) |
| POST | `/api/output-templates/preview` | Renderiza source con datos de ejemplo → HTML |

**Criterio de aceptación:**
- POST valida que el source Handlebars compile correctamente.
- PUT invalida el cache y recompila.
- DELETE limpia del cache.
- Preview usa datos de ejemplo realistas (perfil con nombre, experiencia, habilidades).
- Preview retorna `text/html` (no JSON).

---

### R6. Frontend — DesignTemplatesPage (`/diseno`)

**Criterio de aceptación:**
- Lista plantillas existentes con nombre, categoría, badge built-in.
- Formulario de creación con:
  - Inputs: nombre, descripción, categoría.
  - Textarea con el source Handlebars (con template starter precargado).
  - Botón "Previsualizar" que renderiza en un iframe sandbox.
- Preview se muestra en un iframe debajo del editor.
- Las built-in se muestran pero sin botón de eliminar.
- Documentación visual de variables disponibles.

---

## Verificación

- Tests de output-engine siguen pasando (9 tests, sin regresiones).
- `npx tsc --noEmit` limpio en output-engine, api, web.
- Los helpers `formatDate`, `join`, `truncate`, `ifEquals`, `hasItems` funcionan en templates.
- Preview con `<script>alert(1)</script>` NO ejecuta el script.

---

## Archivos creados/modificados

- `packages/persistence/src/prisma/schema.prisma` (modelo OutputTemplate)
- `packages/output-engine/src/templates/registry.ts` (refactorizado completo)
- `packages/output-engine/src/index.ts` (exports actualizados)
- `apps/api/src/routes/output-template.routes.ts` (nuevo)
- `apps/web/src/pages/DesignTemplatesPage.tsx` (nuevo)
- `apps/web/src/api/output-template.api.ts` (nuevo)

---

# Fin del Documento
