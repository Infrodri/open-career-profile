import { unwrap } from './http';

export interface FillFormResult {
  filledForm: string;
  notes: string;
}

export async function fillForm(profileId: string, formText: string): Promise<FillFormResult> {
  const res = await fetch('/api/ai/fill-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, formText }),
  });
  return unwrap<FillFormResult>(res);
}
