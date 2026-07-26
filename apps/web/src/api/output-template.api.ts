import { unwrap, expectNoContent } from './http';

export interface OutputTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  source: string;
  isBuiltIn: boolean;
  ruleSetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOutputTemplatePayload {
  name: string;
  description?: string;
  category?: string;
  source: string;
  ruleSetId?: string;
}

export async function listOutputTemplates(category?: string): Promise<OutputTemplate[]> {
  const url = category ? `/api/output-templates?category=${category}` : '/api/output-templates';
  const res = await fetch(url);
  return unwrap<OutputTemplate[]>(res);
}

export async function getOutputTemplate(id: string): Promise<OutputTemplate> {
  const res = await fetch(`/api/output-templates/${id}`);
  return unwrap<OutputTemplate>(res);
}

export async function createOutputTemplate(data: CreateOutputTemplatePayload): Promise<OutputTemplate> {
  const res = await fetch('/api/output-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return unwrap<OutputTemplate>(res);
}

export async function updateOutputTemplate(id: string, data: Partial<CreateOutputTemplatePayload>): Promise<OutputTemplate> {
  const res = await fetch(`/api/output-templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return unwrap<OutputTemplate>(res);
}

export async function deleteOutputTemplate(id: string): Promise<void> {
  const res = await fetch(`/api/output-templates/${id}`, { method: 'DELETE' });
  return expectNoContent(res);
}

export async function previewTemplate(source: string): Promise<string> {
  const res = await fetch('/api/output-templates/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error?.message ?? 'Error al generar preview');
  }
  return res.text();
}
