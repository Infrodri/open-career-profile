import Tesseract from 'tesseract.js';
import { type OcrProvider, type OcrProviderConfig } from './interfaces/ocr-provider.js';

/**
 * OCR adapter using Tesseract.js for text extraction from images.
 * Handles errors gracefully — returns empty string on failure, never crashes.
 */
export class TesseractAdapter implements OcrProvider {
  private readonly config: OcrProviderConfig;

  constructor(config: OcrProviderConfig) {
    this.config = config;
  }

  isAvailable(): boolean {
    return this.config.enabled;
  }

  async extractText(imageBuffer: Buffer, language?: string): Promise<string> {
    if (!this.isAvailable()) {
      return '';
    }

    try {
      const lang = language ?? this.config.language;
      const result = await Tesseract.recognize(imageBuffer, lang);
      return result.data.text;
    } catch (_error: unknown) {
      return '';
    }
  }
}
