import { type OcrProviderConfig } from './interfaces/ocr-provider.js';

/**
 * Reads OCR provider configuration from environment variables.
 *
 * Environment variables:
 * - OCP_OCR_ENABLED: Whether OCR is enabled (default: "true")
 * - OCP_OCR_LANGUAGE: Tesseract language code (default: "eng")
 */
export function getOcrConfig(): OcrProviderConfig {
  return {
    enabled: parseBooleanOrDefault(process.env['OCP_OCR_ENABLED'], true),
    language: process.env['OCP_OCR_LANGUAGE'] ?? 'eng',
  };
}

function parseBooleanOrDefault(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') return defaultValue;
  return value.toLowerCase() === 'true';
}
