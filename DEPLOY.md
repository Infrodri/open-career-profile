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
