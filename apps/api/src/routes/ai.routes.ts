import { Router, type Request, type Response } from 'express';
import { type AiProvider, getAiConfig } from '@ocp/ai-adapter';
import { success, failure } from '../middleware/error-handler.js';
import { analyzeDocumentMultiPass } from '../services/ai-analyze.service.js';

interface AnalyzeRequestBody {
  text: string;
}

interface ProfileAnalysisResult {
  documentType: string;
  personalInfo: Record<string, unknown>;
  sections: Record<string, Array<Record<string, unknown>>>;
  recommendations: string[];
  confidence: number;
}

const FALLBACK_RESPONSE: ProfileAnalysisResult = {
  documentType: 'otro',
  personalInfo: {},
  sections: {
    formacionAcademica: [],
    postgrado: [],
    experienciaAdministrativa: [],
    experienciaDocente: [],
    experienciaDesarrollo: [],
    certificacionesCiberseguridad: [],
    certificacionesSistemasInstitucionales: [],
    cursosAdministrativos: [],
    cursosProgramacion: [],
    cursosEspecialidad: [],
    cursosGenerales: [],
    reconocimientosExpositor: [],
    reconocimientosRepresentacion: [],
    reconocimientosLaborales: [],
    languages: [],
    skills: [],
  },
  recommendations: [
    'La IA no está disponible. Puedes completar la información manualmente.',
  ],
  confidence: 0.1,
};

export function createAiRoutes(aiProvider: AiProvider): Router {
  const router = Router();

  // GET /api/ai/status — Check if AI provider is connected and working
  router.get('/status', async (_req: Request, res: Response) => {
    try {
      const config = getAiConfig();

      // Report which piece of configuration is missing. Values are never
      // included, only whether each one is present and well formed.
      if (!aiProvider.isAvailable()) {
        const missing: string[] = [];
        if (!config.baseUrl.startsWith('http')) missing.push('OCP_AI_BASE_URL');
        if (config.model === '') missing.push('OCP_AI_MODEL');
        if (config.apiKey === '') missing.push('OCP_AI_API_KEY');

        res.json(
          success({
            connected: false,
            model: config.model,
            error:
              missing.length > 0
                ? `IA no configurada: revisa ${missing.join(', ')}`
                : 'IA no configurada',
          }),
        );
        return;
      }

      const check = await (aiProvider as any).checkConnection?.();
      if (check) {
        res.json(
          success({
            connected: check.ok,
            model: check.model,
            error: check.error ?? null,
          }),
        );
      } else {
        res.json(success({ connected: true, model: config.model, error: null }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error checking AI status';
      res.json(success({ connected: false, model: '', error: message }));
    }
  });

  // POST /api/ai/analyze — Analiza un documento y extrae todo el perfil profesional
  router.post('/analyze', async (req: Request, res: Response) => {
    try {
      const { text } = req.body as AnalyzeRequestBody;

      if (!text || typeof text !== 'string' || text.trim() === '') {
        res
          .status(400)
          .json(failure('INVALID_INPUT', 'El cuerpo debe incluir un campo "text" no vacío'));
        return;
      }

      if (!aiProvider.isAvailable()) {
        res.json(success(FALLBACK_RESPONSE));
        return;
      }

      console.log(`[AI] Starting multi-pass analysis of ${text.length} chars...`);

      const result = await analyzeDocumentMultiPass(text, aiProvider, (progress) => {
        console.log(`[AI] ${progress.step}`);
      });

      const totalEntries = Object.values(result.sections).reduce((sum, arr) => sum + arr.length, 0);
      console.log(`[AI] Done: ${totalEntries} entries extracted, confidence ${result.confidence}`);

      res.json(success(result));
    } catch (err) {
      console.error('[AI Route Error]', err);
      const message = err instanceof Error ? err.message : 'Error al analizar el documento';
      res.status(500).json(failure('ANALYZE_ERROR', message));
    }
  });

  return router;
}
