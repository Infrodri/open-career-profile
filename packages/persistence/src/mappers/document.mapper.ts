import { type Document, type Evidence, type DocumentType, type SectionType } from '@ocp/core';

/**
 * Maps a Prisma document (with all relations) to a domain Document.
 */
export function toDomainDocument(prismaDoc: PrismaDocumentFull): Document {
  return {
    id: prismaDoc.id,
    profileId: prismaDoc.profileId,
    fileName: prismaDoc.fileName,
    mimeType: prismaDoc.mimeType,
    sizeBytes: prismaDoc.sizeBytes,
    storagePath: prismaDoc.storagePath,
    documentType: prismaDoc.documentType as DocumentType | undefined,
    extractedText: prismaDoc.extractedText ?? undefined,
    createdAt: prismaDoc.createdAt,
    updatedAt: prismaDoc.updatedAt,
  };
}

/**
 * Maps a Prisma evidence to a domain Evidence.
 */
export function toDomainEvidence(prismaEvidence: PrismaEvidenceFull): Evidence {
  return {
    id: prismaEvidence.id,
    documentId: prismaEvidence.documentId,
    sectionType: prismaEvidence.sectionType as SectionType,
    entryId: prismaEvidence.entryId,
    note: prismaEvidence.note ?? undefined,
    createdAt: prismaEvidence.createdAt,
    updatedAt: prismaEvidence.updatedAt,
  };
}

/**
 * Type representing a Prisma document with all relations included.
 */
export interface PrismaDocumentFull {
  id: string;
  profileId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  documentType: string | null;
  extractedText: string | null;
  createdAt: Date;
  updatedAt: Date;
  evidences: PrismaEvidenceFull[];
}

/**
 * Type representing a Prisma evidence.
 */
export interface PrismaEvidenceFull {
  id: string;
  documentId: string;
  sectionType: string;
  entryId: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Include object for Prisma queries to fetch document with evidences.
 */
export const documentIncludeWithEvidences = {
  evidences: true,
} as const;

/**
 * Include object for Prisma queries to fetch evidences with document.
 */
export const evidenceIncludeWithDocument = {
  document: true,
} as const;
