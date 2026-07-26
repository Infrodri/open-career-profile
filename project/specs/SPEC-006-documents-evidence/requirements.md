# SPEC-006 — Almacenamiento de Documentos y Evidencias

> Estado: ✅ Completada
> Fecha de implementación: 2026-07

---

## Resumen

Persistir los documentos subidos por el usuario (fotos, PDFs) en disco local y vincularlos como evidencia a entradas específicas del perfil profesional. Principio "Evidence Driven" de la identidad del proyecto.

---

## Requisitos

### R1. Puerto de almacenamiento (`DocumentStorage`)

**Interfaz en `@ocp/core`:**
```typescript
interface DocumentStorage {
  save(buffer: Buffer, fileName: string, profileId?: string): Promise<string>;
  read(storagePath: string): Promise<Buffer>;
  delete(storagePath: string): Promise<void>;
  exists(storagePath: string): Promise<boolean>;
}
```

**Criterio de aceptación:**
- `save()` retorna un storage path opaco.
- `profileId` es opcional (documentos pueden subirse antes de tener perfil).
- `delete()` es idempotente (no falla si el archivo no existe).
- Paths de storage siempre usan `/` (portables entre OS).

---

### R2. Adaptador de almacenamiento local (`LocalFileStorage`)

**Criterio de aceptación:**
- Guarda en `OCP_STORAGE_PATH` (default: `./storage/documents`).
- Layout: `{profileId|unassigned}/{uuid}-{safeFileName}`.
- Protección contra path traversal (rechaza paths absolutos y `..`).
- Sanitización de nombres de archivo.
- Directorio creado automáticamente si no existe.

---

### R3. Modelo `Document` en Prisma

```prisma
model Document {
  id            String   @id @default(uuid())
  profileId     String?
  fileName      String
  mimeType      String
  sizeBytes     Int
  storagePath   String
  documentType  String?  // certificado | titulo | contrato | hoja_de_vida | otro
  extractedText String?  @db.Text
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  profile       Profile? @relation(...)
  evidences     Evidence[]
}
```

**Criterio de aceptación:**
- `profileId` es nullable (documentos sin perfil asignado).
- `documentType` es nullable (puede clasificarse después).
- `extractedText` almacena el texto OCR/PDF para búsqueda futura.

---

### R4. Modelo `Evidence` en Prisma

```prisma
model Evidence {
  id          String   @id @default(uuid())
  documentId  String
  sectionType String
  entryId     String
  note        String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  document    Document @relation(...)
}
```

**Criterio de aceptación:**
- Vincula un documento a una entrada específica (sectionType + entryId).
- Un documento puede tener múltiples evidencias (respalda varias entradas).
- Quitar la evidencia NO elimina la entrada del perfil.
- `note` es opcional (contexto adicional del usuario).

---

### R5. Puerto de repositorio (`DocumentRepository`)

**Criterio de aceptación:**
- `create`, `findById`, `findByProfileId`, `findUnassigned`.
- `assignToProfile` — reasigna documento a un perfil.
- `updateDocumentType` — actualiza clasificación.
- `delete` — elimina documento, evidencias y archivo.
- `createEvidence` — vincula documento a entradas (batch).
- `findEvidenceByDocumentId`, `findEvidenceByEntry`, `findEvidenceByProfileId`.
- `deleteEvidence` — desvincula sin borrar documento ni entrada.

---

### R6. `DocumentService` en la API

**Criterio de aceptación:**
- `store()` guarda archivo + registro en BD en una transacción lógica.
- Si el insert en BD falla, se limpia el archivo huérfano.
- Expone todos los métodos del repositorio + lectura de archivos.

---

### R7. Modificación de `POST /api/documents/extract`

**Criterio de aceptación:**
- Guarda el archivo ANTES de extraer texto.
- Retorna `documentId` junto con el texto extraído.
- Acepta `profileId` y `documentType` opcionales.

---

### R8. Endpoints nuevos

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/profiles/:id/documents` | Lista documentos del perfil |
| GET | `/api/documents/unassigned` | Documentos sin perfil |
| GET | `/api/documents/:id` | Metadata + evidencias |
| GET | `/api/documents/:id/file` | Descarga/visualiza archivo original |
| PATCH | `/api/documents/:id` | Actualiza tipo de documento |
| DELETE | `/api/documents/:id` | Elimina documento + archivo + evidencias |
| POST | `/api/documents/:id/evidence` | Vincula a entradas (single o batch) |
| GET | `/api/profiles/:id/evidence` | Todas las evidencias del perfil |

---

### R9. Frontend

**Criterio de aceptación:**
- `DocumentsPage.tsx` (`/documentos`): lista documentos con tipo, tamaño, fecha, evidencias vinculadas.
- Clasificación de tipo de documento editable.
- Expandir documento muestra sus evidencias con labels de la entrada vinculada.
- Eliminar documento con confirmación.
- Documentos sin perfil listados por separado.
- `EvidenceBadge.tsx`: ícono de clip junto a entradas del perfil que tienen evidencia. Enlaza al documento original.

---

### R10. Seguridad

- `storage/` en `.gitignore`.
- No servir archivos sin validar que el documento existe en BD.
- Protección contra path traversal en el adapter.

---

## Invariantes

- La evidencia es siempre opcional.
- Un documento puede respaldar múltiples entradas.
- Quitar la evidencia no elimina la entrada del perfil.
- Un documento puede existir sin estar vinculado a nada.

---

## Verificación

- Tests de `LocalFileStorage` (save, read, delete, exists, path traversal).
- Tests de `DocumentService` (store, cleanup on failure).
- `npx tsc --noEmit` limpio.
- Endpoints funcionales verificados manualmente.

---

## Paquete creado

- `@ocp/storage-adapter` — depende solo de `@ocp/core`

---

# Fin del Documento
