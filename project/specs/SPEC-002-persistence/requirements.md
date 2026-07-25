# SPEC-002 — Capa de Persistencia

## Requisitos

---

### R1. Implementación del ProfileRepository

Implementar el adaptador de Prisma que satisface la interfaz `ProfileRepository` definida en `@ocp/core`.

**Criterio de aceptación:**
- El adaptador implementa los 4 métodos: create, findById, update, delete.
- Los datos se persisten en PostgreSQL.
- El adaptador es el único punto de contacto con Prisma — el core no conoce Prisma.

---

### R2. Schema de Prisma

Definir el schema de base de datos que refleja el modelo de dominio.

**Criterio de aceptación:**
- Todas las entidades del dominio tienen representación en la base de datos.
- Las relaciones entre perfil y secciones están modeladas.
- Las migraciones se generan automáticamente desde el schema.

---

### R3. Mapeo dominio ↔ persistencia

Los datos deben transformarse entre la representación de dominio (TypeScript interfaces) y la representación de base de datos (Prisma models).

**Criterio de aceptación:**
- Existe un mapper que convierte entidades de dominio a formato Prisma y viceversa.
- El mapper maneja correctamente: fechas parciales (strings), arrays, campos opcionales.
- El core nunca recibe objetos Prisma directamente.

---

### R4. Configuración de Docker

PostgreSQL debe estar disponible vía Docker para desarrollo local.

**Criterio de aceptación:**
- `docker-compose.yml` levanta PostgreSQL con configuración lista para desarrollo.
- Las credenciales de desarrollo están en un `.env.example`.
- El desarrollador puede arrancar la base de datos con un solo comando.

---

### R5. Migraciones

Las migraciones de base de datos se gestionan con Prisma Migrate.

**Criterio de aceptación:**
- La primera migración crea todas las tablas necesarias.
- Las migraciones son reproducibles y versionadas.
- `npx prisma migrate dev` aplica las migraciones correctamente.

---

### R6. Tests de integración

La capa de persistencia debe tener tests que verifican el CRUD real contra PostgreSQL.

**Criterio de aceptación:**
- Tests verifican: crear perfil, leer perfil, actualizar perfil, eliminar perfil.
- Los tests corren contra una base de datos de test (puede ser la misma de Docker en un schema separado o con limpieza entre tests).
- Los tests pasan con `turbo test`.

---

## Fuera de alcance

- API HTTP (Spec separado).
- Interfaz de usuario.
- Evidencias y documentos fuente.
- Múltiples usuarios / autenticación.

---

# Fin del Documento
