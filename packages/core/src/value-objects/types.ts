/**
 * Common value object types used across the domain.
 */

/** Unique identifier (UUID v4) */
export type EntityId = string;

/** ISO date string in partial formats: YYYY, YYYY-MM, or YYYY-MM-DD */
export type PartialDate = string;

/** Time period with optional start and end */
export interface TimePeriod {
  start?: PartialDate;
  end?: PartialDate | 'present';
}

/** Language proficiency levels */
export const LANGUAGE_LEVELS = ['basic', 'intermediate', 'advanced', 'native'] as const;
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

/** Skill proficiency levels */
export const SKILL_LEVELS = ['basic', 'intermediate', 'advanced', 'expert'] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

/** Publication types */
export const PUBLICATION_TYPES = ['article', 'book', 'talk', 'paper', 'other'] as const;
export type PublicationType = (typeof PUBLICATION_TYPES)[number];

/** Base timestamps for all entities */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

/** Base entity with id and timestamps */
export interface BaseEntity extends Timestamps {
  id: EntityId;
}
