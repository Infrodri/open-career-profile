# SPEC-010 — Motor de Búsqueda de Empleo

> Estado: ✅ Completada (Fase 1)
> Fecha de implementación: 2026-07
> Dependencias: SPEC-005 (AI adapter), SPEC-007 (motor de reglas)

---

## Resumen

Motor de búsqueda de empleo inteligente que:
1. Escanea portales de empleo sin gastar tokens de IA (zero-token scanning).
2. Evalúa cada oferta contra el perfil real del usuario (scoring con IA).
3. Permite tracking de postulaciones.
4. (Futuro) Genera un CV adaptado por oferta.

---

## Requisitos Implementados (Fase 1)

### R1. Modelos de datos en Prisma

```prisma
model JobSearchConfig {
  id              String   @id @default(uuid())
  profileId       String
  targetTitles    String[]
  locations       String[]
  modality        String?  // "presencial" | "remoto" | "hibrido"
  minSalary       Int?
  excludeKeywords String[]
  portals         String[]
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  profile         Profile  @relation(...)
  listings        JobListing[]
  @@index([profileId])
}

model JobListing {
  id              String   @id @default(uuid())
  configId        String
  portal          String
  externalId      String?
  title           String
  company         String
  location        String?
  salary          String?
  url             String
  description     String?  @db.Text
  postedDate      String?
  score           Float?   // 1.0 - 5.0
  matchSummary    String?  @db.Text
  skillGaps       String[]
  recommendation  String?  // "apply" | "maybe" | "skip"
  status          String   @default("new")
  cvGenerated     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  config          JobSearchConfig @relation(...)
  @@unique([portal, externalId])
  @@unique([url])
  @@index([configId])
  @@index([status])
}
```

---

### R2. Paquete `@ocp/job-scanner` (25 tests)

**Estructura:**
```
packages/job-scanner/src/
├── index.ts
├── types.ts           # SearchConfig, RawJob, ScannedJob, ScanResult, ScanError
├── scanner.ts         # Scanner class (orchestrator)
├── filters.ts         # applyFilters, deduplicateJobs
├── interfaces/
│   └── job-provider.ts  # JobProvider interface
└── providers/
    ├── index.ts
    └── computrabajo-bo.ts  # CompuTrabajo Bolivia provider
```

**Scanner:**
- Ejecuta providers en paralelo con `Promise.allSettled`.
- Recolecta errores sin detener el scan (non-fatal).
- Aplica filtros y deduplicación después de recolectar.
- Retorna `ScanResult` con jobs, errors, totalRaw, filteredOut.

**Filtros (12 tests):**
- `excludeKeywords`: busca en título y descripción (case-insensitive).
- `locations`: match por ciudad o "Remoto"/"remote".
- `modality`: remoto/presencial/híbrido.
- `deduplicateJobs`: por URL normalizada (case-insensitive).

**JobProvider interface:**
```typescript
interface JobProvider {
  id: string;
  name: string;
  country: string;
  isAvailable(): boolean;
  fetch(config: SearchConfig): Promise<RawJob[]>;
}
```

---

### R3. Provider CompuTrabajo Bolivia (5 tests)

- Scraping con `cheerio` (no Playwright, más ligero).
- Busca por cada `targetTitle` con paginación (máx 3 páginas).
- Parsea artículos `box_offer` con fallback a links `oferta-de-trabajo`.
- Extrae: título, empresa, ubicación, fecha, URL, externalId.
- User-Agent de Chrome para evitar bloqueo.
- Errores de red se silencian (retorna array vacío).

---

### R4. API CRUD de JobSearchConfig

| Método | Ruta | Acción |
|--------|------|--------|
| GET | `/api/profiles/:id/job-configs` | Lista configs del perfil |
| GET | `/api/job-configs/:id` | Obtiene una config |
| POST | `/api/profiles/:id/job-configs` | Crea config (valida que perfil existe) |
| PUT | `/api/job-configs/:id` | Actualiza config |
| DELETE | `/api/job-configs/:id` | Elimina config + sus listings |

---

### R5. API de Scanning y Listings

| Método | Ruta | Acción |
|--------|------|--------|
| POST | `/api/job-configs/:id/scan` | Trigger scan → upsert listings |
| GET | `/api/job-configs/:id/listings` | Lista listings (filtro `?status=`) |
| GET | `/api/listings/:id` | Obtiene un listing |
| PATCH | `/api/listings/:id` | Actualiza status/cvGenerated |
| DELETE | `/api/listings/:id` | Elimina listing |
| GET | `/api/job-scanner/providers` | Lista providers registrados |

**Scan:**
- Lee la config, construye `SearchConfig`, ejecuta `scanner.scan()`.
- Upsert por URL (no duplica si ya existe).
- Retorna: totalFound, afterFilters, newListings, errors.

---

### R6. Evaluación IA de ofertas

**Servicio `job-evaluate.service.ts`:**
- Recibe título, descripción de la oferta, y el perfil completo.
- Construye prompt con resumen del perfil (secciones, experiencia, habilidades).
- La IA evalúa: match de experiencia, habilidades, educación, gaps.
- Parsea respuesta JSON con score (1-5), matchSummary, skillGaps, recommendation.
- Degrada con gracia si la IA no está disponible (score 0, "maybe").

**Endpoint `POST /api/listings/:id/evaluate`:**
- Busca el listing y su config para obtener el profileId.
- Busca el perfil.
- Ejecuta evaluación.
- Persiste score/matchSummary/skillGaps/recommendation en el listing.
- Actualiza status a "evaluated".

---

### R7. Frontend — JobSearchPage (`/empleo`)

**Criterio de aceptación:**
- Sección de configuraciones: lista, crear (form con títulos, ubicaciones, modalidad, exclude keywords, portales), eliminar.
- Sección de listings (visible al seleccionar una config):
  - Botón "Escanear portales" con feedback de resultado.
  - Lista de ofertas con: título (link al portal), empresa, ubicación, fecha, score, badge de recomendación.
  - Score con color: verde ≥4, ámbar ≥2.5, rojo <2.5.
  - Badges: "Postular" (verde), "Quizás" (ámbar), "Descartar" (rojo).
  - Skill gaps como chips rojos.
  - matchSummary como texto descriptivo.
  - Acciones: "Evaluar con IA", "Marcar aplicada", "Guardar", "Descartar".
  - Status y portal visibles.

---

## Pendiente (Fase 2+)

| Feature | Descripción |
|---------|-------------|
| Providers adicionales | LinkedIn público, RemoteOK, Indeed Bolivia, Trabajopolis |
| CV adaptado por oferta | Usar rules-engine + output-engine para generar PDF por oferta |
| Escaneo programado | Cron/intervalo para escanear automáticamente |
| Notificaciones | Alertar al usuario de nuevas ofertas con score alto |
| Detalle de oferta | Página dedicada con análisis completo |

---

## Verificación

- 25 tests unitarios en `@ocp/job-scanner` (scanner 8 + filters 12 + provider 5).
- `npx tsc --noEmit` limpio en job-scanner, api, web.
- Tests existentes sin regresiones.
- Scan funcional con mock de HTML (parser probado con HTML realista).

---

## Paquete creado

- `@ocp/job-scanner` — depende solo de `cheerio`

## Archivos creados/modificados

- `packages/job-scanner/` (paquete completo)
- `packages/persistence/src/prisma/schema.prisma` (modelos JobSearchConfig, JobListing)
- `apps/api/src/routes/job-search.routes.ts` (nuevo)
- `apps/api/src/services/job-evaluate.service.ts` (nuevo)
- `apps/api/src/app.ts` (wiring)
- `apps/web/src/pages/JobSearchPage.tsx` (nuevo)
- `apps/web/src/api/job-search.api.ts` (nuevo)
- `apps/web/src/App.tsx` (ruta)
- `apps/web/src/components/Layout.tsx` (nav item)

---

# Fin del Documento
