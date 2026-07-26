import * as cheerio from 'cheerio';
import { type JobProvider } from '../interfaces/job-provider.js';
import { type RawJob, type SearchConfig } from '../types.js';

const BASE_URL = 'https://www.trabajopolis.bo';

/**
 * Trabajopolis Bolivia provider.
 * Scrapes job listings from trabajopolis.bo using cheerio.
 */
export class TrabajopolisBoProvider implements JobProvider {
  readonly id = 'trabajopolis_bo';
  readonly name = 'Trabajopolis Bolivia';
  readonly country = 'bo';

  isAvailable(): boolean {
    return true;
  }

  async fetch(config: SearchConfig): Promise<RawJob[]> {
    const allJobs: RawJob[] = [];

    for (const title of config.targetTitles) {
      const jobs = await this.search(title);
      allJobs.push(...jobs);
    }

    return allJobs;
  }

  private async search(query: string): Promise<RawJob[]> {
    const url = `${BASE_URL}/buscar-trabajo?q=${encodeURIComponent(query)}`;

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

    // Trabajopolis uses various card structures
    $('.aviso, .job-card, [class*="aviso"], article').each((_i, el) => {
      const $el = $(el);
      const $link = $el.find('a[href*="/aviso/"], a[href*="/empleo/"]').first();
      const title = $el.find('h2, h3, .titulo, [class*="title"]').first().text().trim()
        || $link.text().trim();
      const company = $el.find('.empresa, [class*="company"], [class*="empresa"]').first().text().trim();
      const location = $el.find('.ubicacion, [class*="location"], [class*="ubicacion"]').first().text().trim();
      const href = $link.attr('href') ?? '';

      if (!title || title.length < 3) return;

      const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

      jobs.push({
        title,
        company: company || 'Desconocido',
        location: location || undefined,
        url: fullUrl,
      });
    });

    // Fallback: find links that look like job posts
    if (jobs.length === 0) {
      $('a[href*="/aviso/"], a[href*="/empleo/"]').each((_i, el) => {
        const $el = $(el);
        const title = $el.text().trim();
        const href = $el.attr('href') ?? '';
        if (!title || title.length < 5 || !href) return;

        jobs.push({
          title,
          company: 'Desconocido',
          url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
        });
      });
    }

    return jobs;
  }
}
