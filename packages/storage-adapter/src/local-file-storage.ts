import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type DocumentStorage } from '@ocp/core';
import { v7 as uuidv7 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Local filesystem storage for documents.
 * Files are stored under OCP_STORAGE_PATH (default: ./storage/documents)
 * Organized as {profileId}/{uuid}-{fileName} to avoid collisions.
 */
export class LocalFileStorage implements DocumentStorage {
  private readonly basePath: string;

  constructor(basePath?: string) {
    // Default to ./storage/documents relative to package root
    this.basePath = resolve(basePath ?? join(__dirname, '..', '..', 'storage', 'documents'));
  }

  /**
   * Get the full path for a storage identifier.
   * @param storagePath - The storage path (relative to base path)
   * @returns Absolute filesystem path
   */
  private getPath(storagePath: string): string {
    return join(this.basePath, storagePath);
  }

  /**
   * Generate a unique storage path for a file.
   * @param fileName - Original file name
   * @param profileId - Profile ID for organization
   * @returns Storage path like "profile-uuid/unique-id-original-name.pdf"
   */
  private generateStoragePath(fileName: string, profileId: string): string {
    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueId = uuidv7();
    return join(profileId, `${uniqueId}-${cleanName}`);
  }

  async save(buffer: Buffer, fileName: string): Promise<string> {
    // Extract profileId from filename if present (format: "profile-{id}-{rest}")
    // Otherwise use a placeholder (not ideal but matches current document.routes.ts behavior)
    const profileId = this.extractProfileIdFromFileName(fileName) ?? 'unknown';

    const storagePath = this.generateStoragePath(fileName, profileId);
    const fullPath = this.getPath(storagePath);

    // Ensure directory exists
    await mkdir(dirname(fullPath), { recursive: true });

    // Write file
    await writeFile(fullPath, buffer);

    return storagePath;
  }

  async read(storagePath: string): Promise<Buffer> {
    const fullPath = this.getPath(storagePath);
    return await readFile(fullPath);
  }

  async delete(storagePath: string): Promise<void> {
    const fullPath = this.getPath(storagePath);
    try {
      await rm(fullPath, { recursive: true, force: true });
    } catch (err) {
      // File might not exist, which is OK
      if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
        return;
      }
      throw err;
    }
  }

  async exists(storagePath: string): Promise<boolean> {
    const fullPath = this.getPath(storagePath);
    try {
      await stat(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract profile ID from filename if present.
   * Expected format: "profile-{id}-{rest}" or "{id}-{rest}"
   * @param fileName - The original file name
   * @returns Profile ID if found, undefined otherwise
   */
  private extractProfileIdFromFileName(fileName: string): string | undefined {
    // Try "profile-{id}-{rest}" format first
    const profileMatch = fileName.match(/^profile-([a-f0-9-]+)-/i);
    if (profileMatch) {
      return profileMatch[1];
    }

    // Try "{id}-{rest}" format (UUID prefix)
    const uuidMatch = fileName.match(/^([a-f0-9-]{36})-/i);
    if (uuidMatch) {
      return uuidMatch[1];
    }

    return undefined;
  }
}
