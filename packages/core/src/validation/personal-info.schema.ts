import { z } from 'zod';
import { requiredStringSchema, optionalEmailSchema, personalLinkSchema } from './common.schema.js';

export const personalInfoSchema = z.object({
  fullName: requiredStringSchema,
  email: optionalEmailSchema,
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  summary: z.string().optional(),
  photo: z.string().optional(),
  links: z.array(personalLinkSchema).default([]),
  birthDate: z.string().optional(),
  identityDocument: z.string().optional(),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
