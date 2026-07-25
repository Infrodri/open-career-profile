import { Router, type Request, type Response } from 'express';
import { type AiProvider } from '@ocp/ai-adapter';
import { success, failure } from '../middleware/error-handler.js';

const ANALYZE_PROMPT = `Analyze the following text extracted from a document.
Identify:
1. Document type (one of: certificate, degree, contract, course, reference, other)
2. Which profile section this belongs to (workExperience, education, certifications, courses, skills, languages)
3. Extract all relevant structured fields as key-value pairs
4. Your confidence level (0 to 1)

Respond ONLY with valid JSON in this exact format:
{
  "documentType": "...",
  "suggestedSection": "...",
  "extractedFields": { "field1": "value1", "field2": "value2" },
  "confidence": 0.85
}

Text to analyze:
---
{TEXT}
---`;

interface AnalyzeRequestBody {
  text: string;
}

interface AnalyzeResult {
  documentType: string;
  suggestedSection: string;
  extractedFields: Record<string, string>;
  confidence: number;
}

const FALLBACK_RESPONSE: AnalyzeResult = {
  documentType: 'other',
  suggestedSection: 'skills',
  extractedFields: {},
  confidence: 0.1,
};

export function createAiRoutes(aiProvider: AiProvider): Router {
  const router = Router();

  // POST /api/ai/analyze
  router.post('/analyze', async (req: Request, res: Response) => {
    try {
      const { text } = req.body as AnalyzeRequestBody;

      if (!text || typeof text !== 'string' || text.trim() === '') {
        res.status(400).json(failure('INVALID_INPUT', 'Request body must include a non-empty "text" field'));
        return;
      }

      if (!aiProvider.isAvailable()) {
        res.json(success(FALLBACK_RESPONSE));
        return;
      }

      const prompt = ANALYZE_PROMPT.replace('{TEXT}', text);
      const rawResponse = await aiProvider.complete(prompt);

      // Check for AI error responses
      if (rawResponse.startsWith('[AI')) {
        res.json(success(FALLBACK_RESPONSE));
        return;
      }

      // Parse JSON from the AI response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        res.json(success(FALLBACK_RESPONSE));
        return;
      }

      const parsed = JSON.parse(jsonMatch[0]) as AnalyzeResult;

      const result: AnalyzeResult = {
        documentType: parsed.documentType ?? 'other',
        suggestedSection: parsed.suggestedSection ?? 'skills',
        extractedFields: parsed.extractedFields ?? {},
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      };

      res.json(success(result));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze document';
      res.status(500).json(failure('ANALYZE_ERROR', message));
    }
  });

  return router;
}
