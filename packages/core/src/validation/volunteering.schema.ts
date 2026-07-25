import { z } from 'zod';
import { requiredStringSchema, partialDateSchema } from './common.schema.js';

export const volunteeringSchema = z.object({
  organization: requiredStringSchema,
  role: z.string().optional(),
  description: z.string().optional(),
  startDate: partialDateSchema.optional(),
  endDate: partialDateSchema.optional(),
});

export type VolunteeringInput = z.infer<typeof volunteeringSchema>;
