import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { type OcrProvider } from '@ocp/ocr-adapter';
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
 * Extract text from a PDF buffer using pdf-parse.
 */
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(buffer);
  return result.text;
}

export function createDocumentRoutes(ocrProvider: OcrProvider): Router {
  const router = Router();

  // POST /api/documents/extract
  router.post('/extract', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json(failure('NO_FILE', 'No document file provided'));
        return;
      }

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
        res.status(422).json(failure('NO_TEXT', 'Could not extract text from the document. Try with a clearer image.'));
        return;
      }

      res.json(success({ text: text.trim(), fileName: req.file.originalname }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extract text';
      res.status(500).json(failure('EXTRACT_ERROR', message));
    }
  });

  return router;
}
