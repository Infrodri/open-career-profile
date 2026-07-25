import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { type ProfileRepository } from '@ocp/core';
import { OutputEngine, PuppeteerAdapter } from '@ocp/output-engine';
import { ProfileService } from './services/profile.service.js';
import { createProfileRoutes } from './routes/profile.routes.js';
import { createOutputRoutes } from './routes/output.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp(repository: ProfileRepository) {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Services
  const profileService = new ProfileService(repository);
  const pdfRenderer = new PuppeteerAdapter();
  const outputEngine = new OutputEngine(pdfRenderer);

  // Routes
  app.use('/api/profiles', createProfileRoutes(profileService));
  app.use('/api/profiles', createOutputRoutes(profileService, outputEngine));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
