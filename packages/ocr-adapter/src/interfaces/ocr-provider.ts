/**
 * Port for OCR text extraction.
 * Implementations (adapters) provide the actual OCR engine connection.
 */
export interface OcrProvider {
  /** Extract text from an image or PDF buffer */
  extractText(imageBuffer: Buffer, language?: string): Promise<string>;

  /** Check if the OCR provider is available */
  isAvailable(): boolean;
}

export interface OcrProviderConfig {
  language: string;
  enabled: boolean;
}
