import { PrismaClient } from '@prisma/client';
import { PrismaProfileRepository, PrismaDocumentRepository } from '@ocp/persistence';
import { LocalFileStorage } from '@ocp/storage-adapter';
import { createApp } from './app.js';
import { config } from './config.js';

// A single Prisma client for the whole process: each instance opens its own pool.
const prisma = new PrismaClient();
const documentStorage = new LocalFileStorage(config.storagePath);

const app = createApp({
  profileRepository: new PrismaProfileRepository(prisma),
  documentRepository: new PrismaDocumentRepository(prisma, documentStorage),
  documentStorage,
});

const server = app.listen(config.port, () => {
  console.log(`[OCP API] Server running on http://localhost:${config.port}`);
  console.log(`[OCP API] Document storage: ${documentStorage.getBasePath()}`);
});

/**
 * The OCR worker can emit errors outside any request scope. Without these
 * handlers a single unreadable image takes the whole API process down.
 */
process.on('unhandledRejection', (reason) => {
  console.error('[OCP API] Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[OCP API] Uncaught exception:', err);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`[OCP API] ${signal} received, shutting down`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
