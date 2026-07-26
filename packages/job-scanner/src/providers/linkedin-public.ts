import * as cheerio from 'cheerio';
import { type JobProvider } from '../interfaces/job-provider.js';
import { type RawJob, type SearchConfig } from '../types.js';

const BASE_URL = 'https://www.linkedin.com/jobs/search';

/**
 * LinkedIn Public Jobs provider.
 * Searches LinkedIn's public job listings (no login required).
 * Uses the guest-accessible job search page.
 */
export class LinkedInPublicProvider implements JobProvider {
  readonly id = 'linkedin_public';
  readonly name = 'LinkedIn (Público)';
  readonly country = 'international';

  isAvailable(): boolean {
    return true;
  }

  async fetch(config: SearchConfig): Promise<RawJob[]> {
    const allJobs: RawJob[] = [];

    for (const title of config.targetTitles) {
      const location = config.locations.length > 0 ? config.locations[0] : 'Bolivia';
      const jobs = await this.search(title, location ?? 'Bolivia');
      allJobs.push(...jobs);
    }

    return allJobs;
  }

  private async search(keywords: string, location: string): Promise<RawJob[]> {
    const url = `${BASE_URL}?keywords=${encodeURIComponent(keywords)}&location=${encodeURIComponent(location)}&f_TPR=r604800&position=1&pageNum=0`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'es-BO,es;q=0.9',
        },
      });

      if (!response.ok) return [];

      const html = await response.text();
      return this.parseListings(html);
    } catch {
      return [];
    }
  }

  private parseListings(html: string): RawJob[] {
    const $ = cheerio.load(html);
    const jobs: RawJob[] = [];

    // LinkedIn public job cards
    $('li .base-card, .job-search-card, [data-entity-urn]').each((_i, el) => {
      const $el = $(el);
      const title = $el.find('.base-search-card__title, h3').first().text().trim();
      const company = $el.find('.base-search-card__subtitle, h4').first().text().trim();
      const location = $el.find('.job-search-card__location').first().text().trim();
      const href = $el.find('a').first().attr('href') ?? '';
      const date = $el.find('time').first().attr('datetime') ?? $el.find('time').first().text().trim();

      if (!title || title.length < 3 || !href) return;

      jobs.push({
        title,
        company: company || 'Desconocido',
        location: location || undefined,
        url: href.startsWith('http') ? href.split('?')[0]! : `https://www.linkedin.com${href.split('?')[0]}`,
        postedDate: date || undefined,
      });
    });

    return jobs;
  }
}
