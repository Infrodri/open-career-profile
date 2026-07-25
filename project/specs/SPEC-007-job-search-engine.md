# SPEC-007 — Motor de Búsqueda de Empleo y Generación Adaptada

## Resumen

Integrar un sistema de búsqueda de empleo inteligente que:
1. Escanee portales de empleo sin gastar tokens de IA (zero-token scanning)
2. Evalúe cada oferta contra el perfil real del usuario (scoring)
3. Genere un CV adaptado específicamente para cada oferta/institución
4. Detecte gaps de habilidades y recomiende capacitación

Inspirado en la arquitectura de [career-ops](https://github.com/...) pero adaptado
para funcionar como módulo dentro de Open Career Profile.

## Arquitectura

```
Perfil del Usuario (16 secciones verificadas)
        │
        ▼
┌─────────────────────┐
│  Configuración de   │  ← título target, ubicación, modalidad, salario mínimo
│  Búsqueda           │
└────────┬────────────┘
         │
┌────────▼────────────┐
│  Scanner de         │  ← APIs públicas de portales (zero-token)
│  Portales           │     Providers modulares: cada portal = un archivo
└────────┬────────────┘
         │
┌────────▼────────────┐
│  Evaluación IA      │  ← Compara JD contra perfil del usuario
│  (Scoring 1-5)      │     Bloques: match de skills, experiencia, gaps
└────────┬────────────┘
         │
┌────────▼────────────┐
│  Generación         │  ← Toma las plantillas institucionales + reglas
│  CV Adaptado        │     Selecciona las entradas más relevantes
└─────────────────────┘     Reformula keywords (nunca fabrica)
```

## Componentes

### 1. Modelo de Datos

```prisma
model JobSearchConfig {
  id             String   @id @default(uuid())
  profileId      String
  targetTitles   String[] // ["Ingeniero de Sistemas", "Técnico Informático"]
  locations      String[] // ["Sucre", "La Paz", "Remoto"]
  modality       String?  // "presencial" | "remoto" | "hibrido"
  minSalary      Int?
  excludeKeywords String[] // ["junior", "pasantía"]
  portals        String[] // ["computrabajo_bo", "linkedin", "trabajopolis"]
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  profile        Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
}

model JobListing {
  id             String   @id @default(uuid())
  configId       String
  portal         String   // "computrabajo_bo"
  externalId     String?  // ID del portal
  title          String
  company        String
  location       String?
  salary         String?
  url            String
  description    String?  @db.Text
  postedDate     String?
  // AI evaluation
  score          Float?   // 1.0 - 5.0
  matchSummary   String?  @db.Text
  skillGaps      String[] // ["Docker", "Kubernetes"]
  recommendation String?  // "apply" | "maybe" | "skip"
  // Status
  status         String   @default("new") // new | evaluated | applied | rejected | saved
  cvGenerated    Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@unique([portal, externalId])
  @@unique([url])
}
```

### 2. Providers de Portales (packages/job-scanner/)

Patrón modular inspirado en career-ops:

```
packages/job-scanner/
├── src/
│   ├── index.ts
│   ├── types.ts           # JobListing, ScanResult, Provider interface
│   ├── scanner.ts         # Orchestrator: carga providers, aplica filtros
│   ├── filters.ts         # Título, ubicación, salary, dedup
│   └── providers/
│       ├── computrabajo-bo.ts    # Bolivia
│       ├── trabajopolis-bo.ts    # Bolivia
│       ├── linkedin-public.ts    # Internacional (sin login)
│       ├── remoteok.ts           # Remote jobs
│       ├── indeed-bo.ts          # Indeed Bolivia
│       └── _base-provider.ts     # Helper compartido
```

Cada provider exporta:
```typescript
export interface JobProvider {
  id: string;
  name: string;
  country: string;
  fetch(config: SearchConfig): Promise<RawJob[]>;
}
```

### 3. Evaluación de Ofertas (IA)

Prompt por sección (como el multi-pass actual):

1. **Match de experiencia**: ¿Cuántos años pide? ¿Los tiene?
2. **Match de habilidades**: ¿Qué tecnologías/conocimientos pide? ¿Cuáles tiene verificados?
3. **Match de educación**: ¿Qué título pide? ¿Lo tiene?
4. **Skill gaps**: ¿Qué le falta?
5. **Score final**: 1-5 con recomendación

### 4. Generación de CV Adaptado

Combina:
- Las reglas de la plantilla institucional (si existe para esa empresa)
- La JD de la oferta (keywords a incluir)
- El perfil del usuario (solo entradas relevantes)

Produce:
- HTML renderizado con Puppeteer → PDF
- Solo incluye las secciones que la oferta pide
- Reformula descripciones usando keywords de la JD (nunca inventa)
- Si `onlyVerified = true`, solo usa entradas verificadas

### 5. Frontend

Nueva página `/empleo` con:
- Configuración de búsqueda (títulos, ubicaciones, portales)
- Lista de ofertas encontradas con score visual
- Detalle de oferta con match analysis
- Botón "Generar CV para esta oferta"
- Botón "Marcar como aplicada"
- Vista de skill gaps (qué capacitarse)

## Flujo del Usuario

1. Configura su búsqueda: "Ingeniero de Sistemas en Sucre o remoto"
2. El sistema escanea los portales (sin gastar tokens)
3. Para cada oferta, la IA evalúa contra su perfil → score
4. El usuario ve las ofertas ordenadas por match
5. Elige una → ve el análisis detallado + gaps
6. Click "Generar CV" → se produce un PDF optimizado para esa oferta
7. Marca como "aplicada" para tracking

## Portales Bolivianos Prioritarios

- CompuTrabajo Bolivia (computrabajo.com.bo)
- Trabajopolis Bolivia
- LinkedIn (búsqueda pública sin login)
- Indeed Bolivia
- RemoteOK (para trabajo remoto internacional)
- OrganoJudicial.gob.bo (convocatorias públicas)

## Dependencias

- Playwright (ya instalado) para scraping de portales que no tienen API
- IA (ya configurada con OpenRouter) para evaluación
- Puppeteer (ya instalado) para generación de PDF

## Prioridad de Implementación

1. Modelo de datos + API CRUD de configuración y listings
2. Provider de CompuTrabajo Bolivia (el más relevante localmente)
3. Evaluación IA contra perfil
4. Frontend de búsqueda con scores
5. Generación de CV adaptado por oferta
6. Providers adicionales

## Notas

- Zero-token scanning: los portales se escanean con fetch/playwright, NO con IA
- La IA solo se usa para evaluar (donde aporta valor real)
- Human-in-the-loop: nunca se aplica automáticamente, el usuario siempre revisa
- Anti-fabricación: el CV generado nunca inventa experiencia ni habilidades
- Solo reformula y selecciona de lo que ya existe en el perfil
