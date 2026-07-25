import { loadEnv } from './env.js';

// Must run before anything reads process.env, in particular before a
// PrismaClient is constructed.
const loadedEnvPath = loadEnv();

/**
 * Variables the API cannot start without.
 * Failing here gives a clear message instead of an opaque Prisma error on the
 * first request that touches the database.
 */
function requireEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim() === '') {
    const hint = loadedEnvPath
      ? `Se leyó ${loadedEnvPath}, pero no define ${name}.`
      : 'No se encontró ningún archivo .env. Copia .env.example a .env en la raíz del proyecto.';

    throw new Error(
      `[OCP API] Falta la variable de entorno ${name}. ${hint}\n` +
        'Sin ella la API no puede conectarse a PostgreSQL.',
    );
  }

  return value;
}

export const config = {
  port: parseInt(process.env['OCP_PORT'] ?? '3000', 10),
  databaseUrl: requireEnv('OCP_DATABASE_URL'),
  storagePath: process.env['OCP_STORAGE_PATH'] ?? './storage/documents',
  /** Path of the .env that was loaded, for startup diagnostics. */
  loadedEnvPath,
};
