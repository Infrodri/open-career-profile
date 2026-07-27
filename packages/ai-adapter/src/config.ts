import { type AiProviderConfig } from './interfaces/ai-provider.js';

/**
 * Reads AI provider configuration from environment variables.
 *
 * Environment variables:
 * - OCP_AI_BASE_URL: API base URL (default: "http://localhost:11434/v1" for Ollama)
 * - OCP_AI_API_KEY: API key (default: "" — empty for local providers)
 * - OCP_AI_MODEL: Model name (default: "llama3")
 * - OCP_AI_MAX_TOKENS: Max tokens for response (default: 1000)
 * - OCP_AI_TEMPERATURE: Temperature for generation (default: 0.7)
 * - OCP_PUBLIC_URL: Public deployment URL, used for provider attribution
 */
export function getAiConfig(): AiProviderConfig {
  const publicUrl = process.env['OCP_PUBLIC_URL'];

  return {
    baseUrl: process.env['OCP_AI_BASE_URL'] ?? 'http://localhost:11434/v1',
    apiKey: process.env['OCP_AI_API_KEY'] ?? '',
    model: process.env['OCP_AI_MODEL'] ?? 'llama3',
    maxTokens: parseIntOrDefault(process.env['OCP_AI_MAX_TOKENS'], 1000),
    temperature: parseFloatOrDefault(process.env['OCP_AI_TEMPERATURE'], 0.7),
    ...(publicUrl !== undefined && publicUrl !== '' ? { publicUrl } : {}),
  };
}

function parseIntOrDefault(value: string | undefined, defaultValue: number): number {
  if (value === undefined || value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

function parseFloatOrDefault(value: string | undefined, defaultValue: number): number {
  if (value === undefined || value === '') return defaultValue;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}
