import { randomUUID, createHash } from 'node:crypto';
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

/** Returned when a duplicate is detected instead of creating a new document. */
export interface DuplicateDocumentResult {
  duplicate: true;
  existingDocument: Document;
}

/** Helper to check if a store result is a duplicate. */
export function isDuplicate(result: Document | DuplicateDocumentResult): result is DuplicateDocumentResult {
  return 'duplicate' in result && result.duplicate === true;
}

export class DocumentService {
  constructor(
    private readonly repository: DocumentRepository,
    private readonly storage: DocumentStorage,
  ) {}

  /**
   * Write the file to storage and record it in the database.
   *
   * Deduplication: calculates SHA-256 of the file content. If a document with
   * the same hash already exists (for the same profile or globally), returns
   * the existing document as a DuplicateDocumentResult instead of creating a copy.
   *
   * If the database insert fails the stored file is removed, so a failed upload
   * never leaves an orphan file behind.
   */
  async store(input: StoreDocumentInput): Promise<Document | DuplicateDocumentResult> {
    // Calculate content hash for deduplication
    const contentHash = createHash('sha256').update(input.buffer).digest('hex');

    // Check if this exact file already exists
    const existing = await this.repository.findByContentHash(contentHash, input.profileId);
    if (existing) {
      return { duplicate: true, existingDocument: existing };
    }

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
        contentHash,
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
