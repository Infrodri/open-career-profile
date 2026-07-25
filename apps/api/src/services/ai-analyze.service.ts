import { type AiProvider } from '@ocp/ai-adapter';

/**
 * Multi-pass document analysis.
 *
 * Instead of one gigantic prompt that times out or gets cut, we run a series of
 * focused prompts: one for personal info, one per section. Each call is fast
 * (~3-8s) and uses few tokens.
 */

/** Section identifiers the system knows about. */
const SECTION_KEYS = [
  'formacionAcademica',
  'postgrado',
  'experienciaAdministrativa',
  'experienciaDocente',
  'experienciaDesarrollo',
  'certificacionesCiberseguridad',
  'certificacionesSistemasInstitucionales',
  'cursosAdministrativos',
  'cursosProgramacion',
  'cursosEspecialidad',
  'cursosGenerales',
  'reconocimientosExpositor',
  'reconocimientosRepresentacion',
  'reconocimientosLaborales',
  'languages',
  'skills',
] as const;

type SectionKey = (typeof SECTION_KEYS)[number];

const SECTION_PROMPTS: Record<SectionKey, string> = {
  formacionAcademica: `Extrae SOLO la formación académica (bachiller, técnico superior, licenciatura, provisión nacional). 
Cada título boliviano tiene su Provisión Nacional como documento separado: registra AMBOS.
JSON: [{"title":"","institution":"","startDate":"AAAA","endDate":"AAAA","field":"","tipo":"bachiller|tecnico_superior|licenciatura|provision_nacional","detalle":""}]`,

  postgrado: `Extrae SOLO postgrados (diplomados, maestrías, doctorados, especializaciones de postgrado).
JSON: [{"title":"","institution":"","startDate":"AAAA","endDate":"AAAA","detalle":""}]`,

  experienciaAdministrativa: `Extrae SOLO experiencia laboral administrativa/técnica (no docente, no desarrollo de software).
JSON: [{"position":"","institution":"","startDate":"AAAA","endDate":"AAAA","description":"funciones","location":""}]`,

  experienciaDocente: `Extrae SOLO experiencia como docente/profesor.
JSON: [{"position":"","institution":"","startDate":"AAAA","endDate":"AAAA","description":""}]`,

  experienciaDesarrollo: `Extrae SOLO experiencia en desarrollo de software/programación/consultoría tecnológica.
JSON: [{"position":"","institution":"","startDate":"AAAA","endDate":"AAAA","description":"proyectos y funciones"}]`,

  certificacionesCiberseguridad: `Extrae SOLO certificaciones y cursos relacionados con ciberseguridad, seguridad informática, ethical hacking.
JSON: [{"name":"","issuer":"","issueDate":"AAAA","contenido":["tema1","tema2"]}]`,

  certificacionesSistemasInstitucionales: `Extrae SOLO certificaciones de sistemas institucionales (SIREJ, REJAP, Derechos Reales, sistemas de gobierno).
JSON: [{"name":"","issuer":"","issueDate":"AAAA","contenido":[]}]`,

  cursosAdministrativos: `Extrae SOLO cursos/talleres administrativos, normativos, leyes, ética pública, archivística.
JSON: [{"name":"","issuer":"","issueDate":"AAAA","detalle":""}]`,

  cursosProgramacion: `Extrae SOLO cursos de programación, herramientas de desarrollo (VS Code, Power BI, SIGEP, etc).
JSON: [{"name":"","issuer":"","issueDate":"AAAA","contenido":[]}]`,

  cursosEspecialidad: `Extrae SOLO cursos/certificaciones largas de especialidad (Cisco CCNA, Código Facilito, certificaciones con múltiples módulos).
JSON: [{"name":"","issuer":"","issueDate":"AAAA","contenido":["modulo1","modulo2"]}]`,

  cursosGenerales: `Extrae SOLO asistencia a congresos, conferencias, foros, jornadas, talleres educativos generales.
JSON: [{"name":"","issuer":"","issueDate":"AAAA","detalle":""}]`,

  reconocimientosExpositor: `Extrae SOLO reconocimientos como expositor, ponente o experto.
JSON: [{"name":"","issuer":"","issueDate":"AAAA","detalle":""}]`,

  reconocimientosRepresentacion: `Extrae SOLO reconocimientos por representación, organización, delegado, apoyo institucional.
JSON: [{"name":"","issuer":"","issueDate":"AAAA","detalle":""}]`,

  reconocimientosLaborales: `Extrae SOLO memorandos de felicitación, reconocimientos laborales internos.
JSON: [{"name":"","issuer":"","issueDate":"AAAA","detalle":""}]`,

  languages: `Extrae SOLO idiomas que la persona habla/maneja.
JSON: [{"name":"","level":"basic|intermediate|advanced|native"}]`,

  skills: `Extrae SOLO habilidades técnicas, de programación y blandas mencionadas.
JSON: [{"name":"","category":"técnica|herramienta|blanda","level":""}]`,
};

/** First pass: personal info + detect which sections exist. */
const PERSONAL_INFO_PROMPT = `Del siguiente texto, extrae SOLO la información personal de la persona.
Responde JSON:
{
  "fullName":"","profesiones":[],"email":"","phone":"","city":"","country":"",
  "summary":"","birthDate":"","identityDocument":"","nacionalidad":"","sexo":"",
  "estadoCivil":"","libretaMilitar":"","linkedin":"","github":"",
  "sectionsDetected":["lista de secciones que detectas en el documento"]
}

Para sectionsDetected usa estos valores según lo que veas en el texto:
formacionAcademica, postgrado, experienciaAdministrativa, experienciaDocente, experienciaDesarrollo, certificacionesCiberseguridad, certificacionesSistemasInstitucionales, cursosAdministrativos, cursosProgramacion, cursosEspecialidad, cursosGenerales, reconocimientosExpositor, reconocimientosRepresentacion, reconocimientosLaborales, languages, skills

SOLO JSON, nada más.

TEXTO:
---
{TEXT}
---`;

export interface AnalysisProgress {
  step: string;
  total: number;
  current: number;
}

export interface FullAnalysisResult {
  documentType: string;
  personalInfo: Record<string, unknown>;
  sections: Record<string, Array<Record<string, unknown>>>;
  recommendations: string[];
  confidence: number;
}

/**
 * Run the multi-pass analysis.
 * @param text - Full extracted text from the document
 * @param aiProvider - The configured AI adapter
 * @param onProgress - Optional callback for progress updates
 */
export async function analyzeDocumentMultiPass(
  text: string,
  aiProvider: AiProvider,
  onProgress?: (progress: AnalysisProgress) => void,
): Promise<FullAnalysisResult> {
  // Limit to 50K chars per section prompt (plenty for any single section)
  const docText = text.length > 50_000 ? text.slice(0, 50_000) : text;

  // --- Pass 1: Personal info + section detection ---
  onProgress?.({ step: 'Extrayendo información personal...', total: 0, current: 0 });

  const personalPrompt = PERSONAL_INFO_PROMPT.replace('{TEXT}', docText);
  const personalRaw = await aiProvider.complete(personalPrompt);

  let personalInfo: Record<string, unknown> = {};
  let detectedSections: SectionKey[] = [];

  if (!personalRaw.startsWith('[AI')) {
    const json = extractJson(personalRaw);
    if (json) {
      personalInfo = json as Record<string, unknown>;
      const detected = (json as any).sectionsDetected;
      if (Array.isArray(detected)) {
        detectedSections = detected.filter((s: unknown): s is SectionKey =>
          SECTION_KEYS.includes(s as SectionKey),
        );
      }
      delete personalInfo['sectionsDetected'];
    }
  }

  // If section detection failed, try all sections (will just return empty arrays for absent ones)
  if (detectedSections.length === 0) {
    detectedSections = [...SECTION_KEYS];
  }

  // --- Pass 2-N: One prompt per detected section ---
  const sections: Record<string, Array<Record<string, unknown>>> = {};
  const totalSteps = detectedSections.length;
  const errors: string[] = [];

  for (let i = 0; i < detectedSections.length; i++) {
    const sectionKey = detectedSections[i]!;
    const sectionPrompt = SECTION_PROMPTS[sectionKey];

    onProgress?.({
      step: `Analizando: ${sectionKey} (${i + 1}/${totalSteps})`,
      total: totalSteps,
      current: i + 1,
    });

    const prompt = `${sectionPrompt}\n\nTEXTO:\n---\n${docText}\n---`;
    const raw = await aiProvider.complete(prompt);

    if (raw.startsWith('[AI')) {
      errors.push(`${sectionKey}: ${raw}`);
      sections[sectionKey] = [];
      continue;
    }

    const parsed = extractJsonArray(raw);
    sections[sectionKey] = parsed ?? [];
  }

  // Fill any missing section with empty array
  for (const key of SECTION_KEYS) {
    if (!sections[key]) sections[key] = [];
  }

  // Count total entries extracted
  const totalEntries = Object.values(sections).reduce((sum, arr) => sum + arr.length, 0);

  const recommendations: string[] = [];
  if (errors.length > 0) {
    recommendations.push(`La IA no pudo procesar ${errors.length} sección(es). Puedes completarlas manualmente.`);
  }
  if (totalEntries === 0) {
    recommendations.push('No se encontró información estructurada. Verifica que el documento sea legible.');
  }

  // Confidence based on how much data we found
  const confidence = Math.min(
    0.95,
    0.3 + (totalEntries > 0 ? 0.2 : 0) + (Object.keys(personalInfo).filter(k => personalInfo[k]).length / 15) * 0.45,
  );

  return {
    documentType: totalEntries > 10 ? 'hoja_de_vida' : 'certificado',
    personalInfo,
    sections,
    recommendations,
    confidence: Math.round(confidence * 100) / 100,
  };
}

/** Extract the first JSON object from a string. */
function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Extract the first JSON array from a string. */
function extractJsonArray(text: string): Array<Record<string, unknown>> | null {
  // Try array first
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) return parsed as Array<Record<string, unknown>>;
    } catch {
      // fall through
    }
  }
  // Maybe the AI wrapped it in an object
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      const parsed = JSON.parse(objMatch[0]);
      // Look for the first array value in the object
      for (const value of Object.values(parsed)) {
        if (Array.isArray(value)) return value as Array<Record<string, unknown>>;
      }
    } catch {
      // give up
    }
  }
  return null;
}
