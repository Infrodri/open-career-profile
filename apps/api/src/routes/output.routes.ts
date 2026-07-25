import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { OutputEngine } from '@ocp/output-engine';
import { validate } from '../middleware/validate.js';
import { failure } from '../middleware/error-handler.js';
import { type ProfileService } from '../services/profile.service.js';

const outputRequestSchema = z.object({
  templateId: z.string().min(1),
  format: z.enum(['html', 'pdf']),
});

export function createOutputRoutes(service: ProfileService, engine: OutputEngine): Router {
  const router = Router();

  // POST /api/profiles/:id/output — Generate a document from a profile
  router.post('/:id/output', validate(outputRequestSchema), async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const { templateId, format } = req.body;

      const profile = await service.findById(id);
      if (!profile) {
        res.status(404).json(failure('NOT_FOUND', 'Profile not found'));
        return;
      }

      if (format === 'html') {
        const html = engine.generateHtml(profile, templateId);
        res.type('text/html').send(html);
      } else {
        const pdf = await engine.generatePdf(profile, templateId);
        res.type('application/pdf').send(pdf);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate output';
      res.status(400).json(failure('OUTPUT_ERROR', message));
    }
  });

  return router;
}
