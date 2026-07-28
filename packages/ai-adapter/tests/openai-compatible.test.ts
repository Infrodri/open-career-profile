import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenAiCompatibleAdapter } from '../src/openai-compatible.adapter.js';
import { getAiConfig } from '../src/config.js';
import { type AiProviderConfig } from '../src/interfaces/ai-provider.js';

describe('OpenAiCompatibleAdapter', () => {
  const validConfig: AiProviderConfig = {
    baseUrl: 'http://localhost:11434/v1',
    apiKey: '',
    model: 'llama3',
    maxTokens: 1000,
    temperature: 0.7,
  };

  describe('isAvailable', () => {
    it('returns true when baseUrl and model are configured', () => {
      const adapter = new OpenAiCompatibleAdapter(validConfig);
      expect(adapter.isAvailable()).toBe(true);
    });

    it('returns false when baseUrl is empty', () => {
      const adapter = new OpenAiCompatibleAdapter({ ...validConfig, baseUrl: '' });
      expect(adapter.isAvailable()).toBe(false);
    });

    it('returns false when model is empty', () => {
      const adapter = new OpenAiCompatibleAdapter({ ...validConfig, model: '' });
      expect(adapter.isAvailable()).toBe(false);
    });

    it('returns true when apiKey is empty (Ollama scenario)', () => {
      const adapter = new OpenAiCompatibleAdapter({ ...validConfig, apiKey: '' });
      expect(adapter.isAvailable()).toBe(true);
    });
  });

  describe('complete', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns AI unavailable message when provider is not configured', async () => {
      const adapter = new OpenAiCompatibleAdapter({ ...validConfig, baseUrl: '' });
      const result = await adapter.complete('Hello');
      expect(result).toContain('[AI unavailable]');
    });

    it('sends correct request to the API', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Hello back!' } }],
        }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const adapter = new OpenAiCompatibleAdapter(validConfig);
      const result = await adapter.complete('Hello');

      expect(fetch).toHaveBeenCalledWith('http://localhost:11434/v1/chat/completions', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      }));
      expect(result).toBe('Hello back!');
    });

    it('includes Authorization header when apiKey is provided', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'response' } }],
        }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

      const configWithKey: AiProviderConfig = {
        ...validConfig,
        apiKey: 'sk-test-key',
      };
      const adapter = new OpenAiCompatibleAdapter(configWithKey);
      await adapter.complete('Hello');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer sk-test-key',
          },
        }),
      );
    });

    it('handles HTTP error responses gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const adapter = new OpenAiCompatibleAdapter(validConfig);
      const result = await adapter.complete('Hello');

      expect(result).toContain('[AI error]');
      expect(result).toContain('500');
    });

    it('handles network/fetch errors gracefully without leaking details', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Connection refused'));

      const adapter = new OpenAiCompatibleAdapter(validConfig);
      const result = await adapter.complete('Hello');

      expect(result).toContain('[AI error]');
      // The raw message must never reach the caller: it can embed the URL.
      expect(result).not.toContain('Connection refused');
    });

    it('classifies a wrapped cause when fetch reports a generic failure', async () => {
      // Node wraps network errors: message is "fetch failed", cause holds the code.
      const wrapped = new TypeError('fetch failed');
      (wrapped as { cause?: unknown }).cause = Object.assign(new Error('getaddrinfo ENOTFOUND'), {
        code: 'ENOTFOUND',
      });
      vi.mocked(fetch).mockRejectedValue(wrapped);

      const adapter = new OpenAiCompatibleAdapter(validConfig);
      const result = await adapter.complete('Hello');

      expect(result).toContain('OCP_AI_BASE_URL');
    });

    it('never echoes the base URL when it is misconfigured', async () => {
      // Simulates an API key pasted into OCP_AI_BASE_URL.
      const adapter = new OpenAiCompatibleAdapter({
        ...validConfig,
        baseUrl: 'sk-or-v1-secret-value',
      });

      const result = await adapter.complete('Hello');

      expect(result).not.toContain('sk-or-v1-secret-value');
      expect(result).toContain('[AI unavailable]');
    });


    it('handles empty choices in response', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ choices: [] }),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const adapter = new OpenAiCompatibleAdapter(validConfig);
      const result = await adapter.complete('Hello');

      expect(result).toContain('[AI error]');
    });
  });
});

describe('getAiConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubEnv('OCP_AI_BASE_URL', undefined as unknown as string);
    vi.stubEnv('OCP_AI_API_KEY', undefined as unknown as string);
    vi.stubEnv('OCP_AI_MODEL', undefined as unknown as string);
    vi.stubEnv('OCP_AI_MAX_TOKENS', undefined as unknown as string);
    vi.stubEnv('OCP_AI_TEMPERATURE', undefined as unknown as string);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns default values when env vars are not set', () => {
    const config = getAiConfig();

    expect(config.baseUrl).toBe('http://localhost:11434/v1');
    expect(config.apiKey).toBe('');
    expect(config.model).toBe('llama3');
    expect(config.maxTokens).toBe(1000);
    expect(config.temperature).toBe(0.7);
  });

  it('reads values from environment variables', () => {
    vi.stubEnv('OCP_AI_BASE_URL', 'https://api.openai.com/v1');
    vi.stubEnv('OCP_AI_API_KEY', 'sk-test');
    vi.stubEnv('OCP_AI_MODEL', 'gpt-4o-mini');
    vi.stubEnv('OCP_AI_MAX_TOKENS', '2000');
    vi.stubEnv('OCP_AI_TEMPERATURE', '0.5');

    const config = getAiConfig();

    expect(config.baseUrl).toBe('https://api.openai.com/v1');
    expect(config.apiKey).toBe('sk-test');
    expect(config.model).toBe('gpt-4o-mini');
    expect(config.maxTokens).toBe(2000);
    expect(config.temperature).toBe(0.5);
  });

  it('trims whitespace from values pasted into hosting dashboards', () => {
    vi.stubEnv('OCP_AI_BASE_URL', '  https://openrouter.ai/api/v1\n');
    vi.stubEnv('OCP_AI_MODEL', ' openai/gpt-4o-mini ');

    const config = getAiConfig();

    expect(config.baseUrl).toBe('https://openrouter.ai/api/v1');
    expect(config.model).toBe('openai/gpt-4o-mini');
  });

  it('strips a trailing slash from the base URL', () => {
    vi.stubEnv('OCP_AI_BASE_URL', 'https://openrouter.ai/api/v1/');

    expect(getAiConfig().baseUrl).toBe('https://openrouter.ai/api/v1');
  });

  it('treats a blank value as absent and applies the default', () => {
    vi.stubEnv('OCP_AI_MODEL', '   ');

    expect(getAiConfig().model).toBe('llama3');
  });

  it('uses defaults for invalid numeric values', () => {
    vi.stubEnv('OCP_AI_MAX_TOKENS', 'not-a-number');
    vi.stubEnv('OCP_AI_TEMPERATURE', 'invalid');

    const config = getAiConfig();

    expect(config.maxTokens).toBe(1000);
    expect(config.temperature).toBe(0.7);
  });
});
