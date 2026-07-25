/**
 * Port for document storage.
 * Implementations (adapters) will provide the actual storage mechanism.
 */
export interface DocumentStorage {
  /**
   * Save a document buffer to storage.
   * @param buffer - The document content as Buffer
   * @param fileName - The original file name
   * @returns The storage path (relative identifier) where the file was saved
   */
  save(buffer: Buffer, fileName: string): Promise<string>;

  /**
   * Read a document from storage.
   * @param storagePath - The storage path returned by save()
   * @returns The document content as Buffer
   */
  read(storagePath: string): Promise<Buffer>;

  /**
   * Delete a document from storage.
   * @param storagePath - The storage path to delete
   */
  delete(storagePath: string): Promise<void>;

  /**
   * Check if a document exists in storage.
   * @param storagePath - The storage path to check
   * @returns true if the document exists, false otherwise
   */
  exists(storagePath: string): Promise<boolean>;
}
