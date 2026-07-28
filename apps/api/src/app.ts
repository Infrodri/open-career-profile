import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { type DocumentRepository, type DocumentStorage, type ProfileRepository } from '@ocp/core';
import { OutputEngine, PdfKitAdapter } from '@ocp/output-engine';
import { InstitutionalRulesEngine } from '@ocp/rules-engine';
import { Scanner, ComputrabajoBoProvider, LinkedInPublicProvider, TrabajopolisBoProvider, RemoteOkProvider, GoogleJobsProvider } from '@ocp/job-scanner';
import { TesseractAdapter, getOcrConfig } from '@ocp/ocr-adapter';
import { OpenAiCompatibleAdapter, getAiConfig } from '@ocp/ai-adapter';
import { ProfileService } from './services/profile.service.js';
import { DocumentService } from './services/document.service.js';
import { RuleSetResolver } from './services/rule-set-resolver.js';
import { createProfileRoutes } from './routes/profile.routes.js';
import { createOutputRoutes } from './routes/output.routes.js';
import { createDocumentRoutes } from './routes/document.routes.js';
import { createAiRoutes } from './routes/ai.routes.js';
import { createProfileSectionRoutes } from './routes/profile-section.routes.js';
import { createProfileImportRoutes } from './routes/profile-import.routes.js';
import { createTemplateRoutes } from './routes/template.routes.js';
import { createOutputTemplateRoutes } from './routes/output-template.routes.js';
import { createJobSearchRoutes } from './routes/job-search.routes.js';
import { createAiFormatRoutes } from './routes/ai-format.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export interface AppDependencies {
  profileRepository: ProfileRepository;
  documentRepository: DocumentRepository;
  documentStorage: DocumentStorage;
  prisma: PrismaClient;
}

export function createApp({
  profileRepository,
  documentRepository,
  documentStorage,
  prisma,
}: AppDependencies) {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Services
  const profileService = new ProfileService(profileRepository);
  const documentService = new DocumentService(documentRepository, documentStorage);
  const pdfRenderer = new PdfKitAdapter();
  const outputEngine = new OutputEngine(pdfRenderer);
  const rulesEngine = new InstitutionalRulesEngine();
  const ruleSetResolver = new RuleSetResolver(prisma);

  // Adapters
  const ocrAdapter = new TesseractAdapter(getOcrConfig());
  const aiAdapter = new OpenAiCompatibleAdapter(getAiConfig());

  // Job scanner
  const jobScanner = new Scanner();
  jobScanner.registerProvider(new ComputrabajoBoProvider());
  jobScanner.registerProvider(new LinkedInPublicProvider());
  jobScanner.registerProvider(new TrabajopolisBoProvider());
  jobScanner.registerProvider(new RemoteOkProvider());
  jobScanner.registerProvider(new GoogleJobsProvider());

  // Routes
  app.use('/api/profiles', createProfileRoutes(profileService));
  app.use('/api/profiles', createOutputRoutes({ service: profileService, engine: outputEngine, rulesEngine, ruleSetResolver }));
  app.use('/api/profiles', createProfileSectionRoutes(profileService));
  app.use('/api/profiles', createProfileImportRoutes(profileService, documentService));
  // Mounted at /api because it owns paths under both /documents and /profiles/:id.
  app.use('/api', createDocumentRoutes(ocrAdapter, documentService));
  app.use('/api', createJobSearchRoutes(prisma as never, jobScanner, profileService, aiAdapter));
  app.use('/api/templates', createTemplateRoutes(prisma, documentStorage));
  app.use('/api/output-templates', createOutputTemplateRoutes(prisma as never));
  app.use('/api/ai', createAiRoutes(aiAdapter));
  app.use('/api/ai', createAiFormatRoutes(aiAdapter, profileService, prisma as never));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
