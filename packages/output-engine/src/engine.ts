import { type ProfessionalProfile } from '@ocp/core';
import { type PdfRenderer } from './interfaces/renderer.js';
import { getTemplate } from './templates/registry.js';

/**
 * OutputEngine generates HTML and PDF output from a ProfessionalProfile.
 * Uses Handlebars templates for HTML generation and a PdfRenderer adapter for PDF.
 */
export class OutputEngine {
  private readonly renderer: PdfRenderer;

  constructor(renderer: PdfRenderer) {
    this.renderer = renderer;
  }

  /**
   * Generates an HTML string from the given profile using the specified template.
   * @param profile - The professional profile data.
   * @param templateId - ID of the template to use (e.g., 'standard', 'minimal').
   * @returns Rendered HTML string.
   */
  generateHtml(profile: ProfessionalProfile, templateId: string): string {
    const template = getTemplate(templateId);
    return template(profile);
  }

  /**
   * Generates a PDF buffer from the given profile using the specified template.
   * @param profile - The professional profile data.
   * @param templateId - ID of the template to use (e.g., 'standard', 'minimal').
   * @returns A Buffer containing the PDF data.
   */
  async generatePdf(profile: ProfessionalProfile, templateId: string): Promise<Buffer> {
    const html = this.generateHtml(profile, templateId);
    return this.renderer.renderPdf(html);
  }
}
