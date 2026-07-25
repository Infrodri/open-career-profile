# Plan de Desarrollo — Funcionalidades Pendientes

> **Fecha:** 2026-07-25
> **Dirigido a:** Agente de implementación
> **Documentos que debes leer antes de empezar:**
> 1. `.kiro/steering/project-identity.md` (autoridad máxima)
> 2. `.kiro/steering/architecture.md` (restricciones permanentes)
> 3. `.kiro/steering/tech-stack.md` (tecnologías aprobadas)
> 4. `.kiro/steering/development-rules.md` (convenciones)
> 5. `project/domain/DOMAIN_DISCOVERY.md` (conceptos del dominio)
> 6. `project/context/PROJECT_STATUS.md` (estado actual)

---

## Contexto: la visión completa del producto

El usuario debe poder:

1. Subir un CV desactualizado → el sistema lo convierte en Perfil Profesional estructurado. **(YA FUNCIONA)**
2. Subir certificados/títulos/contratos uno por uno (foto o PDF) → se acumulan en el perfil **con el archivo original guardado como evidencia**. **(PARCIAL — falta guardar el archivo)**
3. Tener toda la información como fuente única de verdad persistente. **(PARCIAL — falta evidencias)**
4. Subir el formato específico que pide una institución → la IA reorganiza y adapta la información del perfil a ese formato. **(NO EXISTE)**

Este plan cubre lo que falta, en orden de dependencia.

---

## Estado verificado del código

### Existe y funciona

| Componente | Detalle |
|---|---|
| `@ocp/core` | Dominio puro, 12 secciones, factories, validación Zod, port `ProfileRepository` |
| `@ocp/persistence` | Prisma + PostgreSQL, 14 modelos, mapper dominio↔BD |
| `@ocp/ocr-adapter` | Tesseract.js, port `OcrProvider` |
| `@ocp/ai-adapter` | OpenAI-compatible (cualquier proveedor), port `AiProvider` |
| `@ocp/output-engine` | Handlebars + Puppeteer, port `PdfRenderer` |
| `@ocp/api` | Express, 9 endpoints |
| `@ocp/web` | React 19 + Vite + Tailwind, 5 páginas, 7 componentes |

### Confirmado ausente (grep en todo el repo)

| Falta | Evidencia |
|---|---|
| Persistencia de archivos subidos | `document.routes.ts` usa `multer.memoryStorage()`, el buffer se descarta |
| Modelo `Document` / `Evidence` en BD | `schema.prisma` tiene 14 modelos, ninguno de documentos |
| Vinculación evidencia ↔ entrada del perfil | Las entidades no tienen campos de attachment |
| Motor de reglas institucionales | Cero resultados para `InstitutionalRule`, `FormatRule` |
| Gestión dinámica de plantillas | `registry.ts` hardcodea `TEMPLATE_IDS = ['standard','minimal']` |
| Sistema de plugins | Cero puntos de extensión, cero carga dinámica |
| Autenticación | Sin middleware de auth; la API está abierta |
| Listado de perfiles | No hay endpoint `GET /api/profiles` |

---

## SPEC-006 — Almacenamiento de Documentos y Evidencias

**Prioridad: CRÍTICA.** Es el principio "Evidence Driven" de `project-identity.md`. Sin esto el perfil guarda afirmaciones sin respaldo.

### Requisitos

**R1.** Los documentos subidos se persisten en disco local (nunca en la nube — principio Privacy First).

**R2.** Nuevo modelo `Document` en Prisma:

```prisma
model Document {
  id           String   @id @default(uuid())
  profileId    String
  fileName     String
  mimeType     String
  sizeBytes    Int
  storagePath  String   // ruta relativa dentro del directorio de storage
  documentType String?  // certificado | titulo | contrato | hoja_de_vida | otro
  extractedText String? @db.Text
  createdAt    DateTime @default(now())
  profile      Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  evidences    Evidence[]
}
```

**R3.** Nuevo modelo `Evidence` que vincula un documento con una entrada específica del perfil:

```prisma
model Evidence {
  id          String   @id @default(uuid())
  documentId  String
  sectionType String   // workExperience | education | certifications | courses | skills | languages
  entryId     String   // id de la entrada dentro de esa sección
  note        String?
  createdAt   DateTime @default(now())
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
}
```

**R4.** Adaptador de storage con puerto en `@ocp/core`:

```typescript
// packages/core/src/interfaces/document-storage.ts
export interface DocumentStorage {
  save(buffer: Buffer, fileName: string): Promise<string>; // devuelve storagePath
  read(storagePath: string): Promise<Buffer>;
  delete(storagePath: string): Promise<void>;
  exists(storagePath: string): Promise<boolean>;
}
```

Implementación: nuevo paquete `@ocp/storage-adapter` con `LocalFileStorage` que guarda en el directorio de `OCP_STORAGE_PATH` (default: `./storage/documents`). Organizar por `{profileId}/{uuid}-{fileName}` para evitar colisiones.

**R5.** Entidades del dominio en `@ocp/core`: `Document` y `Evidence` como interfaces, con sus factories y schemas Zod.

**R6.** Modificar `POST /api/documents/extract` para que guarde el archivo antes de extraer el texto, y devuelva el `documentId`.

**R7.** Nuevos endpoints:

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/profiles/:id/documents` | Lista documentos del perfil |
| GET | `/api/documents/:id/file` | Descarga/visualiza el archivo original |
| DELETE | `/api/documents/:id` | Elimina documento y su archivo del disco |
| POST | `/api/documents/:id/evidence` | Vincula documento a una entrada (`{sectionType, entryId, note?}`) |
| DELETE | `/api/evidence/:id` | Desvincula |

**R8.** Modificar `POST /api/profiles/import` para que acepte `documentId` opcional y cree automáticamente las `Evidence` vinculando ese documento a todas las entradas que se crearon a partir de él.

**R9.** Frontend:
- En `ProfileView.tsx`: cada entrada muestra un ícono de clip si tiene evidencia, con enlace al documento original.
- Nueva página `DocumentsPage.tsx` (`/documentos`): lista todos los documentos subidos con preview, tipo, fecha, y qué entradas respaldan.
- En `Layout.tsx`: agregar item de navegación "Mis Documentos".

**R10.** Agregar `storage/` al `.gitignore`.

### Invariantes (de DOMAIN_DISCOVERY.md, respetarlas)

- La evidencia es siempre opcional; se puede agregar información sin evidencia.
- Un documento puede respaldar múltiples entradas de múltiples secciones.
- Quitar la evidencia no elimina la entrada del perfil.
- Un documento puede existir sin estar vinculado a nada.
- La evidencia siempre preserva la procedencia (qué documento, cuándo).

### Verificación

- Tests unitarios del `LocalFileStorage` (save, read, delete, exists).
- Test de integración: subir documento → verificar archivo en disco → verificar registro en BD.
- Test: eliminar documento borra el archivo físico.
- `npx tsc --noEmit` limpio en todos los paquetes.

---

## SPEC-007 — Motor de Reglas Institucionales

**Prioridad: ALTA.** Es el diferenciador del producto según `project-identity.md`. Depende de SPEC-006 (necesita que las plantillas puedan ser dinámicas).

### Requisitos

**R1.** Nuevo paquete `@ocp/rules-engine`.

**R2.** Modelo de reglas (definido en `@ocp/core`):

```typescript
export interface InstitutionalRuleSet {
  id: string;
  institutionName: string;
  description?: string;
  requiredFields: string[];      // ej: ['personalInfo.fullName', 'personalInfo.photo']
  hiddenSections: string[];       // ej: ['projects', 'volunteering']
  sectionOrder: string[];         // orden de renderizado
  fieldLimits: Record<string, number>;  // ej: { 'summary': 500 }
  maxPages?: number;
  dateFormat?: string;            // ej: 'DD/MM/YYYY'
  requiresPhoto: boolean;
  customNotes?: string[];         // ej: ['Adjuntar declaración jurada']
  createdAt: Date;
  updatedAt: Date;
}
```

**R3.** Persistencia: modelo `InstitutionalRuleSet` en Prisma. Los arrays como `String[]`, `fieldLimits` como `Json`.

**R4.** Servicio de validación:

```typescript
export interface ValidationResult {
  valid: boolean;
  missingRequired: string[];
  warnings: string[];      // ej: "El resumen excede 500 caracteres"
  suggestions: string[];   // generadas por IA si está disponible
}

export class RulesEngine {
  validate(profile: ProfessionalProfile, rules: InstitutionalRuleSet): ValidationResult;
  applyRules(profile: ProfessionalProfile, rules: InstitutionalRuleSet): ProfessionalProfile;
}
```

`applyRules` devuelve una **vista** del perfil (no modifica el original — el perfil es la fuente de verdad): oculta secciones, reordena, trunca campos según los límites, reformatea fechas.

**R5.** Endpoints:

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/rules` | Lista conjuntos de reglas |
| POST | `/api/rules` | Crea conjunto de reglas |
| GET | `/api/rules/:id` | Obtiene uno |
| PUT | `/api/rules/:id` | Actualiza |
| DELETE | `/api/rules/:id` | Elimina |
| POST | `/api/profiles/:id/validate` | Valida perfil contra reglas (`{ruleSetId}`) |

**R6.** Modificar `POST /api/profiles/:id/output` para aceptar `ruleSetId` opcional. Si se envía: validar primero, aplicar reglas, y generar el output con el perfil transformado. Si la validación falla con campos requeridos ausentes, devolver 422 con el detalle.

**R7.** Frontend:
- Página `RulesPage.tsx` (`/reglas`): CRUD de conjuntos de reglas con formulario.
- En `OutputGenerator.tsx`: selector opcional "Formato institucional". Al elegir uno, mostrar el resultado de validación antes de permitir generar (campos faltantes en rojo, advertencias en ámbar).

**R8.** Precargar 3 conjuntos de reglas de ejemplo vía seed de Prisma: "Empresa Privada", "Institución Pública", "Perfil Académico".

### Verificación

- Tests de `validate`: detecta campos requeridos ausentes, detecta exceso de longitud.
- Tests de `applyRules`: oculta secciones, respeta orden, trunca campos.
- Test: `applyRules` NO modifica el perfil original (inmutabilidad).
- Test de integración: generar output con reglas produce HTML sin las secciones ocultas.

---

## SPEC-008 — Plantillas Dinámicas

**Prioridad: ALTA.** Requisito explícito: "el usuario podrá generar plantillas sin modificar el sistema". Depende de SPEC-007 (las plantillas se asocian a reglas).

### Requisitos

**R1.** Modelo `Template` en Prisma:

```prisma
model Template {
  id           String   @id @default(uuid())
  name         String
  description  String?
  category     String   // cv | portfolio | academic | institutional | government
  source       String   @db.Text  // contenido Handlebars
  isBuiltIn    Boolean  @default(false)
  ruleSetId    String?  // regla institucional asociada (opcional)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**R2.** Refactorizar `packages/output-engine/src/templates/registry.ts`:
- Quitar `TEMPLATE_IDS` hardcodeado.
- El registry recibe las plantillas por inyección (desde BD) o desde archivos built-in.
- Compilar bajo demanda con caché en memoria (invalidar al actualizar la plantilla).
- Mantener `standard` y `minimal` como built-in (seed en BD con `isBuiltIn: true`, no borrables).

**R3.** Endpoints:

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/templates` | Lista plantillas (filtro opcional por `category`) |
| POST | `/api/templates` | Crea plantilla |
| GET | `/api/templates/:id` | Obtiene una |
| PUT | `/api/templates/:id` | Actualiza (rechazar si `isBuiltIn`) |
| DELETE | `/api/templates/:id` | Elimina (rechazar si `isBuiltIn`) |
| POST | `/api/templates/preview` | Preview con datos de ejemplo (`{source}`) |

**R4.** Seguridad crítica: las plantillas son HTML/Handlebars provisto por el usuario.
- Compilar Handlebars con `noEscape: false` (escape por defecto activo).
- Sanitizar el HTML resultante antes de renderizar a PDF.
- No permitir helpers que ejecuten código arbitrario.
- Documentar en el código por qué cada medida existe.

**R5.** Registrar helpers de Handlebars útiles y seguros: `formatDate`, `join`, `truncate`, `ifEquals`.

**R6.** Frontend:
- Página `TemplatesPage.tsx` (`/plantillas`): lista con preview, crear/editar/eliminar.
- Editor de plantilla: textarea con el source Handlebars + botón "Previsualizar" que renderiza con datos de ejemplo.
- Marcar visualmente las built-in como no editables.

### Verificación

- Test: crear plantilla, generar output con ella.
- Test: no se puede eliminar ni editar una built-in.
- Test de seguridad: una plantilla con `<script>alert(1)</script>` no ejecuta el script en el output.
- Test: el caché se invalida al actualizar la plantilla.

---

## SPEC-009 — Adaptación de Formato con IA

**Prioridad: ALTA.** Es el punto 4 de la visión del usuario y actualmente no existe nada. Depende de SPEC-007 y SPEC-008.

### El flujo que debe funcionar

```
Usuario sube el formulario/formato que le pide una institución (PDF o imagen)
      ↓
El sistema extrae el texto del formato
      ↓
La IA analiza el formato e identifica:
   - qué campos pide
   - qué secciones requiere
   - en qué orden
   - qué restricciones tiene (longitud, fechas, foto)
      ↓
El sistema propone un InstitutionalRuleSet generado automáticamente
      ↓
El usuario revisa y ajusta las reglas detectadas
      ↓
Se guarda como conjunto de reglas reutilizable
      ↓
Al generar el output con esas reglas, la IA además:
   - reescribe/adapta los textos del perfil al tono del formato
   - señala qué información falta para cumplir el formato
```

### Requisitos

**R1.** Endpoint `POST /api/ai/analyze-format`:
- Recibe `{text}` (el texto extraído del formato institucional).
- Prompt en español que pida a la IA identificar campos requeridos, secciones, orden, restricciones.
- Devuelve un `InstitutionalRuleSet` propuesto (sin persistir) + `confidence` + `notes`.

**R2.** Endpoint `POST /api/ai/adapt-profile`:
- Recibe `{profileId, ruleSetId}`.
- La IA recibe el perfil y las reglas, y devuelve:
  - textos adaptados (resumen reescrito para ese contexto, descripciones ajustadas)
  - lista de información faltante para cumplir el formato
  - sugerencias concretas de mejora
- **No modifica el perfil.** Devuelve la propuesta para que el usuario decida.

**R3.** Ambos endpoints deben degradar con gracia si la IA no está disponible (devolver estructura vacía con mensaje explicativo, nunca fallar).

**R4.** Frontend: nueva página `FormatImportPage.tsx` (`/importar-formato`):
- Subida del formato institucional (reusar `DocumentUploader`).
- Pantalla de revisión de las reglas detectadas (editable, similar a `ExtractedProfileReview`).
- Botón "Guardar como formato institucional".

**R5.** En `OutputGenerator.tsx`: al elegir un formato institucional, botón "Adaptar con IA" que muestra los textos propuestos y permite aceptarlos antes de generar.

### Verificación

- Test con mock de IA: `analyze-format` devuelve un RuleSet bien formado.
- Test: sin IA disponible, ambos endpoints responden 200 con estructura vacía y mensaje.
- Test: `adapt-profile` no persiste cambios en el perfil.

---

## SPEC-010 — Sistema de Plugins

**Prioridad: MEDIA.** Requisito de `project-identity.md` (principio Plugin First). La arquitectura ya lo permite; falta la implementación.

### Requisitos

**R1.** Definir en `@ocp/core` la interfaz de plugin:

```typescript
export interface PluginManifest {
  name: string;
  version: string;
  type: 'ocr' | 'ai' | 'render' | 'export' | 'validation';
  description: string;
}

export interface Plugin {
  manifest: PluginManifest;
  register(registry: PluginRegistry): void;
}

export interface PluginRegistry {
  registerOcrProvider(name: string, provider: OcrProvider): void;
  registerAiProvider(name: string, provider: AiProvider): void;
  registerPdfRenderer(name: string, renderer: PdfRenderer): void;
  registerExporter(name: string, exporter: Exporter): void;
}
```

**R2.** Implementar el registry en `@ocp/core` con selección del proveedor activo por configuración (env vars).

**R3.** Refactorizar `apps/api/src/app.ts` para que los adaptadores se resuelvan desde el registry en lugar de instanciarse directamente.

**R4.** Migrar los adaptadores existentes a plugins registrables sin romper el funcionamiento actual.

**R5.** Endpoint `GET /api/plugins` que lista los plugins registrados y cuál está activo por tipo.

**R6.** Documentar en `project/architecture/plugins.md` cómo crear un plugin, con un ejemplo mínimo completo.

### Invariantes

- Quitar cualquier plugin nunca debe romper la funcionalidad core.
- Un adaptador implementa exactamente una interfaz.
- Pueden existir varios adaptadores del mismo tipo; solo uno activo a la vez.

---

## SPEC-011 — Autenticación Local

**Prioridad: MEDIA.** La API está completamente abierta. Aunque es local-first, cualquier proceso en la máquina puede leer y borrar los datos.

### Requisitos

**R1.** Autenticación local simple: contraseña maestra que se define en el primer arranque.

**R2.** Sesión con JWT firmado con secreto local (generado en el primer arranque y guardado en el directorio de configuración).

**R3.** Middleware que protege todos los endpoints `/api/*` excepto `/health` y los de autenticación.

**R4.** Endpoints: `POST /api/auth/setup` (primer arranque), `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/status`.

**R5.** Modo opcional: variable `OCP_AUTH_ENABLED=false` para desactivarlo en desarrollo. Por defecto activo.

**R6.** Frontend: pantalla de login/setup, guardar token, interceptor que lo agrega a las peticiones, redirigir a login en 401.

### Nota de seguridad

Hashear la contraseña con `argon2` o `bcrypt` (nunca en texto plano). El secreto JWT debe tener al menos 32 bytes de entropía.

---

## SPEC-012 — Completar la Cobertura del Dominio

**Prioridad: BAJA.** Cierra huecos menores.

### Requisitos

**R1.** `POST /api/profiles/:id/sections` solo soporta 6 de las 12 secciones. Agregar: `projects`, `publications`, `awards`, `affiliations`, `volunteering`, `references`.

**R2.** `ProfileForm.tsx` y `ProfileView.tsx` solo manejan 5 secciones. Completar las 12.

**R3.** Agregar `GET /api/profiles` (listado). Necesario para el caso de uso de múltiples perfiles.

**R4.** Extender el port `ProfileRepository` con `findAll(): Promise<ProfessionalProfile[]>`.

**R5.** Resolver los 10 "unknowns" documentados en `DOMAIN_DISCOVERY.md` sección 6 — requieren decisión del dueño del proyecto antes de implementar (multi-perfil, compartición, taxonomía de habilidades, etc.). **No decidirlos por cuenta propia: preguntar.**

---

## Orden de ejecución

```
SPEC-006 (Documentos y Evidencias)     ← empezar aquí, sin dependencias
      ↓
SPEC-007 (Reglas Institucionales)
      ↓
SPEC-008 (Plantillas Dinámicas)
      ↓
SPEC-009 (Adaptación con IA)           ← completa la visión del producto
      ↓
SPEC-010 (Plugins)                     ← puede hacerse en paralelo desde aquí
      ↓
SPEC-011 (Autenticación)
      ↓
SPEC-012 (Completar dominio)
```

Cada SPEC se completa de punta a punta (requisitos → diseño → implementación → verificación) antes de empezar el siguiente.

---

## Reglas para el agente que implemente esto

Extraídas de `.kiro/steering/project-identity.md`:

1. No reemplazar tecnologías aprobadas sin un ADR.
2. No introducir frameworks no aprobados. El stack es: Express, TypeScript, PostgreSQL, Prisma, React, Vite, Tailwind, Zod, Tesseract.js, Puppeteer, Vitest.
3. La lógica de negocio nunca importa infraestructura directamente (Prisma, Express, Tesseract, Puppeteer). Siempre a través de ports.
4. `packages/core` no importa ninguna implementación concreta.
5. Toda funcionalidad de IA es opcional y degrada con gracia.
6. Todo procesamiento es local. Ningún dato del usuario sale de la máquina sin acción explícita.
7. El Perfil Profesional es la única fuente de verdad. Los outputs son derivados y descartables.
8. Código en inglés. Documentación del proyecto en español. Commits en inglés (Conventional Commits).
9. Versiones exactas en `package.json` (sin `^` ni `~`).
10. Si hay incertidumbre, detenerse y preguntar.

### Al terminar cada SPEC

- `npx tsc --noEmit` limpio en todos los paquetes afectados.
- Tests nuevos pasando.
- Tests existentes sin romper.
- Actualizar `project/context/PROJECT_STATUS.md`.
- Actualizar `project/roadmap/ROADMAP.md` si cambió el alcance.
- Commit con Conventional Commits.

---

# Fin del Documento
