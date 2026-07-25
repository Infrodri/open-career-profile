import type {
  DocumentType,
  Evidence,
  SectionType,
  StoredDocument,
} from '../types/profile';
import { expectNoContent, unwrap } from './http';

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

/** Result of uploading a document: the file is already stored at this point. */
export interface ExtractionResult {
  documentId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  text: string;
  /** false when the document was stored but no text could be read from it. */
  hasText: boolean;
}

/**
 * Upload a document. The file is persisted and its text extracted.
 * `profileId` is optional: documents can be uploaded before a profile exists.
 */
export async function uploadDocument(
  file: File,
  options: { profileId?: string; documentType?: DocumentType } = {},
): Promise<ExtractionResult> {
  const formData = new FormData();
  formData.append('document', file);
  if (options.profileId) formData.append('profileId', options.profileId);
  if (options.documentType) formData.append('documentType', options.documentType);

  const response = await fetch('/api/documents/extract', { method: 'POST', body: formData });
  return unwrap<ExtractionResult>(response);
}

export async function analyzeDocumentText(text: string): Promise<ProfileAnalysis> {
  const response = await fetch('/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return unwrap<ProfileAnalysis>(response);
}

/**
 * Persist reviewed data into a profile.
 * Passing `documentId` links the uploaded document to every entry created here.
 */
export async function importProfile(
  personalInfo: Record<string, string>,
  sections: ProfileAnalysis['sections'],
  options: { profileId?: string; documentId?: string } = {},
): Promise<{ id: string }> {
  const response = await fetch('/api/profiles/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalInfo,
      sections,
      profileId: options.profileId,
      documentId: options.documentId,
    }),
  });
  return unwrap<{ id: string }>(response);
}

export async function listProfileDocuments(profileId: string): Promise<StoredDocument[]> {
  const response = await fetch(`/api/profiles/${profileId}/documents`);
  return unwrap<StoredDocument[]>(response);
}

/** Documents uploaded but not yet imported into any profile. */
export async function listUnassignedDocuments(): Promise<StoredDocument[]> {
  const response = await fetch('/api/documents/unassigned');
  return unwrap<StoredDocument[]>(response);
}

export async function getDocument(
  documentId: string,
): Promise<StoredDocument & { evidence: Evidence[] }> {
  const response = await fetch(`/api/documents/${documentId}`);
  return unwrap<StoredDocument & { evidence: Evidence[] }>(response);
}

export async function listProfileEvidence(profileId: string): Promise<Evidence[]> {
  const response = await fetch(`/api/profiles/${profileId}/evidence`);
  return unwrap<Evidence[]>(response);
}

export async function updateDocumentType(
  documentId: string,
  documentType: DocumentType | null,
): Promise<StoredDocument> {
  const response = await fetch(`/api/documents/${documentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentType }),
  });
  return unwrap<StoredDocument>(response);
}

export async function linkEvidence(
  documentId: string,
  targets: Array<{ sectionType: SectionType; entryId: string; note?: string }>,
): Promise<Evidence[]> {
  const response = await fetch(`/api/documents/${documentId}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targets }),
  });
  return unwrap<Evidence[]>(response);
}

export async function unlinkEvidence(evidenceId: string): Promise<void> {
  const response = await fetch(`/api/evidence/${evidenceId}`, { method: 'DELETE' });
  return expectNoContent(response);
}

export async function deleteDocument(documentId: string): Promise<void> {
  const response = await fetch(`/api/documents/${documentId}`, { method: 'DELETE' });
  return expectNoContent(response);
}

/** URL to preview the original file inline (PDFs and images render in the browser). */
export function documentFileUrl(documentId: string): string {
  return `/api/documents/${documentId}/file`;
}

/** URL that forces a download instead of an inline preview. */
export function documentDownloadUrl(documentId: string): string {
  return `/api/documents/${documentId}/file?download=1`;
}
