import { unwrap, expectNoContent } from './http';

// --- Types ---

export interface JobSearchConfig {
  id: string;
  profileId: string;
  targetTitles: string[];
  locations: string[];
  modality?: string;
  minSalary?: number;
  excludeKeywords: string[];
  portals: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobListing {
  id: string;
  configId: string;
  portal: string;
  externalId?: string;
  title: string;
  company: string;
  location?: string;
  salary?: string;
  url: string;
  description?: string;
  postedDate?: string;
  score?: number;
  matchSummary?: string;
  skillGaps: string[];
  recommendation?: 'apply' | 'maybe' | 'skip';
  status: 'new' | 'evaluated' | 'applied' | 'rejected' | 'saved';
  cvGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScanResult {
  totalFound: number;
  afterFilters: number;
  newListings: number;
  errors: Array<{ portal: string; message: string }>;
}

export interface JobEvaluation {
  score: number;
  matchSummary: string;
  skillGaps: string[];
  recommendation: 'apply' | 'maybe' | 'skip';
}

export interface CreateConfigPayload {
  targetTitles: string[];
  locations: string[];
  modality?: string;
  minSalary?: number;
  excludeKeywords: string[];
  portals: string[];
}

// --- API calls ---

export async function listJobConfigs(profileId: string): Promise<JobSearchConfig[]> {
  const res = await fetch(`/api/profiles/${profileId}/job-configs`);
  return unwrap<JobSearchConfig[]>(res);
}

export async function createJobConfig(profileId: string, data: CreateConfigPayload): Promise<JobSearchConfig> {
  const res = await fetch(`/api/profiles/${profileId}/job-configs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return unwrap<JobSearchConfig>(res);
}

export async function deleteJobConfig(configId: string): Promise<void> {
  const res = await fetch(`/api/job-configs/${configId}`, { method: 'DELETE' });
  return expectNoContent(res);
}

export async function scanJobs(configId: string): Promise<ScanResult> {
  const res = await fetch(`/api/job-configs/${configId}/scan`, { method: 'POST' });
  return unwrap<ScanResult>(res);
}

export async function listJobListings(configId: string): Promise<JobListing[]> {
  const res = await fetch(`/api/job-configs/${configId}/listings`);
  return unwrap<JobListing[]>(res);
}

export async function evaluateJob(listingId: string): Promise<JobEvaluation> {
  const res = await fetch(`/api/listings/${listingId}/evaluate`, { method: 'POST' });
  return unwrap<JobEvaluation>(res);
}

export async function updateListingStatus(listingId: string, status: string): Promise<JobListing> {
  const res = await fetch(`/api/listings/${listingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return unwrap<JobListing>(res);
}
