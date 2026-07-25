import { type AiProvider, type AiProviderConfig } from './interfaces/ai-provider.js';

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * AI adapter that works with any OpenAI-compatible API.
 * Supports OpenAI, Ollama, OpenRouter, Together, and others.
 *
 * Uses native fetch() — no external SDK required.
 */
export class OpenAiCompatibleAdapter implements AiProvider {
  private readonly config: AiProviderConfig;

  constructor(config: AiProviderConfig) {
    this.config = config;
  }

  isAvailable(): boolean {
    return this.config.baseUrl !== '' && this.config.model !== '';
  }

  /**
   * Quick connectivity check: calls the provider with a trivial prompt.
   * Returns true if the provider answers (even if the answer is garbage).
   */
  async checkConnection(): Promise<{ ok: boolean; model: string; error?: string }> {
    if (!this.isAvailable()) {
      return { ok: false, model: this.config.model, error: 'Provider not configured' };
    }

    try {
      const url = `${this.config.baseUrl}/chat/completions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        return { ok: false, model: this.config.model, error: `HTTP ${response.status}: ${text.slice(0, 200)}` };
      }

      return { ok: true, model: this.config.model };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { ok: false, model: this.config.model, error: message };
    }
  }

  async complete(prompt: string): Promise<string> {
    if (!this.isAvailable()) {
      return '[AI unavailable] Provider is not configured.';
    }

    try {
      const url = `${this.config.baseUrl}/chat/completions`;

      const body = JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000); // 60s timeout

      const response = await fetch(url, {
        method: 'POST',
        headers: this.buildHeaders(),
        body,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        return `[AI error] HTTP ${response.status}: ${errorText}`;
      }

      const data = (await response.json()) as ChatCompletionResponse;
      const content = data.choices[0]?.message.content;

      if (content === undefined || content === null) {
        return '[AI error] No content in response.';
      }

      return content;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return '[AI error] La IA tardó demasiado en responder (timeout 60s).';
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      return `[AI error] ${message}`;
    }
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey !== '') {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    // OpenRouter requires these headers for attribution.
    if (this.config.baseUrl.includes('openrouter.ai')) {
      headers['HTTP-Referer'] = 'http://localhost:3000';
      headers['X-Title'] = 'Open Career Profile';
    }

    return headers;
  }
}
