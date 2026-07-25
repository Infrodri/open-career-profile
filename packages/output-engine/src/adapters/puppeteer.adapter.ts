import puppeteer from 'puppeteer';
import { type PdfRenderer } from '../interfaces/renderer.js';

/**
 * Adapter that implements PdfRenderer using Puppeteer.
 * Generates A4-sized PDFs with standard margins.
 */
export class PuppeteerAdapter implements PdfRenderer {
  async renderPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
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
