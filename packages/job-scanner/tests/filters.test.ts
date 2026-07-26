import { describe, it, expect } from 'vitest';
import { applyFilters, deduplicateJobs } from '../src/filters.js';
import { type ScannedJob, type SearchConfig } from '../src/types.js';

function createJob(overrides?: Partial<ScannedJob>): ScannedJob {
  return {
    portal: 'test_portal',
    title: 'Ingeniero de Sistemas',
    company: 'Tech Corp',
    location: 'Sucre',
    url: 'https://example.com/job/1',
    ...overrides,
  };
}

function createConfig(overrides?: Partial<SearchConfig>): SearchConfig {
  return {
    targetTitles: ['Ingeniero de Sistemas'],
    locations: [],
    excludeKeywords: [],
    portals: [],
    ...overrides,
  };
}

describe('applyFilters', () => {
  it('returns all jobs when no filters are specified', () => {
    const jobs = [createJob(), createJob({ title: 'Dev Jr' })];
    const config = createConfig();

    const result = applyFilters(jobs, config);

    expect(result).toHaveLength(2);
  });

  it('excludes jobs matching exclude keywords in title', () => {
    const jobs = [
      createJob({ title: 'Ingeniero Senior' }),
      createJob({ title: 'Pasantía en Sistemas' }),
      createJob({ title: 'Junior Developer' }),
    ];
    const config = createConfig({ excludeKeywords: ['pasantía', 'junior'] });

    const result = applyFilters(jobs, config);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Ingeniero Senior');
  });

  it('excludes jobs matching exclude keywords in description', () => {
    const jobs = [
      createJob({ title: 'Developer', description: 'Buscamos pasantía de 3 meses' }),
      createJob({ title: 'Developer', description: 'Experiencia de 5 años' }),
    ];
    const config = createConfig({ excludeKeywords: ['pasantía'] });

    const result = applyFilters(jobs, config);

    expect(result).toHaveLength(1);
  });

  it('filters by location', () => {
    const jobs = [
      createJob({ location: 'Sucre' }),
      createJob({ location: 'La Paz' }),
      createJob({ location: 'Cochabamba' }),
    ];
    const config = createConfig({ locations: ['Sucre', 'La Paz'] });

    const result = applyFilters(jobs, config);

    expect(result).toHaveLength(2);
  });

  it('includes jobs without location when location filter is active', () => {
    const jobs = [
      createJob({ location: 'Sucre' }),
      createJob({ location: undefined }),
    ];
    const config = createConfig({ locations: ['Sucre'] });

    const result = applyFilters(jobs, config);

    expect(result).toHaveLength(2);
  });

  it('matches "Remoto" location to remote-related keywords', () => {
    const jobs = [
      createJob({ location: 'Trabajo Remoto' }),
      createJob({ location: 'Remote' }),
      createJob({ location: 'Sucre (presencial)' }),
    ];
    const config = createConfig({ locations: ['Remoto'] });

    const result = applyFilters(jobs, config);

    expect(result).toHaveLength(2);
  });

  it('filters by modality remoto', () => {
    const jobs = [
      createJob({ title: 'Dev Remoto', location: 'Remoto' }),
      createJob({ title: 'Dev Presencial', location: 'Sucre' }),
    ];
    const config = createConfig({ modality: 'remoto' });

    const result = applyFilters(jobs, config);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Dev Remoto');
  });

  it('filters by modality presencial (excludes remote jobs)', () => {
    const jobs = [
      createJob({ title: 'Dev Remoto', location: 'Remoto' }),
      createJob({ title: 'Dev Presencial', location: 'Sucre' }),
    ];
    const config = createConfig({ modality: 'presencial' });

    const result = applyFilters(jobs, config);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Dev Presencial');
  });

  it('combines multiple filters', () => {
    const jobs = [
      createJob({ title: 'Ingeniero Senior', location: 'Sucre' }),
      createJob({ title: 'Junior Dev', location: 'Sucre' }),
      createJob({ title: 'Ingeniero Senior', location: 'Cochabamba' }),
    ];
    const config = createConfig({
      locations: ['Sucre'],
      excludeKeywords: ['junior'],
    });

    const result = applyFilters(jobs, config);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Ingeniero Senior');
    expect(result[0].location).toBe('Sucre');
  });
});

describe('deduplicateJobs', () => {
  it('removes duplicates by URL (case-insensitive)', () => {
    const jobs = [
      createJob({ url: 'https://example.com/job/1', title: 'Job A' }),
      createJob({ url: 'https://EXAMPLE.COM/job/1', title: 'Job A copy' }),
      createJob({ url: 'https://example.com/job/2', title: 'Job B' }),
    ];

    const result = deduplicateJobs(jobs);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Job A');
    expect(result[1].title).toBe('Job B');
  });

  it('keeps all jobs when no duplicates', () => {
    const jobs = [
      createJob({ url: 'https://a.com/1' }),
      createJob({ url: 'https://b.com/2' }),
      createJob({ url: 'https://c.com/3' }),
    ];

    const result = deduplicateJobs(jobs);

    expect(result).toHaveLength(3);
  });

  it('returns empty array for empty input', () => {
    expect(deduplicateJobs([])).toEqual([]);
  });
});
