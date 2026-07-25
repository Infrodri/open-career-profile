/**
 * Port for document storage.
 * Implementations (adapters) provide the actual storage mechanism.
 *
 * Storage paths are opaque identifiers returned by `save()`. Callers must not
 * build them by hand, and adapters must accept back exactly what they returned.
 */
export interface DocumentStorage {
  /**
   * Save a document to storage.
   *
   * @param buffer - The document content
   * @param fileName - The original file name, used only to derive a readable suffix
   * @param profileId - Optional owner. When present the adapter may group files by
   *                    profile; when absent the file is stored as unassigned, since a
   *                    document can be uploaded before any profile exists.
   * @returns An opaque storage path to pass to `read`, `delete` or `exists`
   */
  save(buffer: Buffer, fileName: string, profileId?: string): Promise<string>;

  /**
   * Read a document from storage.
   * @throws if the storage path does not exist
   */
  read(storagePath: string): Promise<Buffer>;

  /**
   * Delete a document from storage. Succeeds even if the file is already gone.
   */
  delete(storagePath: string): Promise<void>;

  /**
   * Check whether a document exists in storage.
   */
  exists(storagePath: string): Promise<boolean>;
}
