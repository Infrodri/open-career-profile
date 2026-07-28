import Tesseract from 'tesseract.js';
import { type OcrProvider, type OcrProviderConfig } from './interfaces/ocr-provider.js';

/**
 * OCR adapter using Tesseract.js for text extraction from images.
 *
 * Includes image preprocessing with sharp to handle difficult cases:
 * - Dark backgrounds with light text (certificates with colored backgrounds)
 * - Low contrast images
 * - Decorative fonts
 *
 * Strategy: try normal first, if result is too short, try with inverted colors.
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

      // First attempt: preprocess with grayscale + normalize for better contrast
      const preprocessed = await this.preprocessImage(imageBuffer);
      const result = await Tesseract.recognize(preprocessed, lang);
      const text = result.data.text.trim();

      // If we got meaningful text (more than 20 chars), return it
      if (text.length > 20) {
        return text;
      }

      // Second attempt: invert colors (for dark backgrounds with light text)
      const inverted = await this.invertImage(imageBuffer);
      const invertedResult = await Tesseract.recognize(inverted, lang);
      const invertedText = invertedResult.data.text.trim();

      // Return whichever got more text
      return invertedText.length > text.length ? invertedText : text;
    } catch (_error: unknown) {
      // Last resort: try raw buffer without preprocessing
      try {
        const lang = language ?? this.config.language;
        const result = await Tesseract.recognize(imageBuffer, lang);
        return result.data.text;
      } catch {
        return '';
      }
    }
  }

  /**
   * Preprocess image: convert to grayscale and normalize contrast.
   * This helps with colored backgrounds and low-contrast text.
   */
  private async preprocessImage(buffer: Buffer): Promise<Buffer> {
    try {
      const sharp = (await import('sharp')).default;
      return await sharp(buffer)
        .grayscale()
        .normalize()
        .png()
        .toBuffer();
    } catch {
      // If sharp fails (unsupported format, etc.), return original
      return buffer;
    }
  }

  /**
   * Invert image colors: turns dark backgrounds light and vice versa.
   * Critical for certificates with dark/colored backgrounds and white text.
   */
  private async invertImage(buffer: Buffer): Promise<Buffer> {
    try {
      const sharp = (await import('sharp')).default;
      return await sharp(buffer)
        .negate()
        .grayscale()
        .normalize()
        .png()
        .toBuffer();
    } catch {
      return buffer;
    }
  }
}
