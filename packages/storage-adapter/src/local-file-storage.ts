import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { type DocumentStorage } from '@ocp/core';

/** Directory used when a document has no owning profile yet. */
const UNASSIGNED_DIR = 'unassigned';

/**
 * Turn an arbitrary file name into a safe, readable suffix.
 * Strips directories and anything that is not alphanumeric, dot, dash or underscore.
 */
function sanitizeFileName(fileName: string): string {
  const baseName = fileName.split(/[\\/]/).pop() ?? 'file';
  const cleaned = baseName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '');
  return cleaned.length > 0 ? cleaned.slice(0, 120) : 'file';
}

/**
 * Local filesystem storage for documents.
 *
 * Files live under `basePath` (default: ./storage/documents relative to the
 * process working directory, overridable via OCP_STORAGE_PATH by the caller).
 *
 * Layout: `{profileId | unassigned}/{uuid}-{safeFileName}`
 *
 * Storage paths always use forward slashes so a database row stays valid if the
 * data is moved between operating systems.
 */
export class LocalFileStorage implements DocumentStorage {
  private readonly basePath: string;

  constructor(basePath = './storage/documents') {
    this.basePath = resolve(basePath);
  }

  /** Absolute base directory, exposed for diagnostics and tests. */
  getBasePath(): string {
    return this.basePath;
  }

  /**
   * Resolve a storage path to an absolute filesystem path, rejecting anything
   * that would escape the base directory (defense against path traversal).
   */
  private resolveInsideBase(storagePath: string): string {
    if (isAbsolute(storagePath)) {
      throw new Error('Invalid storage path: absolute paths are not allowed');
    }

    // Normalize the separators we produce in save() back to the OS convention.
    const normalized = storagePath.split('/').join(sep);
    const fullPath = resolve(this.basePath, normalized);
    const rel = relative(this.basePath, fullPath);

    if (rel.startsWith('..') || isAbsolute(rel)) {
      throw new Error('Invalid storage path: escapes the storage directory');
    }

    return fullPath;
  }

  async save(buffer: Buffer, fileName: string, profileId?: string): Promise<string> {
    const folder = profileId && profileId.trim() !== '' ? profileId : UNASSIGNED_DIR;
    // Storage paths are always '/'-separated, independent of the host OS.
    const storagePath = `${sanitizeFileName(folder)}/${randomUUID()}-${sanitizeFileName(fileName)}`;
    const fullPath = this.resolveInsideBase(storagePath);

    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);

    return storagePath;
  }

  async read(storagePath: string): Promise<Buffer> {
    return readFile(this.resolveInsideBase(storagePath));
  }

  async delete(storagePath: string): Promise<void> {
    // force: true makes this a no-op when the file is already gone.
    await rm(this.resolveInsideBase(storagePath), { force: true });
  }

  async exists(storagePath: string): Promise<boolean> {
    try {
      const stats = await stat(this.resolveInsideBase(storagePath));
      return stats.isFile();
    } catch {
      return false;
    }
  }
}

/** Exported for tests and diagnostics. */
export { UNASSIGNED_DIR, sanitizeFileName };
