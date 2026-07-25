import { z } from 'zod';
import { requiredStringSchema, partialDateSchema } from './common.schema.js';

export const affiliationSchema = z.object({
  organization: requiredStringSchema,
  role: z.string().optional(),
  startDate: partialDateSchema.optional(),
  endDate: partialDateSchema.optional(),
});

export type AffiliationInput = z.infer<typeof affiliationSchema>;
