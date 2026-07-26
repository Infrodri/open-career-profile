import { describe, it, expect, vi } from 'vitest';
import { Scanner } from '../src/scanner.js';
import { type JobProvider } from '../src/interfaces/job-provider.js';
import { type RawJob, type SearchConfig } from '../src/types.js';

function createMockProvider(id: string, jobs: RawJob[], available = true): JobProvider {
  return {
    id,
    name: `Mock ${id}`,
    country: 'bo',
    isAvailable: () => available,
    fetch: vi.fn().mockResolvedValue(jobs),
  };
}

function createConfig(overrides?: Partial<SearchConfig>): SearchConfig {
  return {
    targetTitles: ['Dev'],
    locations: [],
    excludeKeywords: [],
    portals: [],
    ...overrides,
  };
}

describe('Scanner', () => {
  it('registers and lists providers', () => {
    const scanner = new Scanner();
    const provider = createMockProvider('portal_a', []);

    scanner.registerProvider(provider);

    expect(scanner.getProviderIds()).toEqual(['portal_a']);
    expect(scanner.getProviders()).toEqual([
      { id: 'portal_a', name: 'Mock portal_a', country: 'bo', available: true },
    ]);
  });

  it('scans all registered providers when no portals specified', async () => {
    const scanner = new Scanner();
    scanner.registerProvider(createMockProvider('a', [
      { title: 'Job A', company: 'X', url: 'https://a.com/1' },
    ]));
    scanner.registerProvider(createMockProvider('b', [
      { title: 'Job B', company: 'Y', url: 'https://b.com/1' },
    ]));

    const result = await scanner.scan(createConfig());

    expect(result.jobs).toHaveLength(2);
    expect(result.totalRaw).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it('scans only specified portals', async () => {
    const scanner = new Scanner();
    scanner.registerProvider(createMockProvider('a', [
      { title: 'Job A', company: 'X', url: 'https://a.com/1' },
    ]));
    scanner.registerProvider(createMockProvider('b', [
      { title: 'Job B', company: 'Y', url: 'https://b.com/1' },
    ]));

    const result = await scanner.scan(createConfig({ portals: ['a'] }));

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].portal).toBe('a');
  });

  it('reports error for unregistered portal', async () => {
    const scanner = new Scanner();

    const result = await scanner.scan(createConfig({ portals: ['nonexistent'] }));

    expect(result.jobs).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].portal).toBe('nonexistent');
  });

  it('reports error for unavailable provider', async () => {
    const scanner = new Scanner();
    scanner.registerProvider(createMockProvider('offline', [], false));

    const result = await scanner.scan(createConfig({ portals: ['offline'] }));

    expect(result.jobs).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('no disponible');
  });

  it('handles provider fetch errors gracefully', async () => {
    const scanner = new Scanner();
    const failingProvider: JobProvider = {
      id: 'broken',
      name: 'Broken Portal',
      country: 'bo',
      isAvailable: () => true,
      fetch: vi.fn().mockRejectedValue(new Error('Connection timeout')),
    };
    scanner.registerProvider(failingProvider);
    scanner.registerProvider(createMockProvider('working', [
      { title: 'Good Job', company: 'Z', url: 'https://z.com/1' },
    ]));

    const result = await scanner.scan(createConfig());

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].title).toBe('Good Job');
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].portal).toBe('broken');
    expect(result.errors[0].message).toBe('Connection timeout');
  });

  it('applies filters and deduplication', async () => {
    const scanner = new Scanner();
    scanner.registerProvider(createMockProvider('a', [
      { title: 'Ingeniero Senior', company: 'X', url: 'https://a.com/1', location: 'Sucre' },
      { title: 'Pasantía Junior', company: 'Y', url: 'https://a.com/2', location: 'Sucre' },
    ]));
    scanner.registerProvider(createMockProvider('b', [
      { title: 'Ingeniero Senior', company: 'X', url: 'https://a.com/1', location: 'Sucre' }, // duplicate
    ]));

    const result = await scanner.scan(createConfig({
      excludeKeywords: ['pasantía'],
    }));

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].title).toBe('Ingeniero Senior');
    expect(result.totalRaw).toBe(3);
    expect(result.filteredOut).toBe(2); // 1 dedup + 1 filtered
  });

  it('tags each job with the portal ID', async () => {
    const scanner = new Scanner();
    scanner.registerProvider(createMockProvider('computrabajo_bo', [
      { title: 'Dev', company: 'Co', url: 'https://ct.com/1' },
    ]));

    const result = await scanner.scan(createConfig());

    expect(result.jobs[0].portal).toBe('computrabajo_bo');
  });
});
