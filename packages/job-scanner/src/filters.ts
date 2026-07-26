import { type RawJob, type ScannedJob, type SearchConfig } from './types.js';

/**
 * Apply search filters to raw job listings.
 * Returns only jobs that match the user's criteria.
 */
export function applyFilters(jobs: ScannedJob[], config: SearchConfig): ScannedJob[] {
  return jobs.filter((job) => {
    // Exclude by keywords in title or description
    if (matchesExcludeKeywords(job, config.excludeKeywords)) {
      return false;
    }

    // Filter by location if locations are specified
    if (config.locations.length > 0 && !matchesLocation(job, config.locations)) {
      return false;
    }

    // Filter by modality if specified
    if (config.modality && !matchesModality(job, config.modality)) {
      return false;
    }

    return true;
  });
}

/**
 * Deduplicate jobs by URL. If two jobs have the same URL, keep the first one.
 */
export function deduplicateJobs(jobs: ScannedJob[]): ScannedJob[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const normalizedUrl = job.url.toLowerCase().trim();
    if (seen.has(normalizedUrl)) {
      return false;
    }
    seen.add(normalizedUrl);
    return true;
  });
}

/** Check if a job matches any of the exclude keywords (case-insensitive). */
function matchesExcludeKeywords(job: RawJob, excludeKeywords: string[]): boolean {
  if (excludeKeywords.length === 0) return false;

  const searchText = `${job.title} ${job.description ?? ''}`.toLowerCase();
  return excludeKeywords.some((kw) => searchText.includes(kw.toLowerCase()));
}

/** Check if a job matches any of the specified locations (case-insensitive). */
function matchesLocation(job: ScannedJob, locations: string[]): boolean {
  if (!job.location) {
    // If job has no location info, include it (might be remote)
    return true;
  }

  const jobLocation = job.location.toLowerCase();
  return locations.some((loc) => {
    const target = loc.toLowerCase();
    // "Remoto" matches jobs mentioning remote/remoto
    if (target === 'remoto') {
      return jobLocation.includes('remoto') || jobLocation.includes('remote');
    }
    return jobLocation.includes(target);
  });
}

/** Check if a job matches the specified modality. */
function matchesModality(job: ScannedJob, modality: string): boolean {
  const searchText = `${job.title} ${job.location ?? ''} ${job.description ?? ''}`.toLowerCase();

  switch (modality) {
    case 'remoto':
      return searchText.includes('remoto') || searchText.includes('remote') || searchText.includes('teletrabajo');
    case 'presencial':
      return !searchText.includes('remoto') && !searchText.includes('remote');
    case 'hibrido':
      return searchText.includes('híbrido') || searchText.includes('hibrido') || searchText.includes('hybrid');
    default:
      return true;
  }
}
