import { z } from 'zod';
import { requiredStringSchema, partialDateSchema } from './common.schema.js';

export const courseSchema = z.object({
  name: requiredStringSchema,
  institution: z.string().optional(),
  completionDate: partialDateSchema.optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
});

export type CourseInput = z.infer<typeof courseSchema>;
