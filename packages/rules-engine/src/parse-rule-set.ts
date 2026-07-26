import { type InstitutionalRuleSet, PROFILE_SECTION_KEYS, type ProfileSections } from '@ocp/core';

/**
 * Parse a raw JSON object (from Prisma's Json field) into a typed InstitutionalRuleSet.
 * Handles missing or malformed fields gracefully by using defaults.
 *
 * This is the bridge between the flexible JSON stored in the database and the
 * strictly typed interface the rules engine expects.
 */
export function parseRuleSet(raw: unknown): InstitutionalRuleSet {
  if (raw === null || raw === undefined || typeof raw !== 'object') {
    return createDefaultRuleSet();
  }

  const obj = raw as Record<string, unknown>;

  return {
    requiredSections: parseSectionArray(obj['requiredSections']),
    includeSections: parseSectionArray(obj['includeSections']),
    excludeSections: parseSectionArray(obj['excludeSections']),
    onlyVerified: typeof obj['onlyVerified'] === 'boolean' ? obj['onlyVerified'] : false,
    requirePhoto: typeof obj['requirePhoto'] === 'boolean' ? obj['requirePhoto'] : false,
    maxPages: parsePositiveInt(obj['maxPages']),
    maxSummaryLength: parsePositiveInt(obj['maxSummaryLength']),
    notes: typeof obj['notes'] === 'string' && obj['notes'].trim() !== '' ? obj['notes'] : undefined,
  };
}

function createDefaultRuleSet(): InstitutionalRuleSet {
  return {
    requiredSections: [],
    includeSections: [],
    excludeSections: [],
    onlyVerified: false,
    requirePhoto: false,
  };
}

const VALID_SECTION_KEYS = new Set<string>(PROFILE_SECTION_KEYS);

function parseSectionArray(value: unknown): Array<keyof ProfileSections> {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is keyof ProfileSections =>
      typeof item === 'string' && VALID_SECTION_KEYS.has(item),
  );
}

function parsePositiveInt(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  return undefined;
}
