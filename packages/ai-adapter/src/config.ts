import { type AiProviderConfig } from './interfaces/ai-provider.js';

/**
 * Reads AI provider configuration from environment variables.
 *
 * Every value is trimmed on read, and a trailing slash is stripped from the
 * base URL so path concatenation never produces a double slash.
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
  const publicUrl = readTrimmed('OCP_PUBLIC_URL');

  return {
    // A trailing newline or space survives copy-paste into hosting dashboards
    // and breaks DNS resolution, so every value is trimmed on read.
    baseUrl: stripTrailingSlash(readTrimmed('OCP_AI_BASE_URL') ?? 'http://localhost:11434/v1'),
    apiKey: readTrimmed('OCP_AI_API_KEY') ?? '',
    model: readTrimmed('OCP_AI_MODEL') ?? 'llama3',
    maxTokens: parseIntOrDefault(readTrimmed('OCP_AI_MAX_TOKENS'), 1000),
    temperature: parseFloatOrDefault(readTrimmed('OCP_AI_TEMPERATURE'), 0.7),
    ...(publicUrl !== undefined ? { publicUrl } : {}),
  };
}

/** Read an env var, trimming whitespace. Returns undefined when absent or blank. */
function readTrimmed(name: string): string | undefined {
  const raw = process.env[name];
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  return trimmed === '' ? undefined : trimmed;
}

/** Remove a trailing slash so path concatenation never produces a double slash. */
function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
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
