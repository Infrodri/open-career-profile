import { unwrap } from './http';

export interface AnalyzeFormatResult {
  ruleSet: Record<string, unknown>;
  confidence: number;
  notes: string;
}

export interface AdaptProfileResult {
  adaptedSummary: string;
  adaptedDescriptions: Array<{ section: string; entryId: string; original: string; adapted: string }>;
  missingInfo: string[];
  suggestions: string[];
}

export async function analyzeFormat(text: string): Promise<AnalyzeFormatResult> {
  const res = await fetch('/api/ai/analyze-format', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return unwrap<AnalyzeFormatResult>(res);
}

export async function adaptProfile(profileId: string, ruleSetId: string): Promise<AdaptProfileResult> {
  const res = await fetch('/api/ai/adapt-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, ruleSetId }),
  });
  return unwrap<AdaptProfileResult>(res);
}
