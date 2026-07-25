// @ocp/output-engine - PDF and HTML output engine

export { OutputEngine } from './engine.js';
export { type PdfRenderer } from './interfaces/renderer.js';
export { PuppeteerAdapter } from './adapters/puppeteer.adapter.js';
export { getTemplate, getTemplateIds, type TemplateId } from './templates/registry.js';
