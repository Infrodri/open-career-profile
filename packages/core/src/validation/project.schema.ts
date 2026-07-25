import { z } from 'zod';
import { requiredStringSchema, partialDateSchema, optionalUrlSchema } from './common.schema.js';

export const projectSchema = z.object({
  name: requiredStringSchema,
  description: z.string().optional(),
  role: z.string().optional(),
  startDate: partialDateSchema.optional(),
  endDate: partialDateSchema.optional(),
  url: optionalUrlSchema,
  technologies: z.array(z.string()).default([]),
});

export type ProjectInput = z.infer<typeof projectSchema>;
