import { type JobProvider } from './interfaces/job-provider.js';
import { type ScanError, type ScanResult, type ScannedJob, type SearchConfig } from './types.js';
import { applyFilters, deduplicateJobs } from './filters.js';

/**
 * The Scanner orchestrates multiple JobProviders.
 *
 * It runs providers in parallel, collects results, applies filters,
 * deduplicates, and returns a unified ScanResult.
 *
 * Zero-token: no AI is involved here. Providers use fetch/scraping.
 */
export class Scanner {
  private readonly providers: Map<string, JobProvider> = new Map();

  /** Register a provider. Can be called multiple times to add providers. */
  registerProvider(provider: JobProvider): void {
    this.providers.set(provider.id, provider);
  }

  /** Get all registered provider IDs. */
  getProviderIds(): string[] {
    return [...this.providers.keys()];
  }

  /** Get provider info for display. */
  getProviders(): Array<{ id: string; name: string; country: string; available: boolean }> {
    return [...this.providers.values()].map((p) => ({
      id: p.id,
      name: p.name,
      country: p.country,
      available: p.isAvailable(),
    }));
  }

  /**
   * Scan all configured portals (or a subset) and return filtered results.
   *
   * Providers that fail are skipped (non-fatal). Their errors are reported
   * in the result so the UI can inform the user.
   */
  async scan(config: SearchConfig): Promise<ScanResult> {
    // Determine which providers to run
    const providerIds = config.portals.length > 0
      ? config.portals
      : [...this.providers.keys()];

    const errors: ScanError[] = [];
    const allRawJobs: ScannedJob[] = [];

    // Run providers concurrently
    const results = await Promise.allSettled(
      providerIds.map(async (portalId) => {
        const provider = this.providers.get(portalId);
        if (!provider) {
          errors.push({ portal: portalId, message: `Provider "${portalId}" no registrado` });
          return [];
        }

        if (!provider.isAvailable()) {
          errors.push({ portal: portalId, message: `Provider "${provider.name}" no disponible` });
          return [];
        }

        try {
          const rawJobs = await provider.fetch(config);
          return rawJobs.map((job): ScannedJob => ({ ...job, portal: portalId }));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error desconocido';
          errors.push({ portal: portalId, message });
          return [];
        }
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allRawJobs.push(...result.value);
      }
    }

    const totalRaw = allRawJobs.length;

    // Deduplicate first (same URL from different providers)
    const unique = deduplicateJobs(allRawJobs);

    // Apply user filters
    const filtered = applyFilters(unique, config);

    return {
      jobs: filtered,
      errors,
      totalRaw,
      filteredOut: totalRaw - filtered.length,
    };
  }
}
