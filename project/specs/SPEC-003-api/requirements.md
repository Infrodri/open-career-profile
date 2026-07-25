# SPEC-003 — API REST

## Requisitos

---

### R1. Servidor Express

Un servidor Express con TypeScript que expone endpoints REST para gestionar el Perfil Profesional.

**Criterio de aceptación:**
- El servidor arranca en un puerto configurable (default: 3000).
- Responde JSON en todos los endpoints.
- Maneja errores con respuestas consistentes.

---

### R2. CRUD de Perfil

| Método | Ruta | Acción |
|--------|------|--------|
| POST | /api/profiles | Crear un perfil |
| GET | /api/profiles/:id | Obtener un perfil completo |
| PUT | /api/profiles/:id | Actualizar un perfil completo |
| DELETE | /api/profiles/:id | Eliminar un perfil |

**Criterio de aceptación:**
- POST valida el body con Zod antes de crear.
- GET retorna el perfil completo con todas las secciones.
- PUT reemplaza el perfil completo (las secciones se recrean).
- DELETE elimina el perfil y todas sus relaciones.
- 404 cuando el perfil no existe.
- 400 cuando la validación falla (con mensajes claros).

---

### R3. Validación de entrada

Todos los endpoints que reciben body validan con los schemas Zod de `@ocp/core`.

**Criterio de aceptación:**
- Body inválido retorna 400 con los errores de validación detallados.
- Body válido pasa al servicio sin modificaciones.

---

### R4. Estructura de respuesta

Todas las respuestas siguen este formato:

```json
// Éxito
{ "data": { ... }, "error": null }

// Error
{ "data": null, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

---

### R5. Middleware de seguridad

- Helmet para headers de seguridad.
- CORS configurado para desarrollo local.
- Body parser con límite de tamaño.

---

### R6. Configuración por variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| OCP_PORT | 3000 | Puerto del servidor |
| OCP_DATABASE_URL | (requerida) | Conexión a PostgreSQL |

---

## Fuera de alcance

- Autenticación / autorización.
- Paginación (un solo perfil por ahora).
- Endpoints por sección individual (CRUD parcial).
- WebSockets o real-time.

---

# Fin del Documento
