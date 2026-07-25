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

export function createDocumentRoutes(ocrProvider: OcrProvider): Router {
  const router = Router();

  // POST /api/documents/extract
  router.post('/extract', upload.single('document'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json(failure('NO_FILE', 'No document file provided'));
        return;
      }

      if (!ocrProvider.isAvailable()) {
        res.status(503).json(failure('OCR_UNAVAILABLE', 'OCR service is not available'));
        return;
      }

      const text = await ocrProvider.extractText(req.file.buffer);

      res.json(success({ text, fileName: req.file.originalname }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to extract text';
      res.status(500).json(failure('EXTRACT_ERROR', message));
    }
  });

  return router;
}
