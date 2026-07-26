import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type CompiledTemplate = ReturnType<typeof Handlebars.compile>;

/** IDs of templates bundled with the package (always available). */
const BUILT_IN_IDS = ['standard', 'minimal'] as const;
export type BuiltInTemplateId = (typeof BUILT_IN_IDS)[number];

/**
 * Registry that manages compiled Handlebars templates.
 *
 * Built-in templates are loaded from .hbs files on disk at startup.
 * Dynamic templates can be registered at runtime from the database.
 * Templates are cached after first compilation; cache invalidation is manual.
 */
class TemplateRegistry {
  private readonly cache = new Map<string, CompiledTemplate>();
  private readonly sources = new Map<string, string>();

  constructor() {
    this.loadBuiltIns();
    this.registerHelpers();
  }

  /** Load built-in templates from .hbs files. */
  private loadBuiltIns(): void {
    for (const id of BUILT_IN_IDS) {
      const filePath = resolveTemplatePath(id);
      const source = readFileSync(filePath, 'utf-8');
      this.sources.set(id, source);
      this.cache.set(id, Handlebars.compile(source));
    }
  }

  /**
   * Register safe Handlebars helpers.
   *
   * Only helpers that cannot execute arbitrary code are allowed.
   * Each helper is documented with its purpose.
   */
  private registerHelpers(): void {
    // Format an ISO date string to a more readable format
    Handlebars.registerHelper('formatDate', (dateStr: unknown, _format?: unknown) => {
      if (typeof dateStr !== 'string' || dateStr === '') return '';
      try {
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return dateStr;
        // Simple format: just year, or full date depending on input length
        if (dateStr.length === 4) return dateStr; // Just year
        if (dateStr.length === 7) return dateStr; // YYYY-MM
        return date.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
      } catch {
        return dateStr;
      }
    });

    // Join array items with a separator
    Handlebars.registerHelper('join', (arr: unknown, separator?: unknown) => {
      if (!Array.isArray(arr)) return '';
      const sep = typeof separator === 'string' ? separator : ', ';
      return arr.filter((item) => typeof item === 'string').join(sep);
    });

    // Truncate a string to a maximum length
    Handlebars.registerHelper('truncate', (str: unknown, maxLength: unknown) => {
      if (typeof str !== 'string') return '';
      const len = typeof maxLength === 'number' ? maxLength : 100;
      if (str.length <= len) return str;
      return str.slice(0, len) + '...';
    });

    // Conditional equality check
    Handlebars.registerHelper('ifEquals', function (this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Check if array has items
    Handlebars.registerHelper('hasItems', function (this: unknown, arr: unknown, options: Handlebars.HelperOptions) {
      if (Array.isArray(arr) && arr.length > 0) {
        return options.fn(this);
      }
      return options.inverse(this);
    });
  }

  /** Get all available template IDs (built-in + dynamic). */
  getTemplateIds(): string[] {
    return [...this.cache.keys()];
  }

  /** Get built-in template IDs. */
  getBuiltInIds(): readonly string[] {
    return BUILT_IN_IDS;
  }

  /** Check if a template ID is built-in. */
  isBuiltIn(templateId: string): boolean {
    return (BUILT_IN_IDS as readonly string[]).includes(templateId);
  }

  /**
   * Get a compiled template by ID.
   * @throws Error if the template is not found.
   */
  getTemplate(templateId: string): CompiledTemplate {
    const template = this.cache.get(templateId);
    if (!template) {
      throw new Error(
        `Template "${templateId}" not found. Available: ${this.getTemplateIds().join(', ')}`,
      );
    }
    return template;
  }

  /** Get the raw source of a template (for editing/preview). */
  getSource(templateId: string): string | undefined {
    return this.sources.get(templateId);
  }

  /**
   * Register a dynamic template from source code.
   * Used to load templates from the database at runtime.
   *
   * Security: Handlebars is compiled with default escaping (noEscape: false).
   * This means {{variable}} auto-escapes HTML. Only {{{variable}}} is raw.
   * Custom helpers are restricted to the safe set registered above.
   */
  registerTemplate(id: string, source: string): void {
    this.sources.set(id, source);
    // Compile with default settings: HTML escaping is ON
    this.cache.set(id, Handlebars.compile(source));
  }

  /**
   * Remove a dynamic template from the cache.
   * Built-in templates cannot be removed.
   */
  removeTemplate(id: string): boolean {
    if (this.isBuiltIn(id)) return false;
    this.sources.delete(id);
    return this.cache.delete(id);
  }

  /**
   * Invalidate and re-compile a template.
   * Used when a template source is updated in the database.
   */
  invalidate(id: string, newSource: string): void {
    this.sources.set(id, newSource);
    this.cache.set(id, Handlebars.compile(newSource));
  }

  /**
   * Compile a source string WITHOUT caching.
   * Used for the preview endpoint where the source is ephemeral.
   */
  compilePreview(source: string): CompiledTemplate {
    return Handlebars.compile(source);
  }
}

/**
 * Resolves template path. Checks current directory first (works with tsx and compiled),
 * then falls back to src/templates/ (for cases where dist doesn't contain .hbs files).
 */
function resolveTemplatePath(id: string): string {
  const localPath = resolve(__dirname, `${id}.hbs`);
  if (existsSync(localPath)) {
    return localPath;
  }

  const packageRoot = resolve(__dirname, '..', '..');
  const srcPath = resolve(packageRoot, 'src', 'templates', `${id}.hbs`);
  if (existsSync(srcPath)) {
    return srcPath;
  }

  throw new Error(`Template file "${id}.hbs" not found. Searched: ${localPath}, ${srcPath}`);
}

// Singleton instance — shared across the application
export const templateRegistry = new TemplateRegistry();

// Legacy exports for backward compatibility
export function getTemplateIds(): string[] {
  return templateRegistry.getTemplateIds();
}

export function getTemplate(templateId: string): CompiledTemplate {
  return templateRegistry.getTemplate(templateId);
}
