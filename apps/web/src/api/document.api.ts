export interface ProfileAnalysis {
  documentType: string;
  personalInfo: Record<string, string>;
  sections: {
    workExperience: Array<Record<string, string>>;
    education: Array<Record<string, string>>;
    certifications: Array<Record<string, string>>;
    courses: Array<Record<string, string>>;
    skills: Array<Record<string, string>>;
    languages: Array<Record<string, string>>;
  };
  recommendations: string[];
  confidence: number;
}

export async function extractTextFromDocument(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('document', file);
  const res = await fetch('/api/documents/extract', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message ?? 'Error al extraer texto del documento');
  }
  const json = await res.json();
  return json.data.text;
}

export async function analyzeDocumentText(text: string): Promise<ProfileAnalysis> {
  const res = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message ?? 'Error al analizar el documento');
  }
  const json = await res.json();
  return json.data;
}

export async function importProfile(
  personalInfo: Record<string, string>,
  sections: ProfileAnalysis['sections'],
  profileId?: string,
): Promise<{ id: string }> {
  const res = await fetch('/api/profiles/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personalInfo, sections, profileId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message ?? 'Error al guardar el perfil');
  }
  const json = await res.json();
  return json.data;
}
