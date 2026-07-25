# SPEC-001 — Modelo de Dominio del Perfil Profesional

## Requisitos

---

### R1. Perfil Profesional

El sistema debe permitir crear y gestionar un Perfil Profesional por usuario. El perfil es la entidad raíz del dominio y contiene todas las secciones de información profesional.

**Criterio de aceptación:**
- Un usuario tiene exactamente un Perfil Profesional.
- El perfil puede existir sin ninguna sección completa.
- El perfil tiene un identificador único.
- El perfil registra fecha de creación y última modificación.

---

### R2. Secciones predefinidas

El sistema debe incluir las siguientes secciones predefinidas:

1. Información Personal
2. Experiencia Laboral
3. Educación
4. Certificaciones
5. Cursos
6. Idiomas
7. Habilidades
8. Proyectos
9. Publicaciones
10. Premios y Reconocimientos
11. Afiliaciones Profesionales
12. Voluntariado
13. Referencias

**Criterio de aceptación:**
- Todas las secciones están disponibles al crear un perfil.
- Ninguna sección es obligatoria (pueden estar vacías).
- Las secciones predefinidas no pueden eliminarse del sistema, solo vaciarse.
- El sistema debe ser diseñado para permitir secciones adicionales en el futuro (vía plugins) sin modificar el core.

---

### R3. Información Personal

La sección de Información Personal contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Nombre completo | texto | Sí |
| Email | texto (validado) | No |
| Teléfono | texto | No |
| Ciudad | texto | No |
| País | texto | No |
| Resumen profesional | texto largo | No |
| Foto | archivo/ruta | No |
| Links | lista de {etiqueta, url} | No |
| Fecha de nacimiento | fecha | No |
| Documento de identidad | texto | No |

**Criterio de aceptación:**
- Solo el nombre completo es obligatorio.
- Los campos sensibles (fecha de nacimiento, documento de identidad) se almacenan pero se marcan como datos privados.
- Los links son una lista dinámica (el usuario puede agregar N links con etiqueta libre).

---

### R4. Experiencia Laboral

Cada entrada de experiencia laboral contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Cargo/Puesto | texto | Sí |
| Institución/Empresa | texto | Sí |
| Fecha de inicio | fecha (mes/año) | Sí |
| Fecha de fin | fecha (mes/año) o "presente" | No |
| Descripción | texto largo | No |
| Logros | lista de textos | No |
| Ubicación | texto | No |

**Criterio de aceptación:**
- Las fechas pueden ser aproximadas (solo mes/año o solo año).
- "Presente" es un valor válido para fecha de fin (empleo actual).
- Las entradas se ordenan por fecha de inicio descendente por defecto.

---

### R5. Educación

Cada entrada de educación contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Título/Grado | texto | Sí |
| Institución | texto | Sí |
| Fecha de inicio | fecha | No |
| Fecha de fin | fecha o "en curso" | No |
| Descripción | texto largo | No |
| Área/Especialidad | texto | No |

---

### R6. Certificaciones

Cada entrada contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Nombre de la certificación | texto | Sí |
| Institución emisora | texto | Sí |
| Fecha de emisión | fecha | No |
| Fecha de expiración | fecha | No |
| Código/ID de verificación | texto | No |
| URL de verificación | url | No |

---

### R7. Cursos

Cada entrada contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Nombre del curso | texto | Sí |
| Institución/Plataforma | texto | No |
| Fecha de finalización | fecha | No |
| Duración | texto | No |
| Descripción | texto largo | No |

---

### R8. Idiomas

Cada entrada contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Idioma | texto | Sí |
| Nivel | enum (básico, intermedio, avanzado, nativo) | Sí |
| Certificación | texto | No |

---

### R9. Habilidades

Cada entrada contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Nombre de la habilidad | texto | Sí |
| Categoría | texto (ej: "técnica", "blanda") | No |
| Nivel | enum (básico, intermedio, avanzado, experto) | No |

---

### R10. Proyectos

Cada entrada contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Nombre del proyecto | texto | Sí |
| Descripción | texto largo | No |
| Rol | texto | No |
| Fecha de inicio | fecha | No |
| Fecha de fin | fecha | No |
| URL | url | No |
| Tecnologías | lista de textos | No |

---

### R11. Publicaciones

Cada entrada contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Título | texto | Sí |
| Tipo | enum (artículo, libro, charla, paper, otro) | No |
| Fecha | fecha | No |
| Medio/Editorial | texto | No |
| URL | url | No |
| Descripción | texto largo | No |

---

### R12. Premios y Reconocimientos

Cada entrada contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Nombre | texto | Sí |
| Institución otorgante | texto | No |
| Fecha | fecha | No |
| Descripción | texto largo | No |

---

### R13. Afiliaciones Profesionales

Cada entrada contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Organización | texto | Sí |
| Rol/Membresía | texto | No |
| Fecha de inicio | fecha | No |
| Fecha de fin | fecha | No |

---

### R14. Voluntariado

Cada entrada contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Organización | texto | Sí |
| Rol | texto | No |
| Descripción | texto largo | No |
| Fecha de inicio | fecha | No |
| Fecha de fin | fecha | No |

---

### R15. Referencias

Cada entrada contiene:

| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| Nombre completo | texto | Sí |
| Relación | texto (ej: "supervisor directo") | No |
| Institución | texto | No |
| Teléfono | texto | No |
| Email | texto | No |

**Criterio de aceptación:**
- Las referencias se marcan como datos altamente privados.
- No se incluyen en outputs generados a menos que el usuario lo autorice explícitamente.

---

### R16. Validación del dominio

- Todos los campos de texto obligatorios no pueden estar vacíos.
- Las fechas deben ser válidas (no futuras para eventos pasados, formato correcto).
- Los emails deben tener formato válido cuando se proporcionan.
- Las URLs deben tener formato válido cuando se proporcionan.
- La validación ocurre en el dominio, no depende de ninguna tecnología externa.

---

### R17. Identificadores

- Cada entidad (perfil, sección, entrada) tiene un identificador único generado por el sistema.
- Los identificadores son UUID v4.

---

### R18. Timestamps

- Toda entidad registra `createdAt` y `updatedAt`.
- Los timestamps se generan automáticamente.

---

## Fuera de alcance

- Evidencias y documentos fuente (Spec separado).
- Persistencia en base de datos (Spec separado).
- API HTTP (Spec separado).
- Interfaz de usuario (Spec separado).
- OCR y extracción de datos (Spec separado).
- Sistema de plugins (Spec separado).
- Generación de outputs/PDF (Spec separado).

---

# Fin del Documento
