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
 *
 * Security note: error messages returned by this adapter are always
 * sanitized. Native fetch() embeds the target URL in some failures, so
 * echoing a raw error would leak the configured base URL — which, when
 * misconfigured, may contain an API key.
 */
export class OpenAiCompatibleAdapter implements AiProvider {
  private readonly config: AiProviderConfig;

  constructor(config: AiProviderConfig) {
    this.config = config;
  }

  /**
   * Whether the provider is usable.
   *
   * The base URL must be a real HTTP(S) URL. A value that is not a URL
   * (for example an API key pasted into OCP_AI_BASE_URL) counts as
   * "not configured", so no request is ever built from it.
   */
  isAvailable(): boolean {
    const hasHttpBaseUrl =
      this.config.baseUrl.startsWith('http://') || this.config.baseUrl.startsWith('https://');

    return hasHttpBaseUrl && this.config.model !== '';
  }

  /**
   * Quick connectivity check: calls the provider with a trivial prompt.
   * Returns ok=true if the provider answers, even if the answer is garbage.
   */
  async checkConnection(): Promise<{ ok: boolean; model: string; error?: string }> {
    if (!this.isAvailable()) {
      return {
        ok: false,
        model: this.config.model,
        error: 'Proveedor de IA no configurado. Revisa OCP_AI_BASE_URL y OCP_AI_MODEL.',
      };
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
      });

      if (!response.ok) {
        return {
          ok: false,
          model: this.config.model,
          error: `El proveedor respondió HTTP ${response.status}.`,
        };
      }

      return { ok: true, model: this.config.model };
    } catch (error: unknown) {
      return { ok: false, model: this.config.model, error: this.safeErrorMessage(error) };
    }
  }

  async complete(prompt: string): Promise<string> {
    if (!this.isAvailable()) {
      return '[AI unavailable] Provider is not configured.';
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000); // 60s timeout

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        // The provider's own error body is safe to surface, but keep it short.
        const detail = await response.text().catch(() => '');
        return `[AI error] HTTP ${response.status}: ${detail.slice(0, 200)}`;
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
      return `[AI error] ${this.safeErrorMessage(error)}`;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Map an unknown error to a message that is safe to return to a caller.
   * The raw message is never included: fetch() embeds the target URL in
   * several failure modes, and that URL may hold a misconfigured secret.
   */
  private safeErrorMessage(error: unknown): string {
    const raw = error instanceof Error ? error.message : '';

    if (raw.includes('Failed to parse URL') || raw.includes('Invalid URL')) {
      return 'La URL del proveedor de IA no es válida. Revisa OCP_AI_BASE_URL.';
    }
    if (
      raw.includes('ENOTFOUND') ||
      raw.includes('EAI_AGAIN') ||
      raw.includes('getaddrinfo')
    ) {
      return 'No se pudo resolver el host del proveedor de IA. Revisa OCP_AI_BASE_URL.';
    }
    if (raw.includes('ECONNREFUSED')) {
      return 'El proveedor de IA rechazó la conexión.';
    }
    if (raw.includes('certificate') || raw.includes('CERT_')) {
      return 'Error de certificado TLS al conectar con el proveedor de IA.';
    }

    return 'No se pudo conectar con el proveedor de IA.';
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey !== '') {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    // OpenRouter uses these headers for attribution of the calling app.
    if (this.config.baseUrl.includes('openrouter.ai')) {
      headers['HTTP-Referer'] = this.config.publicUrl ?? 'http://localhost:3000';
      headers['X-Title'] = 'Open Career Profile';
    }

    return headers;
  }
}
