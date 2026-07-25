import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TesseractAdapter } from '../src/tesseract.adapter.js';
import { getOcrConfig } from '../src/config.js';
import { type OcrProviderConfig } from '../src/interfaces/ocr-provider.js';

vi.mock('tesseract.js', () => ({
  default: {
    recognize: vi.fn(),
  },
}));

import Tesseract from 'tesseract.js';

describe('TesseractAdapter', () => {
  const enabledConfig: OcrProviderConfig = {
    language: 'eng',
    enabled: true,
  };

  const disabledConfig: OcrProviderConfig = {
    language: 'eng',
    enabled: false,
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAvailable', () => {
    it('returns true when enabled', () => {
      const adapter = new TesseractAdapter(enabledConfig);
      expect(adapter.isAvailable()).toBe(true);
    });

    it('returns false when disabled', () => {
      const adapter = new TesseractAdapter(disabledConfig);
      expect(adapter.isAvailable()).toBe(false);
    });
  });

  describe('extractText', () => {
    it('returns empty string when provider is disabled', async () => {
      const adapter = new TesseractAdapter(disabledConfig);
      const result = await adapter.extractText(Buffer.from('fake-image'));
      expect(result).toBe('');
    });

    it('calls Tesseract.recognize with config language', async () => {
      vi.mocked(Tesseract.recognize).mockResolvedValue({
        data: { text: 'Extracted text from image' },
      } as Awaited<ReturnType<typeof Tesseract.recognize>>);

      const adapter = new TesseractAdapter(enabledConfig);
      const buffer = Buffer.from('fake-image-data');
      const result = await adapter.extractText(buffer);

      expect(Tesseract.recognize).toHaveBeenCalledWith(buffer, 'eng');
      expect(result).toBe('Extracted text from image');
    });

    it('uses language parameter override when provided', async () => {
      vi.mocked(Tesseract.recognize).mockResolvedValue({
        data: { text: 'Texto extraido' },
      } as Awaited<ReturnType<typeof Tesseract.recognize>>);

      const adapter = new TesseractAdapter(enabledConfig);
      const buffer = Buffer.from('fake-image-data');
      const result = await adapter.extractText(buffer, 'spa');

      expect(Tesseract.recognize).toHaveBeenCalledWith(buffer, 'spa');
      expect(result).toBe('Texto extraido');
    });

    it('handles errors gracefully and returns empty string', async () => {
      vi.mocked(Tesseract.recognize).mockRejectedValue(new Error('OCR engine failed'));

      const adapter = new TesseractAdapter(enabledConfig);
      const result = await adapter.extractText(Buffer.from('bad-data'));

      expect(result).toBe('');
    });
  });
});

describe('getOcrConfig', () => {
  beforeEach(() => {
    vi.stubEnv('OCP_OCR_ENABLED', undefined as unknown as string);
    vi.stubEnv('OCP_OCR_LANGUAGE', undefined as unknown as string);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns default values when env vars are not set', () => {
    const config = getOcrConfig();

    expect(config.enabled).toBe(true);
    expect(config.language).toBe('eng');
  });

  it('reads values from environment variables', () => {
    vi.stubEnv('OCP_OCR_ENABLED', 'false');
    vi.stubEnv('OCP_OCR_LANGUAGE', 'spa');

    const config = getOcrConfig();

    expect(config.enabled).toBe(false);
    expect(config.language).toBe('spa');
  });

  it('parses OCP_OCR_ENABLED as boolean', () => {
    vi.stubEnv('OCP_OCR_ENABLED', 'true');
    expect(getOcrConfig().enabled).toBe(true);

    vi.stubEnv('OCP_OCR_ENABLED', 'TRUE');
    expect(getOcrConfig().enabled).toBe(true);

    vi.stubEnv('OCP_OCR_ENABLED', 'false');
    expect(getOcrConfig().enabled).toBe(false);

    vi.stubEnv('OCP_OCR_ENABLED', 'anything-else');
    expect(getOcrConfig().enabled).toBe(false);
  });
});
