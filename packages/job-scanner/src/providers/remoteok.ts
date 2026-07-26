import { type JobProvider } from '../interfaces/job-provider.js';
import { type RawJob, type SearchConfig } from '../types.js';

const API_URL = 'https://remoteok.com/api';

interface RemoteOkJob {
  id: string;
  slug: string;
  company: string;
  position: string;
  location: string;
  tags: string[];
  url: string;
  date: string;
  salary_min?: number;
  salary_max?: number;
}

/**
 * RemoteOK provider.
 * Uses their public JSON API (no scraping needed).
 * Returns remote jobs worldwide.
 */
export class RemoteOkProvider implements JobProvider {
  readonly id = 'remoteok';
  readonly name = 'RemoteOK';
  readonly country = 'international';

  isAvailable(): boolean {
    return true;
  }

  async fetch(config: SearchConfig): Promise<RawJob[]> {
    try {
      const response = await fetch(API_URL, {
        headers: {
          'User-Agent': 'OpenCareerProfile/1.0',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) return [];

      const data = (await response.json()) as unknown[];

      // First element is metadata, rest are jobs
      const jobs = data.slice(1) as RemoteOkJob[];

      // Filter by target titles
      const titleKeywords = config.targetTitles.map((t) => t.toLowerCase());

      return jobs
        .filter((job) => {
          const searchText = `${job.position} ${job.tags?.join(' ') ?? ''}`.toLowerCase();
          return titleKeywords.some((kw) => searchText.includes(kw));
        })
        .slice(0, 30) // Limit results
        .map((job): RawJob => ({
          externalId: job.id ?? job.slug,
          title: job.position,
          company: job.company,
          location: job.location || 'Remote',
          url: job.url || `https://remoteok.com/remote-jobs/${job.slug}`,
          postedDate: job.date,
          salary: job.salary_min && job.salary_max
            ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
            : undefined,
        }));
    } catch {
      return [];
    }
  }
}
