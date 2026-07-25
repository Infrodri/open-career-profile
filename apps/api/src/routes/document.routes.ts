import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { type OcrProvider } from '@ocp/ocr-adapter';
import { type DocumentService } from '../services/document.service.js';
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

export function createDocumentRoutes(ocrProvider: OcrProvider, documentService: DocumentService): Router {
  const router = Router();

  // POST /api/documents/extract - Extract text from document and create document record
  router.post('/extract', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json(failure('NO_FILE', 'No document file provided'));
        return;
      }

      // First save the file to storage
      const storagePath = await documentService.saveFile(req.file.buffer, req.file.originalname);

      let text: string;

      if (req.file.mimetype === 'application/pdf') {
        // PDF: extract text directly (no OCR needed for digital PDFs)
        text = await extractTextFromPdf(req.file.buffer);
      } else {
        // Image: use OCR
        if (!ocrProvider.isAvailable()) {
          res.status(503).json(failure('OCR_UNAVAILABLE', 'OCR service is not available'));
          return;
        }
        text = await ocrProvider.extractText(req.file.buffer);
      }

      if (!text || text.trim() === '') {
        text = '';
      }

      // Create document record
      const profileId = req.headers['x-profile-id'] as string | undefined;
      if (!profileId) {
        res.status(400).json(failure('NO_PROFILE_ID', 'Profile ID header required'));
        return;
      }

      const document = await documentService.create({
        profileId,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        storagePath,
        documentType: undefined,
        extractedText: text.trim(),
      });

      res.json(success({ documentId: document.id, text: text.trim(), fileName: req.file.originalname }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extract text';
      res.status(500).json(failure('EXTRACT_ERROR', message));
    }
  });

  // GET /api/profiles/:id/documents - List all documents for a profile
  router.get('/profiles/:id/documents', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const documents = await documentService.findByProfileId(id);
      res.json(success(documents));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list documents';
      res.status(500).json(failure('LIST_ERROR', message));
    }
  });

  // GET /api/documents/:id/file - Download document file
  router.get('/documents/:id/file', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const document = await documentService.findById(id);
      if (!document) {
        res.status(404).json(failure('NOT_FOUND', 'Document not found'));
        return;
      }

      if (!documentService.fileExists(document.storagePath)) {
        res.status(404).json(failure('FILE_NOT_FOUND', 'File not found in storage'));
        return;
      }

      const buffer = await documentService.readFile(document.storagePath);

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
      res.setHeader('Content-Length', document.sizeBytes.toString());
      res.send(buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download file';
      res.status(500).json(failure('DOWNLOAD_ERROR', message));
    }
  });

  // DELETE /api/documents/:id - Delete document and its file
  router.delete('/documents/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await documentService.delete(id);
      res.status(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete document';
      res.status(500).json(failure('DELETE_ERROR', message));
    }
  });

  // POST /api/documents/:id/evidence - Create evidence linking document to entry
  router.post('/documents/:id/evidence', async (req: Request, res: Response) => {
    try {
      const { sectionType, entryId, note } = req.body;
      if (!sectionType || !entryId) {
        res.status(400).json(failure('INVALID_INPUT', 'sectionType and entryId are required'));
        return;
      }

      const id = req.params.id as string;
      const evidence = await documentService.createEvidence(id, sectionType, entryId, note);
      res.status(201).json(success(evidence));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create evidence';
      res.status(500).json(failure('CREATE_ERROR', message));
    }
  });

  // DELETE /api/evidence/:id - Delete evidence
  router.delete('/evidence/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await documentService.deleteEvidence(id);
      res.status(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete evidence';
      res.status(500).json(failure('DELETE_ERROR', message));
    }
  });

  return router;
}
