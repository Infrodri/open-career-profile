import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { type DocumentRepository, type DocumentStorage, type ProfileRepository } from '@ocp/core';
import { OutputEngine, PuppeteerAdapter } from '@ocp/output-engine';
import { TesseractAdapter, getOcrConfig } from '@ocp/ocr-adapter';
import { OpenAiCompatibleAdapter, getAiConfig } from '@ocp/ai-adapter';
import { ProfileService } from './services/profile.service.js';
import { DocumentService } from './services/document.service.js';
import { createProfileRoutes } from './routes/profile.routes.js';
import { createOutputRoutes } from './routes/output.routes.js';
import { createDocumentRoutes } from './routes/document.routes.js';
import { createAiRoutes } from './routes/ai.routes.js';
import { createProfileSectionRoutes } from './routes/profile-section.routes.js';
import { createProfileImportRoutes } from './routes/profile-import.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export interface AppDependencies {
  profileRepository: ProfileRepository;
  documentRepository: DocumentRepository;
  documentStorage: DocumentStorage;
}

export function createApp({
  profileRepository,
  documentRepository,
  documentStorage,
}: AppDependencies) {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Services
  const profileService = new ProfileService(profileRepository);
  const documentService = new DocumentService(documentRepository, documentStorage);
  const pdfRenderer = new PuppeteerAdapter();
  const outputEngine = new OutputEngine(pdfRenderer);

  // Adapters
  const ocrAdapter = new TesseractAdapter(getOcrConfig());
  const aiAdapter = new OpenAiCompatibleAdapter(getAiConfig());

  // Routes
  app.use('/api/profiles', createProfileRoutes(profileService));
  app.use('/api/profiles', createOutputRoutes(profileService, outputEngine));
  app.use('/api/profiles', createProfileSectionRoutes(profileService));
  app.use('/api/profiles', createProfileImportRoutes(profileService, documentService));
  // Mounted at /api because it owns paths under both /documents and /profiles/:id.
  app.use('/api', createDocumentRoutes(ocrAdapter, documentService));
  app.use('/api/ai', createAiRoutes(aiAdapter));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
