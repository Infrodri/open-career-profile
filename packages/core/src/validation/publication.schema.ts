import { z } from 'zod';
import { requiredStringSchema, partialDateSchema, optionalUrlSchema, publicationTypeSchema } from './common.schema.js';

export const publicationSchema = z.object({
  title: requiredStringSchema,
  type: publicationTypeSchema.optional(),
  date: partialDateSchema.optional(),
  publisher: z.string().optional(),
  url: optionalUrlSchema,
  description: z.string().optional(),
});

export type PublicationInput = z.infer<typeof publicationSchema>;
