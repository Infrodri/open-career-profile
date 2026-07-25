# SPEC-003 — Tareas de Implementación

---

### T1. Setup del paquete apps/api

Crear package.json, tsconfig, instalar Express + Helmet + CORS.

---

### T2. Config y server bootstrap

config.ts (env vars), app.ts (Express app), server.ts (listen).

---

### T3. Middleware

error-handler.ts (formato consistente), validate.ts (Zod middleware).

---

### T4. ProfileService

Orquesta CRUD usando repository + factories de @ocp/core.

---

### T5. Profile routes

POST/GET/PUT/DELETE en /api/profiles.

---

### T6. Tests de integración

Tests con supertest contra los endpoints.

---

## Orden

```
T1 → T2 → T3 → T4 → T5 → T6
```

---

# Fin del Documento
