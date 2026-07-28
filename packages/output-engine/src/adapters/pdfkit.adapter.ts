import PDFDocument from 'pdfkit';
import { type PdfRenderer } from '../interfaces/renderer.js';

/**
 * PDF renderer using PDFKit — generates PDFs programmatically without Chrome.
 *
 * This adapter takes the rendered HTML and converts it to a PDF using a simple
 * text-based approach: strips HTML tags and renders the text content with basic
 * formatting. For production-quality output, the HTML format is recommended.
 *
 * Advantages over Puppeteer:
 * - No Chrome/Chromium dependency
 * - Works on any Node.js environment (Render, Vercel, Lambda)
 * - Fast and lightweight (~2MB vs ~300MB for Chrome)
 */
export class PdfKitAdapter implements PdfRenderer {
  async renderPdf(html: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          info: {
            Title: 'Hoja de Vida',
            Author: 'Open Career Profile',
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Parse the HTML into text blocks and render them
        const blocks = this.parseHtmlToBlocks(html);
        this.renderBlocks(doc, blocks);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Simple HTML to text-block parser.
   * Extracts headings, paragraphs, and list items from the HTML.
   */
  private parseHtmlToBlocks(html: string): TextBlock[] {
    const blocks: TextBlock[] = [];

    // Extract title from <title> or <h1>
    const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (titleMatch?.[1]) {
      blocks.push({ type: 'title', text: this.stripTags(titleMatch[1]) });
    }

    // Extract sections: look for h2 headers followed by content
    const sectionRegex = /<h2[^>]*>(.*?)<\/h2>([\s\S]*?)(?=<h2|<\/div>\s*<\/div>\s*<\/body>|$)/gi;
    let match;
    while ((match = sectionRegex.exec(html)) !== null) {
      const sectionTitle = this.stripTags(match[1] ?? '');
      const sectionContent = match[2] ?? '';

      blocks.push({ type: 'section', text: sectionTitle });

      // Extract entries within this section
      const entryRegex = /<div[^>]*class="[^"]*entry[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
      let entryMatch;
      let foundEntries = false;
      while ((entryMatch = entryRegex.exec(sectionContent)) !== null) {
        const entryHtml = entryMatch[1] ?? '';
        const lines = this.stripTags(entryHtml).split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          blocks.push({ type: 'entry', text: lines.join(' · ') });
          foundEntries = true;
        }
      }

      // If no entries found, extract raw text
      if (!foundEntries) {
        const rawText = this.stripTags(sectionContent).trim();
        if (rawText.length > 0) {
          blocks.push({ type: 'text', text: rawText });
        }
      }
    }

    // If no sections found, just extract all visible text
    if (blocks.length <= 1) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch?.[1]) {
        const text = this.stripTags(bodyMatch[1]).trim();
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          blocks.push({ type: 'text', text: line });
        }
      }
    }

    // Extract contact info from header
    const contactMatch = html.match(/<div[^>]*class="[^"]*contact[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (contactMatch?.[1]) {
      const contact = this.stripTags(contactMatch[1]).trim();
      if (contact && blocks.length > 0) {
        // Insert after title
        blocks.splice(1, 0, { type: 'contact', text: contact });
      }
    }

    return blocks;
  }

  /**
   * Render text blocks into the PDF document.
   */
  private renderBlocks(doc: PDFKit.PDFDocument, blocks: TextBlock[]): void {
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    for (const block of blocks) {
      // Check if we need a new page
      if (doc.y > doc.page.height - doc.page.margins.bottom - 60) {
        doc.addPage();
      }

      switch (block.type) {
        case 'title':
          doc.fontSize(18).font('Helvetica-Bold')
            .text(block.text, { align: 'center', width: pageWidth });
          doc.moveDown(0.3);
          break;

        case 'contact':
          doc.fontSize(9).font('Helvetica')
            .text(block.text, { align: 'center', width: pageWidth });
          doc.moveDown(0.5);
          // Draw a separator line
          doc.moveTo(doc.page.margins.left, doc.y)
            .lineTo(doc.page.width - doc.page.margins.right, doc.y)
            .strokeColor('#1e3a5f').lineWidth(1).stroke();
          doc.moveDown(0.5);
          break;

        case 'section':
          doc.moveDown(0.5);
          doc.fontSize(11).font('Helvetica-Bold')
            .text(block.text.toUpperCase(), { width: pageWidth });
          // Underline
          doc.moveTo(doc.page.margins.left, doc.y)
            .lineTo(doc.page.margins.left + pageWidth, doc.y)
            .strokeColor('#dddddd').lineWidth(0.5).stroke();
          doc.moveDown(0.3);
          break;

        case 'entry':
          doc.fontSize(9).font('Helvetica')
            .text(block.text, doc.page.margins.left + 10, undefined, { width: pageWidth - 10 });
          doc.moveDown(0.2);
          break;

        case 'text':
          doc.fontSize(9).font('Helvetica')
            .text(block.text, { width: pageWidth });
          doc.moveDown(0.2);
          break;
      }
    }
  }

  /** Strip HTML tags from a string. */
  private stripTags(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?(p|div|li|tr|td|th)[^>]*>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}

interface TextBlock {
  type: 'title' | 'section' | 'entry' | 'text' | 'contact';
  text: string;
}
