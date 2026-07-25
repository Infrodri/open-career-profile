import { PrismaClient } from '@prisma/client';
import { type Document, type Evidence } from '@ocp/core';
import { type DocumentRepository, type DocumentStorage } from '@ocp/core';
import { toDomainDocument, toDomainEvidence, documentIncludeWithEvidences } from './mappers/document.mapper.js';

export class PrismaDocumentRepository implements DocumentRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly storage: DocumentStorage,
  ) {}

  async create(document: Document): Promise<Document> {
    const result = await this.prisma.document.create({
      data: {
        id: document.id,
        profileId: document.profileId,
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

    if (!result) return null;
    return toDomainDocument(result);
  }

  async findByProfileId(profileId: string): Promise<Document[]> {
    const results = await this.prisma.document.findMany({
      where: { profileId },
      include: documentIncludeWithEvidences,
    });

    return results.map(toDomainDocument);
  }

  async delete(id: string): Promise<void> {
    // Find document first to get storage path
    const document = await this.prisma.document.findUnique({
      where: { id },
      select: { storagePath: true },
    });

    if (document) {
      // Delete from storage
      await this.storage.delete(document.storagePath);
    }

    // Delete from DB
    await this.prisma.document.delete({ where: { id } });
  }

  async createEvidence(evidence: Evidence): Promise<Evidence> {
    const result = await this.prisma.evidence.create({
      data: {
        id: evidence.id,
        documentId: evidence.documentId,
        sectionType: evidence.sectionType,
        entryId: evidence.entryId,
        note: evidence.note ?? null,
      },
    });

    return toDomainEvidence(result);
  }

  async findByDocumentId(documentId: string): Promise<Evidence[]> {
    const results = await this.prisma.evidence.findMany({
      where: { documentId },
    });

    return results.map(toDomainEvidence);
  }

  async findByEntry(sectionType: string, entryId: string): Promise<Evidence[]> {
    const results = await this.prisma.evidence.findMany({
      where: { sectionType, entryId },
    });

    return results.map(toDomainEvidence);
  }

  async deleteEvidence(id: string): Promise<void> {
    await this.prisma.evidence.delete({ where: { id } });
  }
}
