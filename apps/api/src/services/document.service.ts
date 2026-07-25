import { randomUUID } from 'node:crypto';
import {
  type Document,
  type DocumentRepository,
  type DocumentStorage,
  type DocumentType,
  type Evidence,
  type EvidenceTarget,
  type SectionType,
} from '@ocp/core';

/** Data needed to store a freshly uploaded file. */
export interface StoreDocumentInput {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  extractedText?: string;
  documentType?: DocumentType;
  /** Optional owner. Documents may be uploaded before a profile exists. */
  profileId?: string;
}

export class DocumentService {
  constructor(
    private readonly repository: DocumentRepository,
    private readonly storage: DocumentStorage,
  ) {}

  /**
   * Write the file to storage and record it in the database.
   *
   * If the database insert fails the stored file is removed, so a failed upload
   * never leaves an orphan file behind.
   */
  async store(input: StoreDocumentInput): Promise<Document> {
    const storagePath = await this.storage.save(input.buffer, input.fileName, input.profileId);

    try {
      const now = new Date();
      return await this.repository.create({
        id: randomUUID(),
        profileId: input.profileId,
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.buffer.byteLength,
        storagePath,
        documentType: input.documentType,
        extractedText: input.extractedText,
        createdAt: now,
        updatedAt: now,
      });
    } catch (err) {
      await this.storage.delete(storagePath).catch(() => {
        // Cleanup is best effort; the original error is what matters.
      });
      throw err;
    }
  }

  findById(id: string): Promise<Document | null> {
    return this.repository.findById(id);
  }

  findByProfileId(profileId: string): Promise<Document[]> {
    return this.repository.findByProfileId(profileId);
  }

  findUnassigned(): Promise<Document[]> {
    return this.repository.findUnassigned();
  }

  /** Attach a previously uploaded document to a profile. */
  assignToProfile(documentId: string, profileId: string): Promise<Document> {
    return this.repository.assignToProfile(documentId, profileId);
  }

  updateDocumentType(documentId: string, documentType?: DocumentType): Promise<Document> {
    return this.repository.updateDocumentType(documentId, documentType);
  }

  /** Delete the document row, its evidence links and the file on disk. */
  delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  /** Link a document to one or more profile entries. */
  linkEvidence(documentId: string, targets: EvidenceTarget[]): Promise<Evidence[]> {
    return this.repository.createEvidence(documentId, targets);
  }

  findEvidenceByDocumentId(documentId: string): Promise<Evidence[]> {
    return this.repository.findEvidenceByDocumentId(documentId);
  }

  findEvidenceByEntry(sectionType: SectionType, entryId: string): Promise<Evidence[]> {
    return this.repository.findEvidenceByEntry(sectionType, entryId);
  }

  findEvidenceByProfileId(profileId: string): Promise<Evidence[]> {
    return this.repository.findEvidenceByProfileId(profileId);
  }

  deleteEvidence(id: string): Promise<void> {
    return this.repository.deleteEvidence(id);
  }

  /** Read the stored file for a document. */
  readFile(storagePath: string): Promise<Buffer> {
    return this.storage.read(storagePath);
  }

  /** Whether the stored file is still present on disk. */
  fileExists(storagePath: string): Promise<boolean> {
    return this.storage.exists(storagePath);
  }
}
