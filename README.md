# Open Career Profile

Plataforma Open Source para construir, gestionar y mantener un Perfil Profesional como fuente única de información verificable — de forma local y privada.

---

## ¿Qué es esto?

Open Career Profile permite a cualquier persona construir un **Perfil Profesional Maestro** que actúa como la única fuente de verdad de toda su información de carrera.

A partir de este perfil se pueden generar diferentes documentos (CVs, portfolios, formatos institucionales) sin volver a ingresar la información.

El sistema también permite incorporar nueva información mediante la carga de documentos, certificados o imágenes, extrayendo automáticamente los datos relevantes para que el usuario únicamente valide antes de almacenar.

---

## Problema

La información profesional está dispersa en múltiples documentos: cédulas, títulos académicos, certificados, contratos, hojas de vida antiguas, PDFs, fotos. Cada nueva postulación requiere recopilar esa información nuevamente, verificar fechas, llenar formularios y adaptar el contenido a diferentes formatos.

---

## Solución

Un **Perfil Profesional Maestro** como única fuente de verdad. Genera cualquier documento a partir de él. Nunca más recrear información manualmente.

---

## Principios

- **Open Source** — proyecto público, contribuciones bienvenidas
- **Local First** — toda la información queda en la computadora del usuario
- **Offline First** — funciona completamente sin internet
- **Privacy First** — los documentos personales nunca se envían a servicios externos
- **Single Source of Truth** — el Perfil es la única fuente oficial
- **AI Assisted** — la IA es opcional, mejora la productividad, nunca es requerida
- **Plugin First** — arquitectura modular y extensible

---

## Alcance

El sistema administra:

- Información personal
- Formación académica
- Experiencia laboral
- Certificaciones
- Cursos
- Idiomas
- Habilidades
- Referencias
- Documentos de respaldo
- Evidencias profesionales

---

## Flujo del Sistema

```
Usuario
 ↓
Carga documentos
 ↓
Procesamiento (extracción OCR)
 ↓
Usuario valida datos extraídos
 ↓
Perfil Profesional actualizado
 ↓
Genera documento requerido (CV, portfolio, formato institucional)
```

---

## Tecnología

| Capa | Tecnología |
|------|-----------|
| Backend | Express.js, TypeScript, Node.js 22 |
| Base de datos | PostgreSQL, Prisma ORM, Docker |
| Frontend | React 19, Vite, Tailwind CSS |
| OCR | Tesseract.js |
| IA (opcional) | Ollama |
| PDF | Puppeteer |
| Control de versiones | Git, GitHub |

---

## Resultado Esperado

Cualquier usuario puede:

1. Crear su Perfil Profesional.
2. Incorporar información mediante documentos o formularios.
3. Validar la información extraída automáticamente.
4. Mantener actualizado su perfil.
5. Generar distintos documentos profesionales a partir del mismo perfil.
6. Conservar toda su información de manera privada y local.

---

## Fase Actual

**Planning** — arquitectura aprobada, preparando primera especificación funcional.

---

## Licencia

Apache License 2.0
