export interface DocumentAnalysis {
  documentType: string;
  suggestedSection: string;
  extractedFields: Record<string, string>;
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
    throw new Error('Error al extraer texto del documento');
  }
  const json = await res.json();
  return json.data.text;
}

export async function analyzeDocumentText(text: string): Promise<DocumentAnalysis> {
  const res = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error('Error al analizar el documento');
  }
  const json = await res.json();
  return json.data;
}
