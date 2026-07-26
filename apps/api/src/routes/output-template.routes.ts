import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { templateRegistry } from '@ocp/output-engine';
import { success, failure } from '../middleware/error-handler.js';
import { validate } from '../middleware/validate.js';

/**
 * Extended Prisma client type for OutputTemplate.
 * Used until prisma generate can be run to produce native types.
 */
type PrismaWithOutputTemplate = {
  outputTemplate: {
    findMany: (args?: unknown) => Promise<OutputTemplateRow[]>;
    findUnique: (args: unknown) => Promise<OutputTemplateRow | null>;
    create: (args: unknown) => Promise<OutputTemplateRow>;
    update: (args: unknown) => Promise<OutputTemplateRow>;
    delete: (args: unknown) => Promise<OutputTemplateRow>;
  };
};

interface OutputTemplateRow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  source: string;
  isBuiltIn: boolean;
  ruleSetId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// --- Schemas ---

const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(['cv', 'portfolio', 'academic', 'institutional', 'government']).default('cv'),
  source: z.string().min(10),
  ruleSetId: z.string().uuid().optional(),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.enum(['cv', 'portfolio', 'academic', 'institutional', 'government']).optional(),
  source: z.string().min(10).optional(),
  ruleSetId: z.string().uuid().nullable().optional(),
});

const previewSchema = z.object({
  source: z.string().min(10),
});

/**
 * Output Template routes — CRUD for user-editable Handlebars design templates.
 * These are DESIGN templates (the visual layout), distinct from InstitutionalTemplates
 * (which define RULES about what content to include).
 */
export function createOutputTemplateRoutes(prisma: PrismaWithOutputTemplate): Router {
  const router = Router();

  // GET /api/output-templates — List all design templates
  router.get('/', async (req: Request, res: Response) => {
    try {
      const category = req.query['category'] as string | undefined;
      const where = category ? { category } : undefined;
      const templates = await prisma.outputTemplate.findMany(
        where ? { where, orderBy: { createdAt: 'desc' } } : { orderBy: { createdAt: 'desc' } },
      );
      res.json(success(templates));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al listar plantillas';
      res.status(500).json(failure('LIST_ERROR', msg));
    }
  });

  // GET /api/output-templates/:id — Get a single template (including source)
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const template = await prisma.outputTemplate.findUnique({
        where: { id: req.params['id'] as string },
      });
      if (!template) {
        res.status(404).json(failure('NOT_FOUND', 'Plantilla no encontrada'));
        return;
      }
      res.json(success(template));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al obtener plantilla';
      res.status(500).json(failure('FETCH_ERROR', msg));
    }
  });

  // POST /api/output-templates — Create a new template
  router.post('/', validate(createTemplateSchema), async (req: Request, res: Response) => {
    try {
      const { name, description, category, source, ruleSetId } = req.body;

      // Validate the Handlebars source compiles
      try {
        templateRegistry.compilePreview(source);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error de compilación';
        res.status(400).json(failure('INVALID_TEMPLATE', `El source Handlebars no es válido: ${msg}`));
        return;
      }

      const template = await prisma.outputTemplate.create({
        data: {
          name,
          description: description ?? null,
          category,
          source,
          isBuiltIn: false,
          ruleSetId: ruleSetId ?? null,
        },
      });

      // Register in the runtime cache
      templateRegistry.registerTemplate(template.id, source);

      res.status(201).json(success(template));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear plantilla';
      res.status(500).json(failure('CREATE_ERROR', msg));
    }
  });

  // PUT /api/output-templates/:id — Update a template
  router.put('/:id', validate(updateTemplateSchema), async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const existing = await prisma.outputTemplate.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json(failure('NOT_FOUND', 'Plantilla no encontrada'));
        return;
      }

      if (existing.isBuiltIn) {
        res.status(403).json(failure('FORBIDDEN', 'Las plantillas integradas no se pueden editar'));
        return;
      }

      const { source } = req.body;
      if (source) {
        try {
          templateRegistry.compilePreview(source);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error de compilación';
          res.status(400).json(failure('INVALID_TEMPLATE', `El source Handlebars no es válido: ${msg}`));
          return;
        }
      }

      const updated = await prisma.outputTemplate.update({
        where: { id },
        data: req.body,
      });

      // Invalidate cache if source changed
      if (source) {
        templateRegistry.invalidate(id, source);
      }

      res.json(success(updated));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar plantilla';
      res.status(500).json(failure('UPDATE_ERROR', msg));
    }
  });

  // DELETE /api/output-templates/:id — Delete a template
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const existing = await prisma.outputTemplate.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json(failure('NOT_FOUND', 'Plantilla no encontrada'));
        return;
      }

      if (existing.isBuiltIn) {
        res.status(403).json(failure('FORBIDDEN', 'Las plantillas integradas no se pueden eliminar'));
        return;
      }

      await prisma.outputTemplate.delete({ where: { id } });
      templateRegistry.removeTemplate(id);
      res.status(204).send();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar plantilla';
      res.status(500).json(failure('DELETE_ERROR', msg));
    }
  });

  // POST /api/output-templates/preview — Preview a template with sample data
  router.post('/preview', validate(previewSchema), async (req: Request, res: Response) => {
    try {
      const { source } = req.body;

      let compiled: ReturnType<typeof templateRegistry.compilePreview>;
      try {
        compiled = templateRegistry.compilePreview(source);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error de compilación';
        res.status(400).json(failure('INVALID_TEMPLATE', `El source Handlebars no es válido: ${msg}`));
        return;
      }

      const sampleData = {
        personalInfo: {
          fullName: 'Juan Pérez Méndez',
          profesiones: ['Ingeniero de Sistemas', 'Técnico Superior en Contabilidad'],
          email: 'juan.perez@email.com',
          phone: '+591 71234567',
          city: 'Sucre',
          country: 'Bolivia',
          summary: 'Profesional con 8 años de experiencia en desarrollo de sistemas informáticos y administración pública.',
        },
        sections: {
          formacionAcademica: [
            { title: 'Licenciatura en Ingeniería de Sistemas', institution: 'Universidad San Francisco Xavier', startDate: '2012', endDate: '2017', verified: true },
          ],
          experienciaAdministrativa: [
            { position: 'Analista de Sistemas', institution: 'Órgano Judicial', startDate: '2020-01', endDate: '2024-06', description: 'Desarrollo y mantenimiento de sistemas institucionales', verified: true },
            { position: 'Técnico Informático', institution: 'Gobierno Municipal', startDate: '2017-03', endDate: '2019-12', description: 'Soporte técnico y administración de redes', verified: true },
          ],
          habilidades: [
            { name: 'TypeScript', category: 'técnica', level: 'advanced', verified: true },
            { name: 'PostgreSQL', category: 'técnica', level: 'advanced', verified: true },
            { name: 'React', category: 'técnica', level: 'intermediate', verified: false },
          ],
          idiomas: [
            { name: 'Español', level: 'native', verified: true },
            { name: 'Inglés', level: 'intermediate', verified: false },
          ],
        },
      };

      const html = compiled(sampleData);

      // Sanitize: strip <script> tags from the output as a defense-in-depth measure
      const sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

      res.type('text/html').send(sanitized);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al generar preview';
      res.status(500).json(failure('PREVIEW_ERROR', msg));
    }
  });

  return router;
}
