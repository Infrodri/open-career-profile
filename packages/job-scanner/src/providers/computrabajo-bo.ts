import * as cheerio from 'cheerio';
import { type JobProvider } from '../interfaces/job-provider.js';
import { type RawJob, type SearchConfig } from '../types.js';

const BASE_URL = 'https://www.computrabajo.com.bo';
const MAX_PAGES = 3;

/**
 * CompuTrabajo Bolivia provider.
 *
 * Scrapes job listings from computrabajo.com.bo using cheerio.
 * Does NOT use AI — pure HTML parsing. Zero tokens.
 *
 * CompuTrabajo uses server-rendered HTML with a predictable structure,
 * making it a good candidate for cheerio-based scraping.
 */
export class ComputrabajoBoProvider implements JobProvider {
  readonly id = 'computrabajo_bo';
  readonly name = 'CompuTrabajo Bolivia';
  readonly country = 'bo';

  isAvailable(): boolean {
    return true;
  }

  async fetch(config: SearchConfig): Promise<RawJob[]> {
    const allJobs: RawJob[] = [];

    // Search for each target title
    for (const title of config.targetTitles) {
      const jobs = await this.searchByTitle(title);
      allJobs.push(...jobs);
    }

    return allJobs;
  }

  private async searchByTitle(query: string): Promise<RawJob[]> {
    const jobs: RawJob[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      const pageJobs = await this.fetchPage(query, page);
      if (pageJobs.length === 0) break;
      jobs.push(...pageJobs);
    }

    return jobs;
  }

  private async fetchPage(query: string, page: number): Promise<RawJob[]> {
    const searchTerm = encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'));
    const url = page === 1
      ? `${BASE_URL}/trabajo-de-${searchTerm}`
      : `${BASE_URL}/trabajo-de-${searchTerm}?p=${page}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'es-BO,es;q=0.9',
        },
      });

      if (!response.ok) {
        return [];
      }

      const html = await response.text();
      return this.parseListingsPage(html);
    } catch {
      return [];
    }
  }

  /**
   * Parse the listings page HTML and extract job cards.
   *
   * CompuTrabajo uses a structure like:
   * <article class="box_offer">
   *   <a href="/oferta-de-trabajo/..." class="js-o-link">
   *     <h2 class="title_offer">Job Title</h2>
   *   </a>
   *   <p class="fs16 fc_base">Company Name</p>
   *   <p class="fs13 fc_aux">City | Date</p>
   * </article>
   *
   * Note: The exact selectors may vary as the site updates.
   * This implementation is best-effort and handles missing elements gracefully.
   */
  parseListingsPage(html: string): RawJob[] {
    const $ = cheerio.load(html);
    const jobs: RawJob[] = [];

    // CompuTrabajo uses different structures. Try the known selectors.
    const selectors = [
      'article.box_offer',
      '.box_offer',
      '[data-job]',
      '.iO',
    ];

    let articles: ReturnType<typeof $> | null = null;
    for (const sel of selectors) {
      const found = $(sel);
      if (found.length > 0) {
        articles = found;
        break;
      }
    }

    if (!articles || articles.length === 0) {
      // Fallback: try to find links that look like job offers
      $('a[href*="/oferta-de-trabajo/"]').each((_i, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        const title = $el.text().trim();
        if (href && title && title.length > 3) {
          jobs.push({
            title,
            company: 'Desconocido',
            url: href.startsWith('http') ? href : `${BASE_URL}${href}`,
          });
        }
      });
      return jobs;
    }

    articles.each((_i, el) => {
      const $article = $(el);

      // Try to find the job link and title
      const $link = $article.find('a[href*="/oferta-de-trabajo/"], a.js-o-link, h2 a').first();
      const $title = $article.find('h2, .title_offer, [class*="title"]').first();

      const href = $link.attr('href') ?? '';
      const title = ($title.text() || $link.text()).trim();

      if (!title || title.length < 3) return;

      // Company name: usually in a <p> or <span> after the title
      const company = $article.find('p.fs16, .fc_base, [class*="company"]').first().text().trim()
        || $article.find('p').first().text().trim()
        || 'Desconocido';

      // Location and date: usually in a secondary paragraph
      const metaText = $article.find('p.fs13, .fc_aux, [class*="location"]').first().text().trim();
      const location = metaText.split('|')[0]?.trim() || undefined;
      const postedDate = metaText.split('|')[1]?.trim() || undefined;

      const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;

      // Extract external ID from URL
      const externalId = href.match(/oferta-de-trabajo-([^/]+)/)?.[1] ?? undefined;

      jobs.push({
        externalId,
        title,
        company: company || 'Desconocido',
        location,
        url: fullUrl,
        postedDate,
      });
    });

    return jobs;
  }
}
