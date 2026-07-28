// @ocp/output-engine - PDF and HTML output engine

export { OutputEngine } from './engine.js';
export { type PdfRenderer } from './interfaces/renderer.js';
export { PuppeteerAdapter } from './adapters/puppeteer.adapter.js';
export { PdfKitAdapter } from './adapters/pdfkit.adapter.js';
export { templateRegistry, getTemplate, getTemplateIds, type CompiledTemplate, type BuiltInTemplateId } from './templates/registry.js';
