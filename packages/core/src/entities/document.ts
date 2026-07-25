import { type BaseEntity } from '../value-objects/index.js';

/**
 * Document entity representing an uploaded file.
 * A document can be linked to multiple profile entries via Evidence.
 */
export interface Document extends BaseEntity {
  /**
   * Optional: a document can exist before any profile does.
   * It is linked to a profile when its extracted data is imported.
   */
  profileId?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  documentType?: DocumentType;
  extractedText?: string;
}

/**
 * Evidence entity linking a document to a specific profile entry.
 */
export interface Evidence extends BaseEntity {
  documentId: string;
  sectionType: SectionType;
  entryId: string;
  note?: string;
}

/**
 * Types of documents that can be stored.
 */
export const DOCUMENT_TYPES = ['certificado', 'titulo', 'contrato', 'hoja_de_vida', 'otro'] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

/**
 * Section types where evidence can be linked.
 */
export const SECTION_TYPES = [
  'workExperience',
  'education',
  'certifications',
  'courses',
  'skills',
  'languages',
  'projects',
  'publications',
  'awards',
  'affiliations',
  'volunteering',
  'references',
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

/** Type guard for SectionType, so callers never need to cast. */
export function isSectionType(value: unknown): value is SectionType {
  return typeof value === 'string' && (SECTION_TYPES as readonly string[]).includes(value);
}

/** Type guard for DocumentType. */
export function isDocumentType(value: unknown): value is DocumentType {
  return typeof value === 'string' && (DOCUMENT_TYPES as readonly string[]).includes(value);
}
