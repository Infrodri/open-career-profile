/**
 * Port interface for PDF rendering.
 * Implementations (adapters) convert HTML content into a PDF buffer.
 */
export interface PdfRenderer {
  renderPdf(html: string): Promise<Buffer>;
}
