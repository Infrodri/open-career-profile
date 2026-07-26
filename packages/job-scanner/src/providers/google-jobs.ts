import * as cheerio from 'cheerio';
import { type JobProvider } from '../interfaces/job-provider.js';
import { type RawJob, type SearchConfig } from '../types.js';

/**
 * Google Jobs provider.
 *
 * Searches Google for job listings using the "empleo" search operator.
 * Parses the HTML results to extract job cards. This is the most reliable
 * way to find jobs across many portals at once, including local Bolivian
 * company websites that aren't on major portals.
 *
 * Supports location filtering via the search query itself.
 */
export class GoogleJobsProvider implements JobProvider {
  readonly id = 'google_jobs';
  readonly name = 'Google Empleos';
  readonly country = 'bo';

  isAvailable(): boolean {
    return true;
  }

  async fetch(config: SearchConfig): Promise<RawJob[]> {
    const allJobs: RawJob[] = [];

    for (const title of config.targetTitles) {
      // Build search with location context
      const location = config.locations.length > 0
        ? config.locations.join(' OR ')
        : 'Bolivia';

      const jobs = await this.searchGoogle(title, location);
      allJobs.push(...jobs);
    }

    return allJobs;
  }

  private async searchGoogle(title: string, location: string): Promise<RawJob[]> {
    // Use Google search with job-focused query
    const query = `${title} empleo ${location}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=20`;

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
      return this.parseResults(html);
    } catch {
      return [];
    }
  }

  private parseResults(html: string): RawJob[] {
    const $ = cheerio.load(html);
    const jobs: RawJob[] = [];
    const seen = new Set<string>();

    // Google search results - each result is a div with a link
    $('div.g, div[data-hveid]').each((_i, el) => {
      const $el = $(el);
      const $link = $el.find('a[href^="http"]').first();
      const href = $link.attr('href') ?? '';

      // Skip Google's own URLs and common non-job sites
      if (!href || href.includes('google.com') || href.includes('youtube.com') || href.includes('wikipedia.org')) {
        return;
      }

      // Extract title from the heading
      const title = $el.find('h3').first().text().trim();
      if (!title || title.length < 5) return;

      // Skip if we already have this URL
      if (seen.has(href)) return;
      seen.add(href);

      // Try to extract a snippet/description
      const snippet = $el.find('.VwiC3b, [data-sncf], .IsZvec').first().text().trim()
        || $el.find('span').slice(1).first().text().trim();

      // Try to identify the company from the display URL or cite
      const displayUrl = $el.find('cite').first().text().trim();
      const company = extractCompanyFromUrl(displayUrl) || extractCompanyFromTitle(title);

      jobs.push({
        title: cleanTitle(title),
        company: company || 'Ver en el enlace',
        url: href,
        description: snippet || undefined,
        location: undefined, // Google doesn't always show location
      });
    });

    return jobs.slice(0, 15); // Limit to avoid noise
  }
}

/** Extract a company name from a display URL like "www.empresa.com.bo › ..." */
function extractCompanyFromUrl(displayUrl: string): string {
  if (!displayUrl) return '';
  const match = displayUrl.match(/(?:www\.)?([^.]+)\.(com|org|net|bo|gob)/);
  if (match?.[1]) {
    const name = match[1].replace(/-/g, ' ');
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return '';
}

/** Try to extract company from titles like "Empleo en Empresa X - ..." */
function extractCompanyFromTitle(title: string): string {
  const match = title.match(/(?:en|para|@)\s+(.+?)(?:\s*[-–|]|$)/i);
  return match?.[1]?.trim() ?? '';
}

/** Clean up a search result title (remove site names, etc.) */
function cleanTitle(title: string): string {
  // Remove common suffixes like "- CompuTrabajo", "| Indeed", etc.
  return title.replace(/\s*[-–|]\s*(CompuTrabajo|Indeed|LinkedIn|Trabajopolis|empleos?).*$/i, '').trim();
}
