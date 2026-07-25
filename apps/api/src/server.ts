import { PrismaClient } from '@prisma/client';
import { PrismaProfileRepository } from '@ocp/persistence';
import { LocalFileStorage } from '@ocp/storage-adapter';
import { createApp } from './app.js';
import { config } from './config.js';

const prisma = new PrismaClient();
const repository = new PrismaProfileRepository(prisma);
const storage = new LocalFileStorage(config.storagePath);
const app = createApp(repository, storage);

app.listen(config.port, () => {
  console.log(`[OCP API] Server running on http://localhost:${config.port}`);
});
