import { type Document, type Evidence, type SectionType } from '../entities/document.js';

/** A profile entry that a document should be linked to. */
export interface EvidenceTarget {
  sectionType: SectionType;
  entryId: string;
  note?: string;
}

/**
 * Port for document and evidence persistence.
 * Implementations (adapters) provide the actual storage mechanism.
 */
export interface DocumentRepository {
  /** Persist a new document record. */
  create(document: Document): Promise<Document>;

  /** Find a document by its id. */
  findById(id: string): Promise<Document | null>;

  /** Find a document by content hash (for deduplication). */
  findByContentHash(contentHash: string, profileId?: string): Promise<Document | null>;

  /** List every document belonging to a profile. */
  findByProfileId(profileId: string): Promise<Document[]>;

  /** List documents not yet linked to any profile. */
  findUnassigned(): Promise<Document[]>;

  /**
   * Attach a document to a profile. Used when a document uploaded before the
   * profile existed gets imported into one.
   */
  assignToProfile(documentId: string, profileId: string): Promise<Document>;

  /** Set or clear the document type. */
  updateDocumentType(documentId: string, documentType: Document['documentType']): Promise<Document>;

  /** Delete a document, its evidence links and its stored file. */
  delete(id: string): Promise<void>;

  /**
   * Link a document to one or more profile entries as supporting evidence.
   * Re-linking the same document to the same entry is a no-op.
   */
  createEvidence(documentId: string, targets: EvidenceTarget[]): Promise<Evidence[]>;

  /** List every evidence link of a document. */
  findEvidenceByDocumentId(documentId: string): Promise<Evidence[]>;

  /** List every evidence link pointing at a specific profile entry. */
  findEvidenceByEntry(sectionType: SectionType, entryId: string): Promise<Evidence[]>;

  /** List every evidence link for all documents of a profile. */
  findEvidenceByProfileId(profileId: string): Promise<Evidence[]>;

  /** Remove a single evidence link. The document itself is kept. */
  deleteEvidence(id: string): Promise<void>;
}
