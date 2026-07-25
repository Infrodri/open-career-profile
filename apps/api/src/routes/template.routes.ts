import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { type DocumentStorage } from '@ocp/core';
import { success, failure } from '../middleware/error-handler.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * Institutional Template routes.
 * Manages templates that define how a CV is generated for a specific institution.
 */
export function createTemplateRoutes(prisma: PrismaClient, storage: DocumentStorage): Router {
  const router = Router();

  // GET /api/templates — list all templates
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const templates = await prisma.institutionalTemplate.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json(success(templates));
    } catch (err) {
      res.status(500).json(failure('LIST_ERROR', 'No se pudieron listar las plantillas'));
    }
  });

  // GET /api/templates/:id — get a single template
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const template = await prisma.institutionalTemplate.findUnique({
        where: { id: req.params.id as string },
      });
      if (!template) {
        res.status(404).json(failure('NOT_FOUND', 'Plantilla no encontrada'));
        return;
      }
      res.json(success(template));
    } catch (err) {
      res.status(500).json(failure('FETCH_ERROR', 'No se pudo obtener la plantilla'));
    }
  });

  // POST /api/templates — create a new template (with optional file upload)
  router.post('/', upload.single('templateFile'), async (req: Request, res: Response) => {
    try {
      const { name, institution, description, rules } = req.body;

      if (!name || !institution) {
        res.status(400).json(failure('INVALID_INPUT', 'name e institution son obligatorios'));
        return;
      }

      let templatePath: string | null = null;
      if (req.file) {
        templatePath = await storage.save(
          req.file.buffer,
          req.file.originalname,
          'templates',
        );
      }

      let parsedRules = {};
      if (rules) {
        try {
          parsedRules = typeof rules === 'string' ? JSON.parse(rules) : rules;
        } catch {
          res.status(400).json(failure('INVALID_INPUT', 'rules debe ser JSON válido'));
          return;
        }
      }

      const template = await prisma.institutionalTemplate.create({
        data: {
          name,
          institution,
          description: description ?? null,
          templatePath,
          rules: parsedRules,
        },
      });

      res.status(201).json(success(template));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear la plantilla';
      res.status(500).json(failure('CREATE_ERROR', message));
    }
  });

  // PUT /api/templates/:id — update a template
  router.put('/:id', upload.single('templateFile'), async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { name, institution, description, rules } = req.body;

      const existing = await prisma.institutionalTemplate.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json(failure('NOT_FOUND', 'Plantilla no encontrada'));
        return;
      }

      let templatePath = existing.templatePath;
      if (req.file) {
        // Delete old file if exists
        if (existing.templatePath) {
          await storage.delete(existing.templatePath).catch(() => {});
        }
        templatePath = await storage.save(req.file.buffer, req.file.originalname, 'templates');
      }

      let parsedRules = existing.rules;
      if (rules) {
        try {
          parsedRules = typeof rules === 'string' ? JSON.parse(rules) : rules;
        } catch {
          res.status(400).json(failure('INVALID_INPUT', 'rules debe ser JSON válido'));
          return;
        }
      }

      const updated = await prisma.institutionalTemplate.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          institution: institution ?? existing.institution,
          description: description !== undefined ? description : existing.description,
          templatePath,
          rules: parsedRules as any,
        },
      });

      res.json(success(updated));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar la plantilla';
      res.status(500).json(failure('UPDATE_ERROR', message));
    }
  });

  // DELETE /api/templates/:id
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const existing = await prisma.institutionalTemplate.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json(failure('NOT_FOUND', 'Plantilla no encontrada'));
        return;
      }

      if (existing.templatePath) {
        await storage.delete(existing.templatePath).catch(() => {});
      }

      await prisma.institutionalTemplate.delete({ where: { id } });
      res.status(204).send();
    } catch (err) {
      res.status(500).json(failure('DELETE_ERROR', 'No se pudo eliminar la plantilla'));
    }
  });

  // GET /api/templates/:id/file — download the template file
  router.get('/:id/file', async (req: Request, res: Response) => {
    try {
      const template = await prisma.institutionalTemplate.findUnique({
        where: { id: req.params.id as string },
      });
      if (!template || !template.templatePath) {
        res.status(404).json(failure('NOT_FOUND', 'Archivo de plantilla no encontrado'));
        return;
      }

      const buffer = await storage.read(template.templatePath);
      const ext = template.templatePath.split('.').pop() ?? 'pdf';
      const mimeType = ext === 'pdf' ? 'application/pdf' : 'application/octet-stream';

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="plantilla.${ext}"`);
      res.send(buffer);
    } catch (err) {
      res.status(500).json(failure('DOWNLOAD_ERROR', 'No se pudo descargar la plantilla'));
    }
  });

  return router;
}
