import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type CompiledTemplate = ReturnType<typeof Handlebars.compile>;

const TEMPLATE_IDS = ['standard', 'minimal'] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

const templateRegistry = new Map<string, CompiledTemplate>();

for (const id of TEMPLATE_IDS) {
  const filePath = resolve(__dirname, `${id}.hbs`);
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
