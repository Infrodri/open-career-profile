import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  type Document,
  type DocumentRepository,
  type DocumentStorage,
  type Evidence,
  type EvidenceTarget,
} from '@ocp/core';
import { DocumentService } from '../src/services/document.service.js';

/** In-memory storage that records what happened, so cleanup can be asserted. */
function createFakeStorage(): DocumentStorage & { files: Map<string, Buffer> } {
  const files = new Map<string, Buffer>();
  let counter = 0;

  return {
    files,
    save: vi.fn(async (buffer: Buffer, fileName: string, profileId?: string) => {
      const path = `${profileId ?? 'unassigned'}/${++counter}-${fileName}`;
      files.set(path, buffer);
      return path;
    }),
    read: vi.fn(async (path: string) => {
      const file = files.get(path);
      if (!file) throw new Error(`not found: ${path}`);
      return file;
    }),
    delete: vi.fn(async (path: string) => {
      files.delete(path);
    }),
    exists: vi.fn(async (path: string) => files.has(path)),
  };
}

function createFakeRepository(): DocumentRepository & { documents: Document[]; evidence: Evidence[] } {
  const documents: Document[] = [];
  const evidence: Evidence[] = [];

  return {
    documents,
    evidence,
    create: vi.fn(async (document: Document) => {
      documents.push(document);
      return document;
    }),
    findById: vi.fn(async (id: string) => documents.find((d) => d.id === id) ?? null),
    findByContentHash: vi.fn(async (contentHash: string, profileId?: string) => {
      return documents.find((d) =>
        d.contentHash === contentHash && (profileId ? d.profileId === profileId : true),
      ) ?? null;
    }),
    findByProfileId: vi.fn(async (profileId: string) =>
      documents.filter((d) => d.profileId === profileId),
    ),
    findUnassigned: vi.fn(async () => documents.filter((d) => d.profileId === undefined)),
    assignToProfile: vi.fn(async (documentId: string, profileId: string) => {
      const doc = documents.find((d) => d.id === documentId);
      if (!doc) throw new Error('document not found');
      doc.profileId = profileId;
      return doc;
    }),
    updateDocumentType: vi.fn(async (documentId: string, documentType) => {
      const doc = documents.find((d) => d.id === documentId);
      if (!doc) throw new Error('document not found');
      doc.documentType = documentType;
      return doc;
    }),
    delete: vi.fn(async (id: string) => {
      const index = documents.findIndex((d) => d.id === id);
      if (index >= 0) documents.splice(index, 1);
    }),
    createEvidence: vi.fn(async (documentId: string, targets: EvidenceTarget[]) => {
      const created = targets.map((target, i) => ({
        id: `ev-${evidence.length + i + 1}`,
        documentId,
        sectionType: target.sectionType,
        entryId: target.entryId,
        note: target.note,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      evidence.push(...created);
      return created;
    }),
    findEvidenceByDocumentId: vi.fn(async (documentId: string) =>
      evidence.filter((e) => e.documentId === documentId),
    ),
    findEvidenceByEntry: vi.fn(async (sectionType, entryId: string) =>
      evidence.filter((e) => e.sectionType === sectionType && e.entryId === entryId),
    ),
    findEvidenceByProfileId: vi.fn(async (profileId: string) => {
      const ids = documents.filter((d) => d.profileId === profileId).map((d) => d.id);
      return evidence.filter((e) => ids.includes(e.documentId));
    }),
    deleteEvidence: vi.fn(async (id: string) => {
      const index = evidence.findIndex((e) => e.id === id);
      if (index >= 0) evidence.splice(index, 1);
    }),
  };
}

describe('DocumentService', () => {
  let storage: ReturnType<typeof createFakeStorage>;
  let repository: ReturnType<typeof createFakeRepository>;
  let service: DocumentService;

  beforeEach(() => {
    storage = createFakeStorage();
    repository = createFakeRepository();
    service = new DocumentService(repository, storage);
  });

  describe('store', () => {
    it('saves the file and records the document', async () => {
      const buffer = Buffer.from('contenido');

      const document = await service.store({
        buffer,
        fileName: 'certificado.pdf',
        mimeType: 'application/pdf',
        extractedText: 'Curso de Seguridad',
      });

      expect(document.id).toBeTruthy();
      expect(document.sizeBytes).toBe(buffer.byteLength);
      expect(document.extractedText).toBe('Curso de Seguridad');
      expect(storage.files.get(document.storagePath)).toEqual(buffer);
    });

    it('stores a document with no profile, so uploads work before a profile exists', async () => {
      const document = await service.store({
        buffer: Buffer.from('x'),
        fileName: 'hoja.pdf',
        mimeType: 'application/pdf',
      });

      expect(document.profileId).toBeUndefined();
      await expect(service.findUnassigned()).resolves.toHaveLength(1);
    });

    it('passes the profile id through to storage when known', async () => {
      await service.store({
        buffer: Buffer.from('x'),
        fileName: 'titulo.pdf',
        mimeType: 'application/pdf',
        profileId: 'profile-1',
      });

      expect(storage.save).toHaveBeenCalledWith(expect.any(Buffer), 'titulo.pdf', 'profile-1');
    });

    it('removes the stored file when the database insert fails', async () => {
      repository.create = vi.fn(async () => {
        throw new Error('constraint violated');
      });

      await expect(
        service.store({
          buffer: Buffer.from('x'),
          fileName: 'fallido.pdf',
          mimeType: 'application/pdf',
        }),
      ).rejects.toThrow('constraint violated');

      // No orphan file is left behind.
      expect(storage.files.size).toBe(0);
      expect(storage.delete).toHaveBeenCalledOnce();
    });

    it('propagates the original error even if cleanup fails', async () => {
      repository.create = vi.fn(async () => {
        throw new Error('db down');
      });
      storage.delete = vi.fn(async () => {
        throw new Error('disk locked');
      });

      await expect(
        service.store({
          buffer: Buffer.from('x'),
          fileName: 'doble-fallo.pdf',
          mimeType: 'application/pdf',
        }),
      ).rejects.toThrow('db down');
    });
  });

  describe('linkEvidence', () => {
    it('links a document to entries keeping the real entry id and section', async () => {
      const document = await service.store({
        buffer: Buffer.from('x'),
        fileName: 'cert.pdf',
        mimeType: 'application/pdf',
      });

      const created = await service.linkEvidence(document.id, [
        { sectionType: 'certifications', entryId: 'entry-cert-1' },
        { sectionType: 'education', entryId: 'entry-edu-1' },
      ]);

      expect(created).toHaveLength(2);
      expect(created.map((e) => e.entryId)).toEqual(['entry-cert-1', 'entry-edu-1']);
      expect(created.map((e) => e.sectionType)).toEqual(['certifications', 'education']);
      // No evidence may be created with an empty entry id.
      expect(created.every((e) => e.entryId !== '')).toBe(true);
    });

    it('finds evidence back by entry', async () => {
      const document = await service.store({
        buffer: Buffer.from('x'),
        fileName: 'cert.pdf',
        mimeType: 'application/pdf',
      });
      await service.linkEvidence(document.id, [
        { sectionType: 'skills', entryId: 'skill-1' },
      ]);

      const found = await service.findEvidenceByEntry('skills', 'skill-1');

      expect(found).toHaveLength(1);
      expect(found[0]?.documentId).toBe(document.id);
    });
  });

  describe('assignToProfile', () => {
    it('attaches an unassigned document to a profile', async () => {
      const document = await service.store({
        buffer: Buffer.from('x'),
        fileName: 'suelto.pdf',
        mimeType: 'application/pdf',
      });

      await service.assignToProfile(document.id, 'profile-9');

      await expect(service.findByProfileId('profile-9')).resolves.toHaveLength(1);
      await expect(service.findUnassigned()).resolves.toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('delegates to the repository, which owns file removal', async () => {
      const document = await service.store({
        buffer: Buffer.from('x'),
        fileName: 'borrar.pdf',
        mimeType: 'application/pdf',
      });

      await service.delete(document.id);

      expect(repository.delete).toHaveBeenCalledWith(document.id);
      await expect(service.findById(document.id)).resolves.toBeNull();
    });
  });
});
