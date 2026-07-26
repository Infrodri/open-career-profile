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
  type PrismaDocumentRow,
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

    // Update contentHash via raw query if the column exists (post-migration)
    if (document.contentHash) {
      try {
        await (this.prisma as any).$executeRawUnsafe(
          `UPDATE "Document" SET "contentHash" = $1 WHERE "id" = $2`,
          document.contentHash,
          document.id,
        );
      } catch {
        // Column may not exist yet — that's fine, fileName+size dedup still works
      }
    }

    return toDomainDocument(result as unknown as PrismaDocumentRow);
  }

  async findById(id: string): Promise<Document | null> {
    const result = await this.prisma.document.findUnique({
      where: { id },
      include: documentIncludeWithEvidences,
    });

    return result ? toDomainDocument(result as unknown as PrismaDocumentRow) : null;
  }

  async findByContentHash(contentHash: string, profileId?: string): Promise<Document | null> {
    // Use raw query because the Prisma client may not have contentHash in its
    // generated types yet (requires prisma generate after adding the column).
    // If the column doesn't exist (migration not applied), this safely returns null.
    try {
      let results: unknown[];
      if (profileId) {
        results = await (this.prisma as any).$queryRawUnsafe(
          `SELECT * FROM "Document" WHERE "contentHash" = $1 AND "profileId" = $2 LIMIT 1`,
          contentHash,
          profileId,
        );
      } else {
        results = await (this.prisma as any).$queryRawUnsafe(
          `SELECT * FROM "Document" WHERE "contentHash" = $1 LIMIT 1`,
          contentHash,
        );
      }
      if (Array.isArray(results) && results.length > 0) {
        return toDomainDocument(results[0] as PrismaDocumentRow);
      }
      return null;
    } catch {
      // Column doesn't exist yet or other DB error — skip hash check gracefully
      return null;
    }
  }

  async findByFileNameAndSize(fileName: string, sizeBytes: number, profileId?: string): Promise<Document | null> {
    const where: Record<string, unknown> = { fileName, sizeBytes };
    if (profileId) where['profileId'] = profileId;

    const result = await this.prisma.document.findFirst({
      where,
      include: documentIncludeWithEvidences,
    });

    return result ? toDomainDocument(result as unknown as PrismaDocumentRow) : null;
  }

  async findByProfileId(profileId: string): Promise<Document[]> {
    const results = await this.prisma.document.findMany({
      where: { profileId },
      include: documentIncludeWithEvidences,
      orderBy: { createdAt: 'desc' },
    });

    return results.map((r) => toDomainDocument(r as unknown as PrismaDocumentRow));
  }

  async findUnassigned(): Promise<Document[]> {
    const results = await this.prisma.document.findMany({
      where: { profileId: null },
      include: documentIncludeWithEvidences,
      orderBy: { createdAt: 'desc' },
    });

    return results.map((r) => toDomainDocument(r as unknown as PrismaDocumentRow));
  }

  async assignToProfile(documentId: string, profileId: string): Promise<Document> {
    const result = await this.prisma.document.update({
      where: { id: documentId },
      data: { profileId },
      include: documentIncludeWithEvidences,
    });

    return toDomainDocument(result as unknown as PrismaDocumentRow);
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

    return toDomainDocument(result as unknown as PrismaDocumentRow);
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
