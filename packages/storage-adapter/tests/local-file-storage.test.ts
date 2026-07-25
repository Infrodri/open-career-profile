import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, readFile, rm, stat, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { LocalFileStorage, UNASSIGNED_DIR, sanitizeFileName } from '../src/local-file-storage.js';

describe('LocalFileStorage', () => {
  let basePath: string;
  let storage: LocalFileStorage;

  beforeEach(async () => {
    basePath = await mkdtemp(join(tmpdir(), 'ocp-storage-test-'));
    storage = new LocalFileStorage(basePath);
  });

  afterEach(async () => {
    await rm(basePath, { recursive: true, force: true });
  });

  describe('save', () => {
    it('writes the file and returns a storage path', async () => {
      const content = Buffer.from('contenido del certificado');

      const storagePath = await storage.save(content, 'certificado.pdf');

      expect(storagePath).toBeTruthy();
      await expect(readFile(resolve(basePath, storagePath))).resolves.toEqual(content);
    });

    it('groups the file under the profile id when provided', async () => {
      const profileId = '11111111-2222-3333-4444-555555555555';

      const storagePath = await storage.save(Buffer.from('x'), 'titulo.pdf', profileId);

      expect(storagePath.startsWith(`${profileId}/`)).toBe(true);
    });

    it('stores documents without a profile under the unassigned folder', async () => {
      const storagePath = await storage.save(Buffer.from('x'), 'suelto.pdf');

      expect(storagePath.startsWith(`${UNASSIGNED_DIR}/`)).toBe(true);
    });

    it('always uses forward slashes so paths stay portable across systems', async () => {
      const storagePath = await storage.save(Buffer.from('x'), 'doc.pdf', 'perfil-1');

      expect(storagePath).not.toContain('\\');
      expect(storagePath.split('/')).toHaveLength(2);
    });

    it('keeps the original name readable while making it unique', async () => {
      const storagePath = await storage.save(Buffer.from('x'), 'Mi Certificado (final).pdf');

      expect(storagePath).toContain('Mi_Certificado__final_.pdf');
    });

    it('never collides when the same file is saved twice', async () => {
      const first = await storage.save(Buffer.from('uno'), 'igual.pdf', 'p1');
      const second = await storage.save(Buffer.from('dos'), 'igual.pdf', 'p1');

      expect(first).not.toBe(second);
      await expect(storage.read(first)).resolves.toEqual(Buffer.from('uno'));
      await expect(storage.read(second)).resolves.toEqual(Buffer.from('dos'));
    });

    it('strips directory components from the incoming file name', async () => {
      const storagePath = await storage.save(Buffer.from('x'), '../../etc/passwd');

      // The name is flattened, so nothing escapes the base directory.
      expect(storagePath.startsWith(`${UNASSIGNED_DIR}/`)).toBe(true);
      expect(storagePath).not.toContain('..');
      const fullPath = resolve(basePath, storagePath);
      expect(fullPath.startsWith(basePath)).toBe(true);
    });
  });

  describe('read', () => {
    it('returns the stored content', async () => {
      const content = Buffer.from([0x25, 0x50, 0x44, 0x46]);
      const storagePath = await storage.save(content, 'binario.pdf');

      await expect(storage.read(storagePath)).resolves.toEqual(content);
    });

    it('rejects when the file does not exist', async () => {
      await expect(storage.read('perfil/no-existe.pdf')).rejects.toThrow();
    });
  });

  describe('exists', () => {
    it('returns true for a stored file', async () => {
      const storagePath = await storage.save(Buffer.from('x'), 'presente.pdf');

      await expect(storage.exists(storagePath)).resolves.toBe(true);
    });

    it('returns false for a missing file', async () => {
      await expect(storage.exists('perfil/ausente.pdf')).resolves.toBe(false);
    });

    it('returns false for a directory', async () => {
      await mkdir(join(basePath, 'una-carpeta'), { recursive: true });

      await expect(storage.exists('una-carpeta')).resolves.toBe(false);
    });
  });

  describe('delete', () => {
    it('removes the file from disk', async () => {
      const storagePath = await storage.save(Buffer.from('x'), 'borrable.pdf');
      const fullPath = resolve(basePath, storagePath);
      await expect(stat(fullPath)).resolves.toBeDefined();

      await storage.delete(storagePath);

      await expect(storage.exists(storagePath)).resolves.toBe(false);
      await expect(stat(fullPath)).rejects.toThrow();
    });

    it('is a no-op when the file is already gone', async () => {
      const storagePath = await storage.save(Buffer.from('x'), 'doble.pdf');
      await storage.delete(storagePath);

      await expect(storage.delete(storagePath)).resolves.toBeUndefined();
    });

    it('leaves other files untouched', async () => {
      const keep = await storage.save(Buffer.from('quedo'), 'a.pdf', 'p1');
      const drop = await storage.save(Buffer.from('me voy'), 'b.pdf', 'p1');

      await storage.delete(drop);

      await expect(storage.exists(keep)).resolves.toBe(true);
    });
  });

  describe('path traversal protection', () => {
    it('rejects storage paths that escape the base directory', async () => {
      // Simulate a tampered database row.
      await expect(storage.read('../secret.txt')).rejects.toThrow(/escapes the storage directory/);
      await expect(storage.delete('../secret.txt')).rejects.toThrow(
        /escapes the storage directory/,
      );
      await expect(storage.exists('../secret.txt')).resolves.toBe(false);
    });

    it('rejects absolute storage paths', async () => {
      const absolute = resolve(basePath, 'absoluto.txt');
      await writeFile(absolute, 'x');

      await expect(storage.read(absolute)).rejects.toThrow(/absolute paths are not allowed/);
    });

    it('does not delete anything outside the base directory', async () => {
      const outside = join(basePath, '..', `ocp-outside-${Date.now()}.txt`);
      await writeFile(outside, 'no me borres');

      try {
        await expect(storage.delete(`../${outside.split(/[\\/]/).pop()}`)).rejects.toThrow();
        await expect(readFile(outside, 'utf-8')).resolves.toBe('no me borres');
      } finally {
        await rm(outside, { force: true });
      }
    });
  });

  describe('getBasePath', () => {
    it('reports an absolute base path', () => {
      expect(storage.getBasePath()).toBe(resolve(basePath));
    });
  });
});

describe('sanitizeFileName', () => {
  it('replaces characters that are unsafe in a file name', () => {
    expect(sanitizeFileName('a b/c:d*e?.pdf')).toBe('c_d_e_.pdf');
  });

  it('drops directory components', () => {
    expect(sanitizeFileName('C:\\Users\\ana\\cv.pdf')).toBe('cv.pdf');
  });

  it('never returns an empty name', () => {
    expect(sanitizeFileName('...')).toBe('file');
    expect(sanitizeFileName('')).toBe('file');
  });

  it('caps very long names', () => {
    const result = sanitizeFileName(`${'a'.repeat(500)}.pdf`);
    expect(result.length).toBeLessThanOrEqual(120);
  });
});
