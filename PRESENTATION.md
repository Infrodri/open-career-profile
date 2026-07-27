# Open Career Profile — Presentación del Proyecto

---

## El Problema

La información profesional de las personas está:
- **Dispersa** en múltiples plataformas (LinkedIn, portales de empleo, bases de datos institucionales)
- **Desactualizada** porque mantener múltiples perfiles es tedioso
- **Sin respaldo** — cuando necesitas un CV, recreas todo de memoria
- **Sin trazabilidad** — afirmas tener un título pero no tienes el certificado a mano
- **Dependiente de formatos** — cada institución pide un formato diferente y lo recreamos cada vez

---

## La Solución: Open Career Profile

Una plataforma **local-first, open source, asistida por IA** que:

1. **Centraliza** toda tu información profesional en una sola fuente de verdad
2. **Automatiza** la extracción de datos de documentos existentes
3. **Genera** CVs en cualquier formato institucional automáticamente
4. **Verifica** cada entrada con su documento original
5. **Busca empleo** escaneando portales y evaluando tu match

---

## Objetivos

| Objetivo | Cómo lo cumple |
|----------|----------------|
| Privacidad total | Todo funciona localmente, sin cloud obligatorio |
| Una sola fuente de verdad | El Perfil Profesional es el dato permanente, los CVs son derivados |
| Trazabilidad | Cada entrada puede vincularse a su certificado/título/contrato |
| Formato adaptable | Sube el formato que pide la institución → genera automáticamente |
| IA opcional | El sistema funciona sin IA; la IA solo acelera el proceso |
| Open Source | Apache 2.0, extensible, sin vendor lock-in |

---

## Componentes Principales

### 1. Perfil Profesional (16 secciones)

Diseñado para el contexto boliviano/latinoamericano:
- Formación Académica (con tipos: bachiller, técnico superior, licenciatura, provisión nacional)
- Postgrado
- Experiencia Administrativa, Docente, Desarrollo
- Cursos de Especialidad, Ciberseguridad, Sistemas Institucionales
- Cursos Administrativos, Programación, Generales
- Reconocimientos (Expositor, Representación, Laborales)
- Idiomas, Habilidades

### 2. Motor de Importación (OCR + IA)

```
PDF/Foto → OCR (Tesseract.js) → Texto → IA (multi-pass) → Perfil estructurado
```

- La IA analiza cada sección por separado (más preciso que un solo prompt gigante)
- El usuario SIEMPRE revisa antes de guardar (human-in-the-loop)
- Si la IA no está disponible, se puede capturar manualmente

### 3. Motor de Output (Generación de CV)

```
Perfil + Plantilla + Reglas → HTML → PDF (Puppeteer)
```

- 3 plantillas built-in: Estándar, Minimalista, Formato SENASAG
- Plantillas dinámicas: el usuario puede crear con Handlebars
- Motor de reglas: filtra secciones, solo verificados, trunca, reordena

### 4. Formatos Institucionales

```
Formato PDF de institución → IA analiza → Reglas + Plantilla → CV adaptado
```

- Sube el modelo que pide SENASAG, la Universidad, el Órgano Judicial...
- El sistema detecta qué campos pide y genera la plantilla
- Al generar, llena automáticamente con tus datos

### 5. Búsqueda de Empleo

```
Configuración → Scanner (5 portales) → Ofertas → IA evalúa → Score + Gaps
```

- CompuTrabajo Bolivia, Google Empleos, LinkedIn, Trabajopolis, RemoteOK
- Zero-token scanning (la IA solo se usa para evaluar, no para buscar)
- Score 1-5 con análisis de match y skill gaps
- Tracking de postulaciones

### 6. Sistema de Evidencias

```
Documento (PDF/foto) → Almacenamiento local → Vinculación a entradas del perfil
```

- Cada entrada puede tener su certificado/título original adjunto
- Deduplicación por hash SHA-256 + fileName+size
- Verificación manual o por documento

---

## Demo Funcional

### Flujo 1: Importar CV existente
1. Sube tu hoja de vida actual (PDF o foto)
2. El OCR extrae el texto
3. La IA identifica cada sección y sus entradas
4. Revisas, editas si necesario, y guardas
5. Tu Perfil Profesional está listo

### Flujo 2: Generar CV para institución
1. Sube el formato que pide la institución
2. La IA detecta las reglas y genera la plantilla
3. En "Generar CV", selecciona ese formato
4. Se genera tu CV con la estructura exacta del formato, lleno con tus datos

### Flujo 3: Buscar empleo
1. Configura tu búsqueda: "Ingeniero de Sistemas en Sucre"
2. El sistema escanea 5 portales (sin IA)
3. Evalúa cada oferta contra tu perfil (con IA)
4. Ves las ofertas ordenadas por match con skill gaps

---

## Métricas Técnicas

| Métrica | Valor |
|---------|-------|
| Paquetes | 8 + 2 apps |
| Tests unitarios | 102+ |
| Endpoints API | 28 |
| Páginas frontend | 11 |
| Portales de empleo | 5 |
| Plantillas built-in | 3 |
| Líneas de código | ~15,000 |
| Dependencias runtime | Solo open source (MIT/Apache) |

---

## Tecnologías

- **TypeScript** (strict mode) — seguridad de tipos en todo el proyecto
- **Express.js** — API madura y extensible
- **React 19 + Vite** — frontend moderno y rápido
- **PostgreSQL + Prisma** — persistencia robusta con migraciones
- **Tesseract.js** — OCR local sin cloud
- **Puppeteer** — generación de PDF profesional
- **OpenAI-compatible** — funciona con OpenRouter, Ollama, o cualquier proveedor

---

## Roadmap Futuro

- [ ] Autenticación local (contraseña maestra)
- [ ] Sistema de plugins formal
- [ ] Más portales de empleo (Indeed, OrganoJudicial.gob.bo)
- [ ] Generación de CV adaptado POR oferta de empleo
- [ ] App móvil (React Native)
- [ ] Sincronización opcional con cloud (cifrada)

---

## Licencia

Apache License 2.0 — libre para uso personal y comercial.

---

*Desarrollado con asistencia de IA en Kiro IDE.*
