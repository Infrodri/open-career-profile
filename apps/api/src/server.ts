// Imported first: loading .env and validating the configuration must happen
// before a PrismaClient exists.
import { config } from './config.js';
import { PrismaClient } from '@prisma/client';
import { PrismaProfileRepository, PrismaDocumentRepository } from '@ocp/persistence';
import { LocalFileStorage } from '@ocp/storage-adapter';
import { createApp } from './app.js';

// A single Prisma client for the whole process: each instance opens its own pool.
// The URL is passed explicitly so the connection does not depend on Prisma
// resolving the environment variable by itself at query time.
const prisma = new PrismaClient({ datasourceUrl: config.databaseUrl });
const documentStorage = new LocalFileStorage(config.storagePath);

const app = createApp({
  profileRepository: new PrismaProfileRepository(prisma),
  documentRepository: new PrismaDocumentRepository(prisma, documentStorage),
  documentStorage,
});

/** Fail at startup rather than on the first request that needs the database. */
async function verifyDatabaseConnection(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `[OCP API] No se pudo conectar a PostgreSQL.\n` +
        `URL configurada: ${config.databaseUrl.replace(/:[^:@/]*@/, ':****@')}\n` +
        `¿Está el contenedor levantado? Prueba: cd docker && docker compose up -d postgres\n` +
        `Detalle: ${detail}`,
    );
  }
}

async function main(): Promise<void> {
  await verifyDatabaseConnection();

  const server = app.listen(config.port, () => {
    console.log(`[OCP API] Server running on http://localhost:${config.port}`);
    console.log(`[OCP API] Document storage: ${documentStorage.getBasePath()}`);
    console.log(`[OCP API] Env file: ${config.loadedEnvPath ?? 'none (using process env)'}`);
  });

  // A server that cannot listen is useless, so exit instead of lingering as a
  // process that accepts nothing.
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `[OCP API] El puerto ${config.port} ya está en uso. ` +
          'Cierra la otra instancia o cambia OCP_PORT.',
      );
    } else {
      console.error('[OCP API] Error del servidor HTTP:', err);
    }
    process.exit(1);
  });

  /**
   * The OCR worker can emit errors outside any request scope. Without these
   * handlers a single unreadable image takes the whole API process down.
   * Registered after the server error handler so startup failures still exit.
   */
  process.on('unhandledRejection', (reason) => {
    console.error('[OCP API] Unhandled rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[OCP API] Uncaught exception:', err);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`[OCP API] ${signal} received, shutting down`);
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
