import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type CompiledTemplate = ReturnType<typeof Handlebars.compile>;

const TEMPLATE_IDS = ['standard', 'minimal'] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

const templateRegistry = new Map<string, CompiledTemplate>();

/**
 * Resolves template path. Checks current directory first (works with tsx and compiled),
 * then falls back to src/templates/ (for cases where dist doesn't contain .hbs files).
 */
function resolveTemplatePath(id: string): string {
  // Try relative to current file location (works in both tsx and compiled modes)
  const localPath = resolve(__dirname, `${id}.hbs`);
  if (existsSync(localPath)) {
    return localPath;
  }

  // Fallback: look in src/templates/ from package root
  const packageRoot = resolve(__dirname, '..', '..');
  const srcPath = resolve(packageRoot, 'src', 'templates', `${id}.hbs`);
  if (existsSync(srcPath)) {
    return srcPath;
  }

  throw new Error(`Template file "${id}.hbs" not found. Searched: ${localPath}, ${srcPath}`);
}

for (const id of TEMPLATE_IDS) {
  const filePath = resolveTemplatePath(id);
  const source = readFileSync(filePath, 'utf-8');
  templateRegistry.set(id, Handlebars.compile(source));
}

/**
 * Returns all available template IDs.
 */
export function getTemplateIds(): readonly string[] {
  return TEMPLATE_IDS;
}

/**
 * Retrieves a compiled Handlebars template by its ID.
 * @throws Error if the template ID is not found in the registry.
 */
export function getTemplate(templateId: string): CompiledTemplate {
  const template = templateRegistry.get(templateId);
  if (!template) {
    throw new Error(
      `Template "${templateId}" not found. Available templates: ${TEMPLATE_IDS.join(', ')}`,
    );
  }
  return template;
}
