import { type Document, type Evidence } from '@ocp/core';
import { type DocumentRepository, type DocumentStorage } from '@ocp/core';

export class DocumentService {
  constructor(
    private readonly repository: DocumentRepository,
    private readonly storage: DocumentStorage,
  ) {}

  /**
   * Create a new document record (file must be stored first via storage).
   */
  async create(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const now = new Date();
    const doc: Document = {
      ...document,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    return this.repository.create(doc);
  }

  /**
   * Find a document by ID.
   */
  async findById(id: string): Promise<Document | null> {
    return this.repository.findById(id);
  }

  /**
   * Find all documents for a profile.
   */
  async findByProfileId(profileId: string): Promise<Document[]> {
    return this.repository.findByProfileId(profileId);
  }

  /**
   * Delete a document and its file from storage.
   */
  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  /**
   * Create evidence linking a document to a profile entry.
   */
  async createEvidence(
    documentId: string,
    sectionType: string,
    entryId: string,
    note?: string,
  ): Promise<Evidence> {
    const evidence: Evidence = {
      id: crypto.randomUUID(),
      documentId,
      sectionType: sectionType as any,
      entryId,
      note: note ?? undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.repository.createEvidence(evidence);
  }

  /**
   * Find all evidences for a document.
   */
  async findByDocumentId(documentId: string): Promise<Evidence[]> {
    return this.repository.findByDocumentId(documentId);
  }

  /**
   * Find all evidences for a profile entry.
   */
  async findByEntry(sectionType: string, entryId: string): Promise<Evidence[]> {
    return this.repository.findByEntry(sectionType, entryId);
  }

  /**
   * Delete an evidence.
   */
  async deleteEvidence(id: string): Promise<void> {
    return this.repository.deleteEvidence(id);
  }

  /**
   * Save a file to storage.
   */
  async saveFile(buffer: Buffer, fileName: string): Promise<string> {
    return this.storage.save(buffer, fileName);
  }

  /**
   * Read a file from storage.
   */
  async readFile(storagePath: string): Promise<Buffer> {
    return this.storage.read(storagePath);
  }

  /**
   * Delete a file from storage.
   */
  async deleteFile(storagePath: string): Promise<void> {
    return this.storage.delete(storagePath);
  }

  /**
   * Check if a file exists in storage.
   */
  async fileExists(storagePath: string): Promise<boolean> {
    return this.storage.exists(storagePath);
  }
}
