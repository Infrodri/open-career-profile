import { z } from 'zod';
import { requiredStringSchema, partialDateSchema, partialDateOrPresentSchema } from './common.schema.js';

export const educationSchema = z.object({
  title: requiredStringSchema,
  institution: requiredStringSchema,
  startDate: partialDateSchema.optional(),
  endDate: partialDateOrPresentSchema.optional(),
  description: z.string().optional(),
  field: z.string().optional(),
});

export type EducationInput = z.infer<typeof educationSchema>;
