import type { ApiResponse } from '../types/profile';

/**
 * Unwrap the API envelope `{ data, error }`.
 *
 * Every endpoint answers with that shape, including on failure, so the error
 * message from the server is preserved instead of being replaced by a generic one.
 */
export async function unwrap<T>(response: Response): Promise<T> {
  let json: ApiResponse<T> | null = null;

  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    // Non-JSON body (proxy error, crash, empty 500...)
    throw new Error(`Respuesta inválida del servidor (HTTP ${response.status})`);
  }

  if (!response.ok || json.error) {
    throw new Error(json.error?.message ?? `La petición falló (HTTP ${response.status})`);
  }

  if (json.data === null) {
    throw new Error('El servidor no devolvió datos');
  }

  return json.data;
}

/** For endpoints that answer 204 with no body. */
export async function expectNoContent(response: Response): Promise<void> {
  if (response.ok) return;

  let message = `La petición falló (HTTP ${response.status})`;
  try {
    const json = (await response.json()) as ApiResponse<unknown>;
    if (json.error?.message) message = json.error.message;
  } catch {
    // keep the default message
  }
  throw new Error(message);
}
