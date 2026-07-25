import { z } from 'zod';
import { requiredStringSchema, partialDateSchema } from './common.schema.js';

export const awardSchema = z.object({
  name: requiredStringSchema,
  issuer: z.string().optional(),
  date: partialDateSchema.optional(),
  description: z.string().optional(),
});

export type AwardInput = z.infer<typeof awardSchema>;
