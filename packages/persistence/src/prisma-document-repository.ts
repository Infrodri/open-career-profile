import { type PrismaClient } from '@prisma/client';
import {
  type Document,
  type DocumentRepository,
  type DocumentStorage,
  type Evidence,
  type EvidenceTarget,
  type SectionType,
} from '@ocp/core';
import {
  toDomainDocument,
  toDomainEvidence,
  documentIncludeWithEvidences,
} from './mappers/document.mapper.js';

export class PrismaDocumentRepository implements DocumentRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: DocumentStorage,
  ) {}

  async create(document: Document): Promise<Document> {
    const result = await this.prisma.document.create({
      data: {
        id: document.id,
        profileId: document.profileId ?? null,
        fileName: document.fileName,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        storagePath: document.storagePath,
        documentType: document.documentType ?? null,
        extractedText: document.extractedText ?? null,
      },
      include: documentIncludeWithEvidences,
    });

    return toDomainDocument(result);
  }

  async findById(id: string): Promise<Document | null> {
    const result = await this.prisma.document.findUnique({
      where: { id },
      include: documentIncludeWithEvidences,
    });

    return result ? toDomainDocument(result) : null;
  }

  async findByProfileId(profileId: string): Promise<Document[]> {
    const results = await this.prisma.document.findMany({
      where: { profileId },
      include: documentIncludeWithEvidences,
      orderBy: { createdAt: 'desc' },
    });

    return results.map(toDomainDocument);
  }

  async findUnassigned(): Promise<Document[]> {
    const results = await this.prisma.document.findMany({
      where: { profileId: null },
      include: documentIncludeWithEvidences,
      orderBy: { createdAt: 'desc' },
    });

    return results.map(toDomainDocument);
  }

  async assignToProfile(documentId: string, profileId: string): Promise<Document> {
    const result = await this.prisma.document.update({
      where: { id: documentId },
      data: { profileId },
      include: documentIncludeWithEvidences,
    });

    return toDomainDocument(result);
  }

  async updateDocumentType(
    documentId: string,
    documentType: Document['documentType'],
  ): Promise<Document> {
    const result = await this.prisma.document.update({
      where: { id: documentId },
      data: { documentType: documentType ?? null },
      include: documentIncludeWithEvidences,
    });

    return toDomainDocument(result);
  }

  async delete(id: string): Promise<void> {
    const document = await this.prisma.document.findUnique({
      where: { id },
      select: { storagePath: true },
    });

    if (!document) return;

    // Remove the DB row first: if the row is gone the file is unreachable anyway,
    // whereas deleting the file first could leave a row pointing at nothing.
    // Evidence rows cascade via the schema.
    await this.prisma.document.delete({ where: { id } });
    await this.storage.delete(document.storagePath);
  }

  async createEvidence(documentId: string, targets: EvidenceTarget[]): Promise<Evidence[]> {
    if (targets.length === 0) return [];

    // skipDuplicates relies on the @@unique([documentId, sectionType, entryId])
    // constraint, so re-linking the same entry is idempotent.
    await this.prisma.evidence.createMany({
      data: targets.map((target) => ({
        documentId,
        sectionType: target.sectionType,
        entryId: target.entryId,
        note: target.note ?? null,
      })),
      skipDuplicates: true,
    });

    const results = await this.prisma.evidence.findMany({
      where: {
        documentId,
        OR: targets.map((target) => ({
          sectionType: target.sectionType,
          entryId: target.entryId,
        })),
      },
    });

    return results.map(toDomainEvidence);
  }

  async findEvidenceByDocumentId(documentId: string): Promise<Evidence[]> {
    const results = await this.prisma.evidence.findMany({ where: { documentId } });
    return results.map(toDomainEvidence);
  }

  async findEvidenceByEntry(sectionType: SectionType, entryId: string): Promise<Evidence[]> {
    const results = await this.prisma.evidence.findMany({ where: { sectionType, entryId } });
    return results.map(toDomainEvidence);
  }

  async findEvidenceByProfileId(profileId: string): Promise<Evidence[]> {
    const results = await this.prisma.evidence.findMany({
      where: { document: { profileId } },
    });

    return results.map(toDomainEvidence);
  }

  async deleteEvidence(id: string): Promise<void> {
    await this.prisma.evidence.delete({ where: { id } });
  }
}
