import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { type AiProvider } from '@ocp/ai-adapter';
import { type ProfessionalProfile, PROFILE_SECTION_KEYS } from '@ocp/core';
import { success, failure } from '../middleware/error-handler.js';
import { validate } from '../middleware/validate.js';
import { type ProfileService } from '../services/profile.service.js';
import { parseRuleSet } from '@ocp/rules-engine';

// --- Schemas ---

const analyzeFormatSchema = z.object({
  text: z.string().min(10),
});

const adaptProfileSchema = z.object({
  profileId: z.string().min(1),
  ruleSetId: z.string().min(1),
});

// --- Types ---

interface AnalyzeFormatResult {
  ruleSet: Record<string, unknown>;
  confidence: number;
  notes: string;
}

interface AdaptProfileResult {
  adaptedSummary: string;
  adaptedDescriptions: Array<{ section: string; entryId: string; original: string; adapted: string }>;
  missingInfo: string[];
  suggestions: string[];
}

const EMPTY_ANALYZE_RESULT: AnalyzeFormatResult = {
  ruleSet: {
    requiredSections: [],
    includeSections: [],
    excludeSections: [],
    onlyVerified: false,
    requirePhoto: false,
  },
  confidence: 0,
  notes: 'La IA no está disponible. Puedes configurar las reglas manualmente.',
};

const EMPTY_ADAPT_RESULT: AdaptProfileResult = {
  adaptedSummary: '',
  adaptedDescriptions: [],
  missingInfo: [],
  suggestions: ['La IA no está disponible. No se pueden adaptar los textos automáticamente.'],
};

/**
 * AI Format Analysis routes (SPEC-009).
 * Analyzes institutional formats and adapts profiles using AI.
 */
export function createAiFormatRoutes(
  aiProvider: AiProvider,
  profileService: ProfileService,
  prisma: { institutionalTemplate: { findUnique: (args: unknown) => Promise<{ rules: unknown } | null> } },
): Router {
  const router = Router();

  // POST /api/ai/analyze-format — Analyze an institutional format and propose rules
  router.post('/analyze-format', validate(analyzeFormatSchema), async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!aiProvider.isAvailable()) {
        res.json(success(EMPTY_ANALYZE_RESULT));
        return;
      }

      const prompt = buildAnalyzeFormatPrompt(text);
      const raw = await aiProvider.complete(prompt);

      if (raw.startsWith('[AI')) {
        res.json(success(EMPTY_ANALYZE_RESULT));
        return;
      }

      const result = parseAnalyzeFormatResponse(raw);
      res.json(success(result));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al analizar el formato';
      res.status(500).json(failure('ANALYZE_FORMAT_ERROR', msg));
    }
  });

  // POST /api/ai/adapt-profile — Adapt profile texts for a specific institutional format
  router.post('/adapt-profile', validate(adaptProfileSchema), async (req: Request, res: Response) => {
    try {
      const { profileId, ruleSetId } = req.body;

      if (!aiProvider.isAvailable()) {
        res.json(success(EMPTY_ADAPT_RESULT));
        return;
      }

      const profile = await profileService.findById(profileId);
      if (!profile) {
        res.status(404).json(failure('NOT_FOUND', 'Perfil no encontrado'));
        return;
      }

      const template = await prisma.institutionalTemplate.findUnique({ where: { id: ruleSetId } });
      if (!template) {
        res.status(404).json(failure('NOT_FOUND', 'Plantilla institucional no encontrada'));
        return;
      }

      const ruleSet = parseRuleSet(template.rules);
      const prompt = buildAdaptProfilePrompt(profile, ruleSet);
      const raw = await aiProvider.complete(prompt);

      if (raw.startsWith('[AI')) {
        res.json(success(EMPTY_ADAPT_RESULT));
        return;
      }

      const result = parseAdaptProfileResponse(raw);
      res.json(success(result));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al adaptar el perfil';
      res.status(500).json(failure('ADAPT_PROFILE_ERROR', msg));
    }
  });

  return router;
}

// --- Prompt builders ---

function buildAnalyzeFormatPrompt(formatText: string): string {
  const sectionList = PROFILE_SECTION_KEYS.join(', ');
  return `Eres un experto en formatos institucionales de CV. Analiza el siguiente texto extraído de un formulario/formato institucional y determina qué información requiere.

TEXTO DEL FORMATO:
---
${formatText.slice(0, 5000)}
---

Identifica:
1. Qué secciones del perfil profesional son OBLIGATORIAS
2. Qué secciones se deben incluir
3. Qué secciones NO aplican (excluir)
4. Si requiere foto
5. Si solo acepta información verificada/certificada
6. Límite de páginas si se menciona
7. Límite de caracteres del resumen si se menciona

Las secciones válidas son: ${sectionList}

Responde SOLO con JSON válido:
{
  "ruleSet": {
    "requiredSections": ["secciones obligatorias"],
    "includeSections": ["secciones a incluir"],
    "excludeSections": ["secciones a excluir"],
    "onlyVerified": true/false,
    "requirePhoto": true/false,
    "maxPages": null o número,
    "maxSummaryLength": null o número,
    "notes": "notas adicionales sobre el formato"
  },
  "confidence": 0.0-1.0,
  "notes": "observaciones sobre la interpretación del formato"
}

SOLO JSON, nada más.`;
}

function buildAdaptProfilePrompt(profile: ProfessionalProfile, ruleSet: unknown): string {
  const summary = profile.personalInfo.summary ?? '';
  const sections = profile.sections;

  // Build a compact representation of the profile
  const sectionSummaries: string[] = [];
  for (const key of PROFILE_SECTION_KEYS) {
    const entries = sections[key];
    if (entries.length === 0) continue;
    const items = entries.slice(0, 3).map((e) => {
      const entry = e as unknown as Record<string, unknown>;
      return entry['title'] ?? entry['position'] ?? entry['name'] ?? '(sin título)';
    });
    sectionSummaries.push(`${key}: ${items.join(', ')}${entries.length > 3 ? ` (+${entries.length - 3} más)` : ''}`);
  }

  return `Eres un experto en redacción de CVs. Adapta los textos del siguiente perfil profesional para que se ajusten al tono y requisitos del formato institucional.

PERFIL:
Nombre: ${profile.personalInfo.fullName}
Resumen actual: "${summary}"
Secciones: ${sectionSummaries.join('; ')}

REGLAS DEL FORMATO:
${JSON.stringify(ruleSet)}

Tareas:
1. Reescribe el resumen profesional para que se ajuste al tono institucional (formal, conciso).
2. Identifica qué información FALTA para cumplir con los requisitos.
3. Sugiere mejoras concretas.

NUNCA inventes experiencia o habilidades que no estén en el perfil.
Solo puedes reformular lo que ya existe.

Responde SOLO con JSON válido:
{
  "adaptedSummary": "resumen reescrito para el formato institucional",
  "missingInfo": ["información que falta para cumplir el formato"],
  "suggestions": ["sugerencias concretas de mejora"]
}

SOLO JSON, nada más.`;
}

// --- Response parsers ---

function parseAnalyzeFormatResponse(raw: string): AnalyzeFormatResult {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return EMPTY_ANALYZE_RESULT;

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const ruleSet = typeof parsed['ruleSet'] === 'object' && parsed['ruleSet'] !== null
      ? parsed['ruleSet'] as Record<string, unknown>
      : EMPTY_ANALYZE_RESULT.ruleSet;

    const confidence = typeof parsed['confidence'] === 'number'
      ? Math.max(0, Math.min(1, parsed['confidence']))
      : 0.5;

    const notes = typeof parsed['notes'] === 'string' ? parsed['notes'] : '';

    return { ruleSet, confidence, notes };
  } catch {
    return EMPTY_ANALYZE_RESULT;
  }
}

function parseAdaptProfileResponse(raw: string): AdaptProfileResult {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return EMPTY_ADAPT_RESULT;

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    const adaptedSummary = typeof parsed['adaptedSummary'] === 'string'
      ? parsed['adaptedSummary']
      : '';

    const missingInfo = Array.isArray(parsed['missingInfo'])
      ? (parsed['missingInfo'] as unknown[]).filter((s): s is string => typeof s === 'string')
      : [];

    const suggestions = Array.isArray(parsed['suggestions'])
      ? (parsed['suggestions'] as unknown[]).filter((s): s is string => typeof s === 'string')
      : [];

    return {
      adaptedSummary,
      adaptedDescriptions: [],
      missingInfo,
      suggestions,
    };
  } catch {
    return EMPTY_ADAPT_RESULT;
  }
}
