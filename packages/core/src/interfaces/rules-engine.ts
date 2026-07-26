import { type ProfileSections, type ProfessionalProfile } from '../entities/professional-profile.js';

// =============================================================================
// Institutional Rule Set — defines how a profile must be presented for an
// institution or employer. Stored as JSON in the InstitutionalTemplate model.
// =============================================================================

/**
 * A set of rules that determine which parts of a profile are required,
 * how they should be ordered, and what constraints apply to the output.
 */
export interface InstitutionalRuleSet {
  /** Sections that MUST be present and non-empty. Keys are ProfileSections keys. */
  requiredSections: Array<keyof ProfileSections>;

  /** Sections to include in the output. Empty array means "include all". */
  includeSections: Array<keyof ProfileSections>;

  /** Sections to explicitly exclude from the output. */
  excludeSections: Array<keyof ProfileSections>;

  /** If true, only entries with `verified: true` are included. */
  onlyVerified: boolean;

  /** If true, the profile must include a photo. */
  requirePhoto: boolean;

  /** Maximum number of pages allowed. Undefined means no limit. */
  maxPages?: number;

  /** Maximum character length for the summary field. */
  maxSummaryLength?: number;

  /** Custom notes or instructions for the user (displayed as warnings/info). */
  notes?: string;
}

// =============================================================================
// Validation Result — the outcome of validating a profile against rules.
// =============================================================================

/** Severity level for individual validation issues. */
export const VALIDATION_SEVERITY = ['error', 'warning', 'info'] as const;
export type ValidationSeverity = (typeof VALIDATION_SEVERITY)[number];

/** A single validation issue found by the rules engine. */
export interface ValidationIssue {
  severity: ValidationSeverity;
  /** Machine-readable code, e.g. 'MISSING_SECTION', 'SUMMARY_TOO_LONG'. */
  code: string;
  /** Human-readable message in Spanish. */
  message: string;
  /** The section key or field path this issue refers to. */
  field?: string;
}

/** The complete result of a validation pass. */
export interface ValidationResult {
  /** Whether the profile satisfies ALL required rules (no errors). */
  valid: boolean;
  /** Individual issues found during validation. */
  issues: ValidationIssue[];
}

// =============================================================================
// Rules Engine Port — the contract that implementations must satisfy.
// =============================================================================

/**
 * Port for the rules engine.
 * The domain defines WHAT it expects; the adapter provides HOW.
 */
export interface RulesEngine {
  /**
   * Validate a profile against a rule set.
   * Returns issues but does NOT modify the profile.
   */
  validate(profile: ProfessionalProfile, rules: InstitutionalRuleSet): ValidationResult;

  /**
   * Apply rules to produce a transformed VIEW of the profile.
   * The original profile is NEVER mutated.
   *
   * Transformations:
   * - Remove excluded sections
   * - Filter to included sections only
   * - Remove unverified entries if onlyVerified is set
   * - Truncate summary if maxSummaryLength is set
   */
  applyRules(profile: ProfessionalProfile, rules: InstitutionalRuleSet): ProfessionalProfile;
}
