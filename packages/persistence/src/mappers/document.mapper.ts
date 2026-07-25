import {
  type Document,
  type DocumentType,
  type Evidence,
  type SectionType,
  isDocumentType,
  isSectionType,
} from '@ocp/core';

/**
 * Maps a Prisma document row to a domain Document.
 * Unknown documentType values coming from the database are dropped rather than
 * cast, so the domain type stays honest.
 */
export function toDomainDocument(prismaDoc: PrismaDocumentRow): Document {
  const documentType: DocumentType | undefined = isDocumentType(prismaDoc.documentType)
    ? prismaDoc.documentType
    : undefined;

  return {
    id: prismaDoc.id,
    profileId: prismaDoc.profileId ?? undefined,
    fileName: prismaDoc.fileName,
    mimeType: prismaDoc.mimeType,
    sizeBytes: prismaDoc.sizeBytes,
    storagePath: prismaDoc.storagePath,
    documentType,
    extractedText: prismaDoc.extractedText ?? undefined,
    createdAt: prismaDoc.createdAt,
    updatedAt: prismaDoc.updatedAt,
  };
}

/**
 * Maps a Prisma evidence row to a domain Evidence.
 * @throws if the stored sectionType is not a known section, which would mean the
 *         database holds data the domain cannot represent.
 */
export function toDomainEvidence(prismaEvidence: PrismaEvidenceRow): Evidence {
  if (!isSectionType(prismaEvidence.sectionType)) {
    throw new Error(
      `Evidence ${prismaEvidence.id} has an unknown sectionType: "${prismaEvidence.sectionType}"`,
    );
  }

  const sectionType: SectionType = prismaEvidence.sectionType;

  return {
    id: prismaEvidence.id,
    documentId: prismaEvidence.documentId,
    sectionType,
    entryId: prismaEvidence.entryId,
    note: prismaEvidence.note ?? undefined,
    createdAt: prismaEvidence.createdAt,
    updatedAt: prismaEvidence.updatedAt,
  };
}

/** Shape of a Document row as returned by Prisma. */
export interface PrismaDocumentRow {
  id: string;
  profileId: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  documentType: string | null;
  extractedText: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Shape of an Evidence row as returned by Prisma. */
export interface PrismaEvidenceRow {
  id: string;
  documentId: string;
  sectionType: string;
  entryId: string;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Include clause to fetch a document together with its evidence links. */
export const documentIncludeWithEvidences = {
  evidences: true,
} as const;
