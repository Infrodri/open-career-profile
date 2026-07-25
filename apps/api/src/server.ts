import { PrismaClient } from '@prisma/client';
import { PrismaProfileRepository } from '@ocp/persistence';
import { createApp } from './app.js';
import { config } from './config.js';

const prisma = new PrismaClient();
const repository = new PrismaProfileRepository(prisma);
const app = createApp(repository);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[OCP API] Server running on http://localhost:${config.port}`);
});
