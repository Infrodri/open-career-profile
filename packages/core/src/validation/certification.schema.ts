import { z } from 'zod';
import { requiredStringSchema, partialDateSchema, optionalUrlSchema } from './common.schema.js';

export const certificationSchema = z.object({
  name: requiredStringSchema,
  issuer: requiredStringSchema,
  issueDate: partialDateSchema.optional(),
  expirationDate: partialDateSchema.optional(),
  verificationCode: z.string().optional(),
  verificationUrl: optionalUrlSchema,
});

export type CertificationInput = z.infer<typeof certificationSchema>;
