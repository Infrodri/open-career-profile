// @ocp/job-scanner — Job portal scanner (zero-token)

export { Scanner } from './scanner.js';
export { applyFilters, deduplicateJobs } from './filters.js';
export { type JobProvider } from './interfaces/job-provider.js';
export { ComputrabajoBoProvider } from './providers/index.js';
export {
  type SearchConfig,
  type RawJob,
  type ScannedJob,
  type ScanResult,
  type ScanError,
} from './types.js';
