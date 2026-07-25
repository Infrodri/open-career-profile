import { Router, type Request, type Response } from 'express';
import { type AiProvider } from '@ocp/ai-adapter';
import { success, failure } from '../middleware/error-handler.js';

const FULL_PROFILE_PROMPT = `Eres un asistente experto en análisis de documentos profesionales.

Analiza el siguiente texto extraído de un documento (puede ser una hoja de vida completa, un certificado, un título, un contrato, etc.).

Tu tarea:
1. Identificar el tipo de documento
2. Extraer TODA la información profesional que encuentres
3. Organizarla en las secciones correspondientes
4. Detectar qué información importante falta y recomendar qué agregar

Responde ÚNICAMENTE con JSON válido en este formato exacto:

{
  "documentType": "hoja_de_vida | certificado | titulo | contrato | otro",
  "personalInfo": {
    "fullName": "nombre completo si lo encuentras",
    "email": "",
    "phone": "",
    "city": "",
    "country": "",
    "summary": "resumen profesional si existe",
    "birthDate": "",
    "identityDocument": ""
  },
  "sections": {
    "workExperience": [
      {
        "position": "cargo",
        "institution": "empresa u organización",
        "startDate": "AAAA-MM o AAAA",
        "endDate": "AAAA-MM, AAAA o present",
        "description": "descripción de responsabilidades",
        "location": ""
      }
    ],
    "education": [
      {
        "title": "título obtenido",
        "institution": "institución educativa",
        "startDate": "",
        "endDate": "",
        "field": "área de estudio"
      }
    ],
    "certifications": [
      {
        "name": "nombre de la certificación",
        "issuer": "institución emisora",
        "issueDate": "",
        "expirationDate": ""
      }
    ],
    "courses": [
      {
        "name": "nombre del curso",
        "institution": "institución",
        "completionDate": "",
        "duration": "horas o duración"
      }
    ],
    "skills": [
      { "name": "habilidad", "category": "técnica o blanda", "level": "" }
    ],
    "languages": [
      { "name": "idioma", "level": "basic | intermediate | advanced | native" }
    ]
  },
  "recommendations": [
    "Recomendación 1 sobre qué información falta o cómo mejorar",
    "Recomendación 2"
  ],
  "confidence": 0.85
}

REGLAS IMPORTANTES:
- Extrae TODA la información que encuentres, no solo una parte
- Si un campo no está en el documento, déjalo como string vacío ""
- Los arrays vacíos son válidos si no hay información de esa sección
- Las fechas en formato AAAA-MM o AAAA
- Las recomendaciones deben ser específicas y útiles en español
- Responde SOLO el JSON, sin texto adicional antes o después

Texto del documento a analizar:
---
{TEXT}
---`;

interface AnalyzeRequestBody {
  text: string;
}

interface ProfileAnalysisResult {
  documentType: string;
  personalInfo: Record<string, string>;
  sections: Record<string, Array<Record<string, string>>>;
  recommendations: string[];
  confidence: number;
}

const FALLBACK_RESPONSE: ProfileAnalysisResult = {
  documentType: 'otro',
  personalInfo: {},
  sections: {
    workExperience: [],
    education: [],
    certifications: [],
    courses: [],
    skills: [],
    languages: [],
  },
  recommendations: [
    'La IA no está disponible. Puedes completar la información manualmente.',
  ],
  confidence: 0.1,
};

export function createAiRoutes(aiProvider: AiProvider): Router {
  const router = Router();

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

      const prompt = FULL_PROFILE_PROMPT.replace('{TEXT}', text.slice(0, 12000));
      const rawResponse = await aiProvider.complete(prompt);

      // Si la IA devolvió un error, usar fallback
      if (rawResponse.startsWith('[AI')) {
        console.warn('[AI] Provider returned error:', rawResponse);
        res.json(success({ ...FALLBACK_RESPONSE, recommendations: [rawResponse] }));
        return;
      }

      // Extraer JSON de la respuesta
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('[AI] No JSON found in response:', rawResponse.slice(0, 200));
        res.json(success(FALLBACK_RESPONSE));
        return;
      }

      let parsed: Partial<ProfileAnalysisResult>;
      try {
        parsed = JSON.parse(jsonMatch[0]) as Partial<ProfileAnalysisResult>;
      } catch (_parseErr) {
        console.warn('[AI] Failed to parse JSON:', jsonMatch[0].slice(0, 200));
        res.json(success(FALLBACK_RESPONSE));
        return;
      }

      const result: ProfileAnalysisResult = {
        documentType: parsed.documentType ?? 'otro',
        personalInfo: parsed.personalInfo ?? {},
        sections: {
          workExperience: parsed.sections?.['workExperience'] ?? [],
          education: parsed.sections?.['education'] ?? [],
          certifications: parsed.sections?.['certifications'] ?? [],
          courses: parsed.sections?.['courses'] ?? [],
          skills: parsed.sections?.['skills'] ?? [],
          languages: parsed.sections?.['languages'] ?? [],
        },
        recommendations: parsed.recommendations ?? [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      };

      res.json(success(result));
    } catch (err) {
      console.error('[AI Route Error]', err);
      const message = err instanceof Error ? err.message : 'Error al analizar el documento';
      res.status(500).json(failure('ANALYZE_ERROR', message));
    }
  });

  return router;
}
