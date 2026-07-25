import { z } from 'zod';
import { requiredStringSchema, skillLevelSchema } from './common.schema.js';

export const skillSchema = z.object({
  name: requiredStringSchema,
  category: z.string().optional(),
  level: skillLevelSchema.optional(),
});

export type SkillInput = z.infer<typeof skillSchema>;
