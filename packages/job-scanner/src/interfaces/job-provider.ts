import { type RawJob, type SearchConfig } from '../types.js';

/**
 * Port for a job portal provider.
 * Each provider knows how to fetch job listings from a specific portal.
 *
 * Providers do NOT use AI tokens — they scrape or call public APIs directly.
 */
export interface JobProvider {
  /** Unique identifier for this provider (e.g., "computrabajo_bo"). */
  id: string;
  /** Human-readable name (e.g., "CompuTrabajo Bolivia"). */
  name: string;
  /** Country code or "international". */
  country: string;
  /** Whether this provider is currently operational. */
  isAvailable(): boolean;
  /** Fetch raw job listings from the portal matching the search config. */
  fetch(config: SearchConfig): Promise<RawJob[]>;
}
