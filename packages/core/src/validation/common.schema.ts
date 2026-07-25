import { z } from 'zod';
import { LANGUAGE_LEVELS, SKILL_LEVELS, PUBLICATION_TYPES } from '../value-objects/index.js';

/** Partial date: YYYY, YYYY-MM, or YYYY-MM-DD */
export const partialDateSchema = z
  .string()
  .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'Invalid date format. Use YYYY, YYYY-MM, or YYYY-MM-DD');

/** Partial date or "present" */
export const partialDateOrPresentSchema = z.union([partialDateSchema, z.literal('present')]);

/** Email validation (optional) */
export const optionalEmailSchema = z.string().email('Invalid email format').optional();

/** URL validation (optional) */
export const optionalUrlSchema = z.string().url('Invalid URL format').optional();

/** Non-empty string */
export const requiredStringSchema = z.string().min(1, 'Field cannot be empty');

/** Language level enum */
export const languageLevelSchema = z.enum(LANGUAGE_LEVELS);

/** Skill level enum */
export const skillLevelSchema = z.enum(SKILL_LEVELS);

/** Publication type enum */
export const publicationTypeSchema = z.enum(PUBLICATION_TYPES);

/** Personal link */
export const personalLinkSchema = z.object({
  label: requiredStringSchema,
  url: z.string().url('Invalid URL'),
});
