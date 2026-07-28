import puppeteer from 'puppeteer';
import { type PdfRenderer } from '../interfaces/renderer.js';

/**
 * Adapter that implements PdfRenderer using Puppeteer.
 * Generates A4-sized PDFs with standard margins.
 *
 * On Render/Docker, Chrome must be installed separately. This adapter
 * uses --no-sandbox and accepts the PUPPETEER_EXECUTABLE_PATH env var
 * for custom Chrome locations.
 */
export class PuppeteerAdapter implements PdfRenderer {
  async renderPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      ...(process.env['PUPPETEER_EXECUTABLE_PATH']
        ? { executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'] }
        : {}),
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
