import { type ProfessionalProfile } from '../entities/professional-profile.js';
import { type Document, type Evidence } from '../entities/document.js';

/**
 * Port for profile persistence.
 * Implementations (adapters) will provide the actual storage mechanism.
 */
export interface ProfileRepository {
  create(profile: ProfessionalProfile): Promise<ProfessionalProfile>;
  findById(id: string): Promise<ProfessionalProfile | null>;
  update(profile: ProfessionalProfile): Promise<ProfessionalProfile>;
  delete(id: string): Promise<void>;
}

/**
 * Port for document persistence.
 * Implementations (adapters) will provide the actual storage mechanism.
 */
export interface DocumentRepository {
  /**
   * Create a new document.
   */
  create(document: Document): Promise<Document>;

  /**
   * Find a document by ID.
   */
  findById(id: string): Promise<Document | null>;

  /**
   * Find all documents for a profile.
   */
  findByProfileId(profileId: string): Promise<Document[]>;

  /**
   * Delete a document.
   */
  delete(id: string): Promise<void>;

  /**
   * Create a new evidence linking a document to a profile entry.
   */
  createEvidence(evidence: Evidence): Promise<Evidence>;

  /**
   * Find all evidences for a document.
   */
  findByDocumentId(documentId: string): Promise<Evidence[]>;

  /**
   * Find all evidences for a profile entry.
   */
  findByEntry(sectionType: string, entryId: string): Promise<Evidence[]>;

  /**
   * Delete an evidence.
   */
  deleteEvidence(id: string): Promise<void>;
}
