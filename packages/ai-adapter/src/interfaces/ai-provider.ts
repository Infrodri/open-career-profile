/**
 * Port for AI text generation.
 * Implementations (adapters) provide the actual AI provider connection.
 */
export interface AiProvider {
  /** Generate a text completion from a prompt */
  complete(prompt: string): Promise<string>;

  /** Check if the provider is available/configured */
  isAvailable(): boolean;
}

export interface AiProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}
