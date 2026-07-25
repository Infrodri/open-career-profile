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

  async complete(prompt: string): Promise<string> {
    if (!this.isAvailable()) {
      return '[AI unavailable] Provider is not configured.';
    }

    try {
      const url = `${this.config.baseUrl}/chat/completions`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey !== '') {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const body = JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

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
      const message = error instanceof Error ? error.message : 'Unknown error';
      return `[AI error] ${message}`;
    }
  }
}
