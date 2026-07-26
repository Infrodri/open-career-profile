import { Router, type Request, type Response } from 'express';
import { type PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { Scanner, type SearchConfig } from '@ocp/job-scanner';
import { type AiProvider } from '@ocp/ai-adapter';
import { success, failure } from '../middleware/error-handler.js';
import { validate } from '../middleware/validate.js';
import { type ProfileService } from '../services/profile.service.js';
import { evaluateJobListing } from '../services/job-evaluate.service.js';

/**
 * Extended Prisma client type that includes the job search models.
 * These models exist in the schema but the generated client may not
 * have been regenerated yet (run `npx prisma generate` to fix).
 */
type PrismaWithJobs = PrismaClient & {
  jobSearchConfig: {
    findMany: (args: unknown) => Promise<unknown[]>;
    findUnique: (args: unknown) => Promise<unknown | null>;
    create: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
  };
  jobListing: {
    findMany: (args: unknown) => Promise<unknown[]>;
    findUnique: (args: unknown) => Promise<unknown | null>;
    upsert: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
    deleteMany: (args: unknown) => Promise<unknown>;
  };
};

// --- Validation Schemas ---

const createConfigSchema = z.object({
  targetTitles: z.array(z.string().min(1)).min(1),
  locations: z.array(z.string()).default([]),
  modality: z.enum(['presencial', 'remoto', 'hibrido']).optional(),
  minSalary: z.number().int().positive().optional(),
  excludeKeywords: z.array(z.string()).default([]),
  portals: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

const updateConfigSchema = z.object({
  targetTitles: z.array(z.string().min(1)).min(1).optional(),
  locations: z.array(z.string()).optional(),
  modality: z.enum(['presencial', 'remoto', 'hibrido']).nullable().optional(),
  minSalary: z.number().int().positive().nullable().optional(),
  excludeKeywords: z.array(z.string()).optional(),
  portals: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const updateListingSchema = z.object({
  status: z.enum(['new', 'evaluated', 'applied', 'rejected', 'saved']).optional(),
  cvGenerated: z.boolean().optional(),
});

/**
 * Job search routes.
 * Handles search configurations, scanning portals, and managing listings.
 */
export function createJobSearchRoutes(
  prisma: PrismaWithJobs,
  scanner: Scanner,
  profileService: ProfileService,
  aiProvider: AiProvider,
): Router {
  const router = Router();

  // =========================================================================
  // JOB SEARCH CONFIG CRUD
  // =========================================================================

  // GET /api/profiles/:id/job-configs — List configs for a profile
  router.get('/profiles/:id/job-configs', async (req: Request, res: Response) => {
    try {
      const profileId = req.params['id'] as string;
      const configs = await prisma.jobSearchConfig.findMany({
        where: { profileId },
        orderBy: { createdAt: 'desc' },
      });
      res.json(success(configs));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al listar configuraciones';
      res.status(500).json(failure('LIST_ERROR', msg));
    }
  });

  // GET /api/job-configs/:id — Get a single config
  router.get('/job-configs/:id', async (req: Request, res: Response) => {
    try {
      const config = await prisma.jobSearchConfig.findUnique({
        where: { id: req.params['id'] as string },
      });
      if (!config) {
        res.status(404).json(failure('NOT_FOUND', 'Configuración no encontrada'));
        return;
      }
      res.json(success(config));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al obtener configuración';
      res.status(500).json(failure('FETCH_ERROR', msg));
    }
  });

  // POST /api/profiles/:id/job-configs — Create a config
  router.post('/profiles/:id/job-configs', validate(createConfigSchema), async (req: Request, res: Response) => {
    try {
      const profileId = req.params['id'] as string;

      // Verify profile exists
      const profile = await prisma.profile.findUnique({ where: { id: profileId } });
      if (!profile) {
        res.status(404).json(failure('NOT_FOUND', 'Perfil no encontrado'));
        return;
      }

      const config = await prisma.jobSearchConfig.create({
        data: { profileId, ...req.body },
      });
      res.status(201).json(success(config));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear configuración';
      res.status(500).json(failure('CREATE_ERROR', msg));
    }
  });

  // PUT /api/job-configs/:id — Update a config
  router.put('/job-configs/:id', validate(updateConfigSchema), async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const existing = await prisma.jobSearchConfig.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json(failure('NOT_FOUND', 'Configuración no encontrada'));
        return;
      }

      const updated = await prisma.jobSearchConfig.update({
        where: { id },
        data: req.body,
      });
      res.json(success(updated));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar configuración';
      res.status(500).json(failure('UPDATE_ERROR', msg));
    }
  });

  // DELETE /api/job-configs/:id — Delete a config and its listings
  router.delete('/job-configs/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const existing = await prisma.jobSearchConfig.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json(failure('NOT_FOUND', 'Configuración no encontrada'));
        return;
      }

      // Cascade: delete listings first, then config
      await prisma.jobListing.deleteMany({ where: { configId: id } });
      await prisma.jobSearchConfig.delete({ where: { id } });
      res.status(204).send();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar configuración';
      res.status(500).json(failure('DELETE_ERROR', msg));
    }
  });

  // =========================================================================
  // SCANNING
  // =========================================================================

  // POST /api/job-configs/:id/scan — Trigger a scan using the config
  router.post('/job-configs/:id/scan', async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const config = await prisma.jobSearchConfig.findUnique({ where: { id } });
      if (!config) {
        res.status(404).json(failure('NOT_FOUND', 'Configuración no encontrada'));
        return;
      }

      const searchConfig: SearchConfig = {
        targetTitles: config.targetTitles,
        locations: config.locations,
        modality: config.modality as SearchConfig['modality'],
        minSalary: config.minSalary ?? undefined,
        excludeKeywords: config.excludeKeywords,
        portals: config.portals,
      };

      const scanResult = await scanner.scan(searchConfig);

      // Upsert jobs into the database (skip duplicates by URL)
      let newCount = 0;
      for (const job of scanResult.jobs) {
        try {
          await prisma.jobListing.upsert({
            where: { url: job.url },
            update: {}, // Don't overwrite existing data
            create: {
              configId: id,
              portal: job.portal,
              externalId: job.externalId ?? null,
              title: job.title,
              company: job.company,
              location: job.location ?? null,
              salary: job.salary ?? null,
              url: job.url,
              description: job.description ?? null,
              postedDate: job.postedDate ?? null,
            },
          });
          newCount++;
        } catch {
          // Skip duplicates that violate unique constraints
        }
      }

      res.json(success({
        totalFound: scanResult.totalRaw,
        afterFilters: scanResult.jobs.length,
        newListings: newCount,
        errors: scanResult.errors,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al escanear portales';
      res.status(500).json(failure('SCAN_ERROR', msg));
    }
  });

  // =========================================================================
  // JOB LISTINGS
  // =========================================================================

  // GET /api/job-configs/:id/listings — List all listings for a config
  router.get('/job-configs/:id/listings', async (req: Request, res: Response) => {
    try {
      const configId = req.params['id'] as string;
      const status = req.query['status'] as string | undefined;

      const where: Record<string, unknown> = { configId };
      if (status) {
        where['status'] = status;
      }

      const listings = await prisma.jobListing.findMany({
        where,
        orderBy: [
          { score: 'desc' },
          { createdAt: 'desc' },
        ],
      });
      res.json(success(listings));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al listar ofertas';
      res.status(500).json(failure('LIST_ERROR', msg));
    }
  });

  // GET /api/listings/:id — Get a single listing
  router.get('/listings/:id', async (req: Request, res: Response) => {
    try {
      const listing = await prisma.jobListing.findUnique({
        where: { id: req.params['id'] as string },
      });
      if (!listing) {
        res.status(404).json(failure('NOT_FOUND', 'Oferta no encontrada'));
        return;
      }
      res.json(success(listing));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al obtener oferta';
      res.status(500).json(failure('FETCH_ERROR', msg));
    }
  });

  // PATCH /api/listings/:id — Update listing status
  router.patch('/listings/:id', validate(updateListingSchema), async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const existing = await prisma.jobListing.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json(failure('NOT_FOUND', 'Oferta no encontrada'));
        return;
      }

      const updated = await prisma.jobListing.update({
        where: { id },
        data: req.body,
      });
      res.json(success(updated));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar oferta';
      res.status(500).json(failure('UPDATE_ERROR', msg));
    }
  });

  // DELETE /api/listings/:id — Delete a listing
  router.delete('/listings/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const existing = await prisma.jobListing.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json(failure('NOT_FOUND', 'Oferta no encontrada'));
        return;
      }

      await prisma.jobListing.delete({ where: { id } });
      res.status(204).send();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar oferta';
      res.status(500).json(failure('DELETE_ERROR', msg));
    }
  });

  // GET /api/job-scanner/providers — List available providers
  router.get('/job-scanner/providers', (_req: Request, res: Response) => {
    res.json(success(scanner.getProviders()));
  });

  // =========================================================================
  // AI EVALUATION
  // =========================================================================

  // POST /api/listings/:id/evaluate — Evaluate a listing against the user's profile
  router.post('/listings/:id/evaluate', async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const listing = await prisma.jobListing.findUnique({
        where: { id },
        include: { config: true },
      });
      if (!listing) {
        res.status(404).json(failure('NOT_FOUND', 'Oferta no encontrada'));
        return;
      }

      if (!listing.description) {
        res.status(422).json(failure('NO_DESCRIPTION', 'La oferta no tiene descripción para evaluar'));
        return;
      }

      const profile = await profileService.findById(listing.config.profileId);
      if (!profile) {
        res.status(404).json(failure('PROFILE_NOT_FOUND', 'Perfil no encontrado'));
        return;
      }

      const evaluation = await evaluateJobListing(
        listing.title,
        listing.description,
        profile,
        aiProvider,
      );

      // Persist the evaluation results
      await prisma.jobListing.update({
        where: { id },
        data: {
          score: evaluation.score,
          matchSummary: evaluation.matchSummary,
          skillGaps: evaluation.skillGaps,
          recommendation: evaluation.recommendation,
          status: 'evaluated',
        },
      });

      res.json(success(evaluation));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al evaluar la oferta';
      res.status(500).json(failure('EVALUATE_ERROR', msg));
    }
  });

  return router;
}
