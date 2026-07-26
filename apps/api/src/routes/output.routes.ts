import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { type RulesEngine } from '@ocp/core';
import { OutputEngine } from '@ocp/output-engine';
import { validate } from '../middleware/validate.js';
import { failure, success } from '../middleware/error-handler.js';
import { type ProfileService } from '../services/profile.service.js';
import { type RuleSetResolver } from '../services/rule-set-resolver.js';

const outputRequestSchema = z.object({
  templateId: z.string().min(1),
  format: z.enum(['html', 'pdf']),
  ruleSetId: z.string().optional(),
});

const validateRequestSchema = z.object({
  ruleSetId: z.string().min(1),
});

export interface OutputRouteDeps {
  service: ProfileService;
  engine: OutputEngine;
  rulesEngine: RulesEngine;
  ruleSetResolver: RuleSetResolver;
}

export function createOutputRoutes({
  service,
  engine,
  rulesEngine,
  ruleSetResolver,
}: OutputRouteDeps): Router {
  const router = Router();

  // POST /api/profiles/:id/validate — Validate a profile against institutional rules
  router.post('/:id/validate', validate(validateRequestSchema), async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const { ruleSetId } = req.body;

      const profile = await service.findById(id);
      if (!profile) {
        res.status(404).json(failure('NOT_FOUND', 'Perfil no encontrado'));
        return;
      }

      const ruleSet = await ruleSetResolver.resolve(ruleSetId);
      if (!ruleSet) {
        res.status(404).json(failure('RULESET_NOT_FOUND', 'Plantilla institucional no encontrada'));
        return;
      }

      const result = rulesEngine.validate(profile, ruleSet);
      res.json(success(result));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al validar el perfil';
      res.status(500).json(failure('VALIDATE_ERROR', message));
    }
  });

  // POST /api/profiles/:id/output — Generate a document from a profile
  router.post('/:id/output', validate(outputRequestSchema), async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const { templateId, format, ruleSetId } = req.body;

      let profile = await service.findById(id);
      if (!profile) {
        res.status(404).json(failure('NOT_FOUND', 'Profile not found'));
        return;
      }

      // If a ruleSetId is provided, validate and apply rules before generating
      if (ruleSetId) {
        const ruleSet = await ruleSetResolver.resolve(ruleSetId);
        if (!ruleSet) {
          res.status(404).json(failure('RULESET_NOT_FOUND', 'Plantilla institucional no encontrada'));
          return;
        }

        const validation = rulesEngine.validate(profile, ruleSet);
        if (!validation.valid) {
          res.status(422).json(failure('VALIDATION_FAILED', 'El perfil no cumple los requisitos de la plantilla institucional', validation.issues));
          return;
        }

        // Apply rules to produce a transformed view
        profile = rulesEngine.applyRules(profile, ruleSet);
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
