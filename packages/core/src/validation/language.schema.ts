import { z } from 'zod';
import { requiredStringSchema, languageLevelSchema } from './common.schema.js';

export const languageSchema = z.object({
  name: requiredStringSchema,
  level: languageLevelSchema,
  certification: z.string().optional(),
});

export type LanguageInput = z.infer<typeof languageSchema>;
