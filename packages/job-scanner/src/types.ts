/**
 * Types for the job scanner system.
 * These are internal to the scanner — the API layer maps them to Prisma models.
 */

/** Configuration for a job search scan. */
export interface SearchConfig {
  /** Target job titles to look for. */
  targetTitles: string[];
  /** Target locations (cities, "Remoto", etc). */
  locations: string[];
  /** Work modality filter. */
  modality?: 'presencial' | 'remoto' | 'hibrido';
  /** Minimum salary (in local currency units). */
  minSalary?: number;
  /** Keywords that should exclude a listing. */
  excludeKeywords: string[];
  /** Which portals to scan (provider IDs). */
  portals: string[];
}

/** A raw job listing as returned by a provider before filtering. */
export interface RawJob {
  /** Provider-specific external ID. */
  externalId?: string;
  /** Job title. */
  title: string;
  /** Company name. */
  company: string;
  /** Job location (city, "Remoto", etc). */
  location?: string;
  /** Salary as text (varies by portal). */
  salary?: string;
  /** URL to the original listing. */
  url: string;
  /** Full job description text (if available in the listing page). */
  description?: string;
  /** When the job was posted (ISO date or relative text). */
  postedDate?: string;
}

/** A job listing after scanning, tagged with the provider. */
export interface ScannedJob extends RawJob {
  /** Provider ID that found this job. */
  portal: string;
}

/** Result of a full scan across one or more providers. */
export interface ScanResult {
  /** Jobs that passed the filters. */
  jobs: ScannedJob[];
  /** Errors from individual providers (non-fatal — scan continues). */
  errors: ScanError[];
  /** How many total raw listings were found before filtering. */
  totalRaw: number;
  /** How many were filtered out. */
  filteredOut: number;
}

/** An error from a specific provider during scanning. */
export interface ScanError {
  portal: string;
  message: string;
}
