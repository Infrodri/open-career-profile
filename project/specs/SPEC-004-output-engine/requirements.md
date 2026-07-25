# SPEC-004 — Motor de Output (Generación de Documentos)

## Requisitos

---

### R1. Output Engine Package

Un paquete `@ocp/output-engine` que transforma datos del Perfil Profesional en documentos HTML y PDF.

**Criterio de aceptación:**
- Recibe un ProfessionalProfile y un Template ID.
- Produce HTML renderizado.
- Produce PDF desde el HTML (vía Puppeteer).
- No conoce la base de datos ni la API — es un paquete puro de transformación.

---

### R2. Sistema de Templates

Los templates son archivos Handlebars (.hbs) que definen la estructura visual del output.

**Criterio de aceptación:**
- Al menos 2 templates: "standard" y "minimal".
- Cada template tiene: layout principal, estilos CSS inline, metadata (nombre, descripción).
- Los templates reciben el perfil completo como contexto.
- El engine selecciona el template por ID.

---

### R3. Generación HTML

**Criterio de aceptación:**
- El motor produce HTML completo (con estilos inline) listo para renderizar.
- El HTML es responsive y se ve bien en navegador y en PDF.

---

### R4. Generación PDF

**Criterio de aceptación:**
- El motor produce un PDF a partir del HTML generado.
- Usa Puppeteer como adaptador (mediante interfaz).
- El PDF tiene formato A4, márgenes razonables.
- La interfaz permite reemplazar Puppeteer por otro renderer en el futuro.

---

### R5. API Endpoint

Exponer la generación de output desde la API existente.

| Método | Ruta | Acción |
|--------|------|--------|
| POST | /api/profiles/:id/output | Genera un documento desde el perfil |

Body:
```json
{ "templateId": "standard", "format": "pdf" }
```

Formatos: "html" o "pdf".

**Criterio de aceptación:**
- Retorna el HTML como text/html o el PDF como application/pdf.
- 404 si el perfil no existe.
- 400 si el template no existe o el formato es inválido.

---

## Fuera de alcance

- Editor visual de templates.
- Preview en tiempo real.
- Formatos adicionales (DOCX, etc).

---

# Fin del Documento
