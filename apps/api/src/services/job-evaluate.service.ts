import { type AiProvider } from '@ocp/ai-adapter';
import { type ProfessionalProfile, PROFILE_SECTION_KEYS } from '@ocp/core';

/** Result of AI evaluation of a job listing against a user profile. */
export interface JobEvaluationResult {
  score: number; // 1.0 - 5.0
  matchSummary: string;
  skillGaps: string[];
  recommendation: 'apply' | 'maybe' | 'skip';
}

/** Fallback when AI is unavailable. */
const FALLBACK_RESULT: JobEvaluationResult = {
  score: 0,
  matchSummary: 'La IA no está disponible. No se puede evaluar automáticamente.',
  skillGaps: [],
  recommendation: 'maybe',
};

/**
 * Evaluate a job listing against a user profile using AI.
 *
 * The AI receives a structured prompt with the job description and a summary
 * of the user's profile, and returns a score, match analysis, and skill gaps.
 *
 * This function degrades gracefully: if AI is unavailable, returns a neutral result.
 */
export async function evaluateJobListing(
  jobTitle: string,
  jobDescription: string,
  profile: ProfessionalProfile,
  aiProvider: AiProvider,
): Promise<JobEvaluationResult> {
  if (!aiProvider.isAvailable()) {
    return FALLBACK_RESULT;
  }

  const profileSummary = buildProfileSummary(profile);
  const prompt = buildEvaluationPrompt(jobTitle, jobDescription, profileSummary);

  const raw = await aiProvider.complete(prompt);

  if (raw.startsWith('[AI')) {
    return FALLBACK_RESULT;
  }

  return parseEvaluationResponse(raw);
}

/** Build a compact text summary of the profile for the AI prompt. */
function buildProfileSummary(profile: ProfessionalProfile): string {
  const lines: string[] = [];

  lines.push(`Nombre: ${profile.personalInfo.fullName}`);
  if (profile.personalInfo.profesiones.length > 0) {
    lines.push(`Profesiones: ${profile.personalInfo.profesiones.join(', ')}`);
  }
  if (profile.personalInfo.summary) {
    lines.push(`Resumen: ${profile.personalInfo.summary}`);
  }

  for (const key of PROFILE_SECTION_KEYS) {
    const entries = profile.sections[key];
    if (entries.length === 0) continue;

    const sectionName = key.replace(/([A-Z])/g, ' $1').trim();
    const items = entries.slice(0, 5).map((entry) => {
      const e = entry as unknown as Record<string, unknown>;
      const label = e['title'] ?? e['position'] ?? e['name'] ?? '';
      const org = e['institution'] ?? e['issuer'] ?? '';
      const verified = e['verified'] ? ' ✓' : '';
      return `  - ${label}${org ? ` (${org})` : ''}${verified}`;
    });
    lines.push(`\n${sectionName} (${entries.length}):`);
    lines.push(...items);
    if (entries.length > 5) {
      lines.push(`  ... y ${entries.length - 5} más`);
    }
  }

  return lines.join('\n');
}

function buildEvaluationPrompt(jobTitle: string, jobDescription: string, profileSummary: string): string {
  return `Eres un evaluador de ofertas de empleo. Compara la siguiente oferta con el perfil del candidato.

OFERTA:
Título: ${jobTitle}
Descripción:
${jobDescription.slice(0, 3000)}

PERFIL DEL CANDIDATO:
${profileSummary}

Evalúa el match y responde SOLO con un JSON válido (sin texto adicional):
{
  "score": <número del 1 al 5 donde 5 es match perfecto>,
  "matchSummary": "<resumen de 2-3 líneas explicando el match>",
  "skillGaps": ["<habilidad que pide la oferta y el candidato NO tiene>", ...],
  "recommendation": "<'apply' si score>=4, 'maybe' si score>=2.5, 'skip' si score<2.5>"
}

Reglas:
- Score 5: cumple todos los requisitos
- Score 4: cumple la mayoría, gaps menores
- Score 3: cumple algunos, gaps moderados
- Score 2: cumple pocos requisitos
- Score 1: no hay match
- skillGaps: solo listar lo que PIDE la oferta y NO tiene el candidato
- matchSummary en español

SOLO JSON, nada más.`;
}

function parseEvaluationResponse(raw: string): JobEvaluationResult {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return FALLBACK_RESULT;
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    const score = typeof parsed['score'] === 'number'
      ? Math.max(1, Math.min(5, parsed['score']))
      : 0;

    const matchSummary = typeof parsed['matchSummary'] === 'string'
      ? parsed['matchSummary']
      : '';

    const skillGaps = Array.isArray(parsed['skillGaps'])
      ? (parsed['skillGaps'] as unknown[]).filter((g): g is string => typeof g === 'string')
      : [];

    const rec = parsed['recommendation'];
    const recommendation: 'apply' | 'maybe' | 'skip' =
      rec === 'apply' || rec === 'maybe' || rec === 'skip'
        ? rec
        : score >= 4 ? 'apply' : score >= 2.5 ? 'maybe' : 'skip';

    return { score, matchSummary, skillGaps, recommendation };
  } catch {
    return FALLBACK_RESULT;
  }
}
