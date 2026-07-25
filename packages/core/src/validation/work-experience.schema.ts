import { z } from 'zod';
import { requiredStringSchema, partialDateSchema, partialDateOrPresentSchema } from './common.schema.js';

export const workExperienceSchema = z.object({
  position: requiredStringSchema,
  institution: requiredStringSchema,
  startDate: partialDateSchema,
  endDate: partialDateOrPresentSchema.optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).default([]),
  location: z.string().optional(),
});

export type WorkExperienceInput = z.infer<typeof workExperienceSchema>;
