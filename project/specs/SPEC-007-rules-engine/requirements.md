# SPEC-007 — Motor de Reglas Institucionales

> Estado: ✅ Completada
> Fecha de implementación: 2026-07

---

## Resumen

Motor que permite que diferentes instituciones definan sus requisitos de formato y contenido para los CVs generados. Valida perfiles contra reglas y produce vistas transformadas (sin mutar el original) que cumplen los requisitos institucionales.

---

## Requisitos

### R1. Interfaces en `@ocp/core`

**InstitutionalRuleSet:**
```typescript
interface InstitutionalRuleSet {
  requiredSections: Array<keyof ProfileSections>;
  includeSections: Array<keyof ProfileSections>;
  excludeSections: Array<keyof ProfileSections>;
  onlyVerified: boolean;
  requirePhoto: boolean;
  maxPages?: number;
  maxSummaryLength?: number;
  notes?: string;
}
```

**ValidationResult:**
```typescript
interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  field?: string;
}
```

**RulesEngine port:**
```typescript
interface RulesEngine {
  validate(profile: ProfessionalProfile, rules: InstitutionalRuleSet): ValidationResult;
  applyRules(profile: ProfessionalProfile, rules: InstitutionalRuleSet): ProfessionalProfile;
}
```

**Criterio de aceptación:**
- Definidos en `packages/core/src/interfaces/rules-engine.ts`.
- Exportados desde el barrel del paquete.

---

### R2. Paquete `@ocp/rules-engine`

Implementación del puerto `RulesEngine`.

**Criterio de aceptación:**
- Clase `InstitutionalRulesEngine` implementa `RulesEngine`.
- Zero dependencias runtime más allá de `@ocp/core`.

---

### R3. `validate()` — Validación del perfil

Evalúa un perfil contra un conjunto de reglas SIN modificarlo.

**Reglas validadas:**
- Secciones obligatorias vacías → `error` (código `MISSING_REQUIRED_SECTION`).
- Foto requerida pero ausente → `error` (código `MISSING_PHOTO`).
- Resumen excede longitud máxima → `warning` (código `SUMMARY_TOO_LONG`).
- Entradas sin verificar cuando `onlyVerified = true` → `warning` (código `UNVERIFIED_ENTRIES`).
- Notas institucionales → `info` (código `INSTITUTIONAL_NOTE`).

**Criterio de aceptación:**
- `valid = true` solo si no hay issues con severity `error`.
- Warnings e info no bloquean la validación.

---

### R4. `applyRules()` — Transformación del perfil

Produce una **vista** transformada del perfil (nunca muta el original).

**Transformaciones:**
1. Filtrar secciones (whitelist con `includeSections` o blacklist con `excludeSections`).
2. Eliminar entradas sin verificar si `onlyVerified = true`.
3. Truncar `summary` si excede `maxSummaryLength`.

**Criterio de aceptación:**
- El perfil original no se modifica (inmutabilidad).
- Secciones excluidas retornan array vacío.
- Modo whitelist: solo `includeSections` se incluyen.
- Modo blacklist: todo se incluye excepto `excludeSections`.
- Whitelist tiene prioridad sobre blacklist cuando ambos tienen elementos.

---

### R5. `parseRuleSet()` — Parseo de JSON a tipo estricto

Convierte el campo `rules` (Json de Prisma) al tipo `InstitutionalRuleSet`.

**Criterio de aceptación:**
- Input `null`/`undefined`/no-objeto → retorna defaults (todo permisivo).
- Campos faltantes → usan default.
- Section keys inválidas se filtran silenciosamente.
- Booleanos no-booleanos → `false`.
- Números no-positivos → `undefined`.

---

### R6. Modelo `InstitutionalTemplate` en Prisma

```prisma
model InstitutionalTemplate {
  id            String   @id @default(uuid())
  name          String
  institution   String
  description   String?  @db.Text
  templatePath  String?
  rules         Json
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Criterio de aceptación:**
- `rules` almacena un `InstitutionalRuleSet` como JSON.
- `templatePath` es opcional (para subir el formato original como archivo).

---

### R7. CRUD de Plantillas Institucionales

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/templates` | Lista todas las plantillas |
| GET | `/api/templates/:id` | Obtiene una |
| POST | `/api/templates` | Crea (con archivo opcional) |
| PUT | `/api/templates/:id` | Actualiza |
| DELETE | `/api/templates/:id` | Elimina (con archivo si existe) |
| GET | `/api/templates/:id/file` | Descarga formato original |

**Criterio de aceptación:**
- Soporta upload de archivo de plantilla via multipart.
- Al eliminar, borra el archivo de storage si existe.
- Al actualizar con nuevo archivo, elimina el anterior.

---

### R8. Endpoint de validación

`POST /api/profiles/:id/validate`

**Criterio de aceptación:**
- Recibe `{ ruleSetId }` en el body.
- Busca la plantilla, parsea sus reglas, y ejecuta `validate()`.
- 404 si perfil o plantilla no existen.
- Retorna `ValidationResult` con issues tipados.

---

### R9. Integración con generación de output

`POST /api/profiles/:id/output` acepta `ruleSetId` opcional.

**Criterio de aceptación:**
- Sin `ruleSetId`: comportamiento original (genera con el perfil tal cual).
- Con `ruleSetId`:
  1. Valida el perfil contra las reglas.
  2. Si hay errores → responde 422 con los issues.
  3. Si pasa validación → aplica reglas y genera con el perfil transformado.

---

### R10. Frontend — OutputGenerator actualizado

**Criterio de aceptación:**
- Selector de plantilla institucional (carga desde `/api/templates`).
- Botón "Verificar requisitos" que ejecuta validación.
- Display visual de resultados: errores (rojo), warnings (ámbar), notas (azul).
- Botón de generar deshabilitado si hay errores de validación.
- Opción "Sin formato institucional" para generar sin restricciones.

---

### R11. `RuleSetResolver` — servicio puente

**Criterio de aceptación:**
- Lee `InstitutionalTemplate` desde Prisma por ID.
- Usa `parseRuleSet()` para convertir el JSON.
- Retorna `null` si el template no existe.

---

## Verificación

- 28 tests unitarios en `@ocp/rules-engine`:
  - `validate`: secciones requeridas, foto, summary, unverified, notes.
  - `applyRules`: exclude, include, onlyVerified, truncate, inmutabilidad, combinaciones.
  - `parseRuleSet`: null, undefined, invalids, valid complete input.
- `npx tsc --noEmit` limpio en core, rules-engine, api, web.
- 0 regresiones en tests existentes.

---

## Paquete creado

- `@ocp/rules-engine` — depende solo de `@ocp/core`

---

# Fin del Documento
