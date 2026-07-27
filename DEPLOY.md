# Guía de Deploy

## Publicar en GitHub

```bash
# 1. Crear repositorio en GitHub (desde github.com/new)
#    Nombre: open-career-profile
#    Visibilidad: Public
#    NO inicializar con README (ya tenemos uno)

# 2. Agregar remote y push
git remote add origin https://github.com/TU_USUARIO/open-career-profile.git
git branch -M main
git push -u origin main
```

---

## Deploy en Render (Backend API + PostgreSQL)

### 1. Crear cuenta en [render.com](https://render.com)

### 2. Crear PostgreSQL

1. Dashboard → New → PostgreSQL
2. Name: `ocp-db`
3. Region: Oregon (o la más cercana)
4. Plan: Free
5. Crear → copiar la **Internal Database URL**

### 3. Crear Web Service (API)

1. Dashboard → New → Web Service
2. Connect your GitHub repo: `open-career-profile`
3. Configurar:

| Campo | Valor |
|-------|-------|
| Name | `ocp-api` |
| Region | Same as DB |
| Branch | `main` |
| Root Directory | `apps/api` |
| Runtime | Node |
| Build Command | `cd ../.. && npm install && npx prisma generate --schema=packages/persistence/src/prisma/schema.prisma && npx prisma db push --schema=packages/persistence/src/prisma/schema.prisma && npm run build --workspace=apps/api` |
| Start Command | `node dist/server.js` |
| Plan | Free |

4. Environment Variables:

| Variable | Valor |
|----------|-------|
| `OCP_DATABASE_URL` | (la Internal Database URL de Render) |
| `OCP_PORT` | `10000` |
| `OCP_AI_BASE_URL` | `https://openrouter.ai/api/v1` |
| `OCP_AI_API_KEY` | (tu API key de OpenRouter) |
| `OCP_AI_MODEL` | `openai/gpt-4o-mini` |
| `OCP_OCR_ENABLED` | `true` |
| `NODE_ENV` | `production` |

5. Deploy

### 4. Verificar

```
https://ocp-api.onrender.com/health
→ {"status":"ok"}
```

---

## Deploy en Vercel (Frontend)

### 1. Crear cuenta en [vercel.com](https://vercel.com)

### 2. Importar proyecto

1. Dashboard → Add New → Project
2. Import Git Repository → seleccionar `open-career-profile`
3. Configurar:

| Campo | Valor |
|-------|-------|
| Framework Preset | Vite |
| Root Directory | `apps/web` |
| Build Command | `cd ../.. && npm install && npm run build --workspace=apps/web` |
| Output Directory | `dist` |
| Install Command | `npm install` |

4. Environment Variables:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://ocp-api.onrender.com` |

### 3. Configurar Proxy (vite.config.ts)

Para que el frontend en Vercel se comunique con el backend en Render, necesitas configurar un `vercel.json`:

Crear `apps/web/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://ocp-api.onrender.com/api/:path*" },
    { "source": "/health", "destination": "https://ocp-api.onrender.com/health" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 4. Deploy

Push a `main` → Vercel detecta el cambio y despliega automáticamente.

### 5. Verificar

```
https://open-career-profile.vercel.app
```

---

## Deploy con Docker (todo junto)

Si prefieres desplegar todo en un solo servidor:

```bash
cd docker
docker compose up --build -d
```

Servicios:
- PostgreSQL: `localhost:5432`
- API: `localhost:3000`
- Web: `localhost:5173`

---

## Deploy con Supabase (Base de datos en la nube)

Supabase ofrece PostgreSQL gratuito con 500MB, sin límite de tiempo (a diferencia de Render que borra en 90 días).

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → crear cuenta
2. Dashboard → **New Project**
3. Configurar:
   - Organization: selecciona o crea una
   - Name: `open-career-profile`
   - Database Password: genera una segura (guardarla)
   - Region: South America (São Paulo) o la más cercana
   - Plan: Free
4. Esperar que se cree (~2 min)

### 2. Obtener la Connection String

1. En el proyecto → **Settings** → **Database**
2. Buscar sección **Connection string** → **URI**
3. Copiar la URI que tiene este formato:
   ```
   postgresql://postgres.[REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
4. **Importante:** Para Prisma, usar el puerto `5432` (Direct connection), no el pooler `6543`:
   ```
   postgresql://postgres.[REF]:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
   ```

### 3. Configurar en tu proyecto local

```bash
# En tu .env local, reemplaza OCP_DATABASE_URL:
OCP_DATABASE_URL=postgresql://postgres.abcdefgh:[TU_PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

### 4. Sincronizar esquema

```bash
npx prisma db push --schema=packages/persistence/src/prisma/schema.prisma
```

Esto crea todas las tablas en Supabase. Puedes verificar en el Dashboard → **Table Editor**.

### 5. Usar con Render (Backend) + Supabase (DB)

En Render, la variable de entorno sería:
```
OCP_DATABASE_URL=postgresql://postgres.abcdefgh:[TU_PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

Ya no necesitas el PostgreSQL de Render (que se borra en 90 días).

### 6. Usar con Vercel (Backend serverless) + Supabase (DB)

Si quieres usar Vercel Functions en vez de Render para el backend:

En `apps/web/vercel.json` cambiar el destino de las rewrites:
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Y crear `apps/web/api/` con serverless functions (requiere refactorización de Express a Vercel Functions — más avanzado).

### Ventajas de Supabase sobre Render PostgreSQL

| Aspecto | Render Free | Supabase Free |
|---------|-------------|---------------|
| Duración | 90 días, luego se borra | Sin límite de tiempo |
| Storage | 1GB | 500MB |
| Rows | Sin límite | Sin límite |
| Dashboard | No | Sí (Table Editor, SQL Editor) |
| Backups | No | Diarios (7 días) |
| Auth | No incluye | Incluye (opcional) |
| Realtime | No | Incluye (opcional) |

### Nota sobre Prisma + Supabase

Supabase usa PgBouncer por defecto. Para que Prisma funcione:

1. Usar `?pgbouncer=true` en la connection string del pooler (puerto 6543)
2. O usar la **Direct connection** (puerto 5432) para migraciones:

```env
# Para la aplicación (usa pooler):
OCP_DATABASE_URL=postgresql://postgres.ref:pass@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Para migraciones (usa conexión directa):
DIRECT_URL=postgresql://postgres.ref:pass@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

En `schema.prisma`, agregar:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("OCP_DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Para migraciones
}
```

---

## Notas Importantes

### Render Free Tier
- El servicio se duerme después de 15 min sin tráfico.
- La primera request tarda ~30s mientras despierta.
- Para producción real, usa el plan Starter ($7/mes).

### Vercel Free Tier
- Serverless functions tienen timeout de 10s.
- 100GB bandwidth/mes.
- Perfecto para el frontend React.

### Base de datos
- Render Free PostgreSQL se elimina después de 90 días.
- Para persistencia, usa el plan pagado o migra a Supabase/Neon.

### Puppeteer en Render
- Para generar PDFs, Puppeteer necesita Chromium.
- En Render, usa el buildpack de Puppeteer o la variable:
  ```
  PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
  ```
  Y instala Chrome via `apt` en el build.

### Almacenamiento de documentos
- En deploy cloud, los archivos en disco se pierden al redeploy.
- Para producción, migrar `@ocp/storage-adapter` a S3/R2/Cloudinary.
- Para demo/MVP, los documentos se pierden en cada deploy (el perfil persiste en la BD).
