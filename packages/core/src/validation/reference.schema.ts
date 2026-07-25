import { z } from 'zod';
import { requiredStringSchema, optionalEmailSchema } from './common.schema.js';

export const referenceSchema = z.object({
  fullName: requiredStringSchema,
  relationship: z.string().optional(),
  institution: z.string().optional(),
  phone: z.string().optional(),
  email: optionalEmailSchema,
});

export type ReferenceInput = z.infer<typeof referenceSchema>;
