import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { isDocumentType, isSectionType, type EvidenceTarget } from '@ocp/core';
import { type OcrProvider } from '@ocp/ocr-adapter';
import { type DocumentService, isDuplicate } from '../services/document.service.js';
import { success, failure } from '../middleware/error-handler.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
    if (allowed) {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are accepted'));
    }
  },
});

/**
 * Extract text from a PDF buffer.
 * Uses pdf-parse/lib/pdf-parse.js directly to avoid the test file bug.
 */
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
  const result = await pdfParse(buffer);
  return result.text;
}

/**
 * Document and evidence routes.
 *
 * This router is mounted at `/api`, so the paths below are the full public URLs.
 * Keeping them absolute avoids the prefix being applied twice.
 */
export function createDocumentRoutes(
  ocrProvider: OcrProvider,
  documentService: DocumentService,
): Router {
  const router = Router();

  // POST /api/documents/extract
  // Stores the file, extracts its text, and returns both the documentId and the text.
  // profileId is optional: a document may be uploaded before any profile exists.
  router.post('/documents/extract', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json(failure('NO_FILE', 'No se recibió ningún archivo'));
        return;
      }

      const isPdf = req.file.mimetype === 'application/pdf';

      if (!isPdf && !ocrProvider.isAvailable()) {
        res.status(503).json(failure('OCR_UNAVAILABLE', 'El servicio de OCR no está disponible'));
        return;
      }

      // Extract the text before touching storage, so a failure here leaves nothing behind.
      let text: string;
      try {
        text = isPdf
          ? await extractTextFromPdf(req.file.buffer)
          : await ocrProvider.extractText(req.file.buffer);
      } catch (err) {
        const detail = err instanceof Error ? err.message : 'error desconocido';
        res
          .status(422)
          .json(
            failure(
              'EXTRACTION_FAILED',
              `No se pudo leer el documento (${detail}). Si es una foto, intenta con una imagen más nítida.`,
            ),
          );
        return;
      }

      const trimmedText = text.trim();

      // The raw formData value is always a string; treat empty as absent.
      const rawProfileId = typeof req.body?.profileId === 'string' ? req.body.profileId.trim() : '';
      const rawDocumentType = typeof req.body?.documentType === 'string' ? req.body.documentType : '';

      const result = await documentService.store({
        buffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        extractedText: trimmedText === '' ? undefined : trimmedText,
        ...(rawProfileId !== '' ? { profileId: rawProfileId } : {}),
        ...(isDocumentType(rawDocumentType) ? { documentType: rawDocumentType } : {}),
      });

      // Handle duplicate detection
      if (isDuplicate(result)) {
        const existing = result.existingDocument;
        res.status(409).json(failure(
          'DUPLICATE_DOCUMENT',
          `El archivo "${req.file.originalname}" ya fue subido previamente.`,
          [{ existingDocumentId: existing.id, fileName: existing.fileName }],
        ));
        return;
      }

      const document = result;

      res.json(
        success({
          documentId: document.id,
          fileName: document.fileName,
          mimeType: document.mimeType,
          sizeBytes: document.sizeBytes,
          text: trimmedText,
          // Let the client decide how to react to an unreadable document.
          hasText: trimmedText !== '',
        }),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo procesar el documento';
      res.status(500).json(failure('EXTRACT_ERROR', message));
    }
  });

  // GET /api/documents/unassigned — documents not yet linked to a profile
  router.get('/documents/unassigned', async (_req: Request, res: Response) => {
    try {
      res.json(success(await documentService.findUnassigned()));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo listar los documentos';
      res.status(500).json(failure('LIST_ERROR', message));
    }
  });

  // GET /api/profiles/:id/documents
  router.get('/profiles/:id/documents', async (req: Request, res: Response) => {
    try {
      const profileId = req.params.id as string;
      res.json(success(await documentService.findByProfileId(profileId)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo listar los documentos';
      res.status(500).json(failure('LIST_ERROR', message));
    }
  });

  // GET /api/profiles/:id/evidence — every evidence link of the profile
  router.get('/profiles/:id/evidence', async (req: Request, res: Response) => {
    try {
      const profileId = req.params.id as string;
      res.json(success(await documentService.findEvidenceByProfileId(profileId)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo listar las evidencias';
      res.status(500).json(failure('LIST_ERROR', message));
    }
  });

  // GET /api/documents/:id — document metadata plus its evidence links
  router.get('/documents/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const document = await documentService.findById(id);
      if (!document) {
        res.status(404).json(failure('NOT_FOUND', 'Documento no encontrado'));
        return;
      }

      const evidence = await documentService.findEvidenceByDocumentId(id);
      res.json(success({ ...document, evidence }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo obtener el documento';
      res.status(500).json(failure('GET_ERROR', message));
    }
  });

  // GET /api/documents/:id/file — the original file
  router.get('/documents/:id/file', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const document = await documentService.findById(id);
      if (!document) {
        res.status(404).json(failure('NOT_FOUND', 'Documento no encontrado'));
        return;
      }

      if (!(await documentService.fileExists(document.storagePath))) {
        res
          .status(404)
          .json(failure('FILE_NOT_FOUND', 'El archivo ya no está en el almacenamiento local'));
        return;
      }

      const buffer = await documentService.readFile(document.storagePath);

      // inline lets the browser preview PDFs and images instead of forcing a download.
      const disposition = req.query['download'] === '1' ? 'attachment' : 'inline';
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader(
        'Content-Disposition',
        `${disposition}; filename="${encodeURIComponent(document.fileName)}"`,
      );
      res.setHeader('Content-Length', buffer.byteLength.toString());
      res.send(buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo descargar el archivo';
      res.status(500).json(failure('DOWNLOAD_ERROR', message));
    }
  });

  // PATCH /api/documents/:id — update the document type
  router.patch('/documents/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { documentType } = req.body ?? {};

      if (documentType !== null && documentType !== undefined && !isDocumentType(documentType)) {
        res.status(400).json(failure('INVALID_INPUT', `Tipo de documento inválido: ${documentType}`));
        return;
      }

      if (!(await documentService.findById(id))) {
        res.status(404).json(failure('NOT_FOUND', 'Documento no encontrado'));
        return;
      }

      const updated = await documentService.updateDocumentType(
        id,
        isDocumentType(documentType) ? documentType : undefined,
      );
      res.json(success(updated));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el documento';
      res.status(500).json(failure('UPDATE_ERROR', message));
    }
  });

  // DELETE /api/documents/:id — removes the row, its evidence and the file
  router.delete('/documents/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      if (!(await documentService.findById(id))) {
        res.status(404).json(failure('NOT_FOUND', 'Documento no encontrado'));
        return;
      }

      await documentService.delete(id);
      res.status(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el documento';
      res.status(500).json(failure('DELETE_ERROR', message));
    }
  });

  // POST /api/documents/:id/evidence — link the document to profile entries
  router.post('/documents/:id/evidence', async (req: Request, res: Response) => {
    try {
      const documentId = req.params.id as string;
      const body = req.body ?? {};

      // Accept a single link or a batch.
      const rawTargets: unknown[] = Array.isArray(body.targets) ? body.targets : [body];

      const targets: EvidenceTarget[] = [];
      for (const raw of rawTargets) {
        const candidate = raw as { sectionType?: unknown; entryId?: unknown; note?: unknown };

        if (!isSectionType(candidate.sectionType)) {
          res
            .status(400)
            .json(failure('INVALID_INPUT', `sectionType inválido: ${String(candidate.sectionType)}`));
          return;
        }
        if (typeof candidate.entryId !== 'string' || candidate.entryId.trim() === '') {
          res.status(400).json(failure('INVALID_INPUT', 'entryId es obligatorio'));
          return;
        }

        targets.push({
          sectionType: candidate.sectionType,
          entryId: candidate.entryId,
          ...(typeof candidate.note === 'string' && candidate.note !== ''
            ? { note: candidate.note }
            : {}),
        });
      }

      if (!(await documentService.findById(documentId))) {
        res.status(404).json(failure('NOT_FOUND', 'Documento no encontrado'));
        return;
      }

      const evidence = await documentService.linkEvidence(documentId, targets);
      res.status(201).json(success(evidence));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo vincular la evidencia';
      res.status(500).json(failure('CREATE_ERROR', message));
    }
  });

  // DELETE /api/evidence/:id — unlinks without deleting the document
  router.delete('/evidence/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await documentService.deleteEvidence(id);
      res.status(204).send();
    } catch (err) {
      // Prisma throws P2025 when the row does not exist.
      if (typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2025') {
        res.status(404).json(failure('NOT_FOUND', 'Evidencia no encontrada'));
        return;
      }
      const message = err instanceof Error ? err.message : 'No se pudo eliminar la evidencia';
      res.status(500).json(failure('DELETE_ERROR', message));
    }
  });

  return router;
}
