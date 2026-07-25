# SPEC-003 — Diseño Técnico

---

## Ubicación del código

```
apps/
└── api/
    ├── src/
    │   ├── routes/
    │   │   └── profile.routes.ts
    │   ├── middleware/
    │   │   ├── error-handler.ts
    │   │   └── validate.ts
    │   ├── services/
    │   │   └── profile.service.ts
    │   ├── config.ts
    │   ├── app.ts
    │   └── server.ts
    ├── tests/
    │   └── profile.routes.test.ts
    ├── package.json
    ├── tsconfig.json
    └── vitest.config.ts
```

---

## Capas

```
Request → Routes → Validate (Zod) → Service → Repository (port) → Response
```

- **Routes:** Define endpoints, extrae params/body, delega al servicio.
- **Validate middleware:** Ejecuta schema Zod sobre req.body.
- **Service:** Orquesta lógica (crear perfil via factory, llamar repository).
- **Repository:** Inyectado. La API no conoce Prisma directamente.

---

## Inyección de dependencias

Sin framework de DI. Simple: el servicio recibe el repository en el constructor.

```typescript
// services/profile.service.ts
class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}
  // ...
}
```

En `app.ts` se compone manualmente:
```typescript
const prisma = new PrismaClient();
const repository = new PrismaProfileRepository(prisma);
const service = new ProfileService(repository);
const router = createProfileRoutes(service);
```

---

## Formato de respuesta

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

interface ApiError {
  code: string;
  message: string;
  details?: unknown[];
}
```

---

## Dependencias del paquete

- `@ocp/core` (workspace)
- `@ocp/persistence` (workspace)
- `express`
- `helmet`
- `cors`
- `@prisma/client`

---

# Fin del Documento
