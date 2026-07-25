import { type PersonalLink } from '../value-objects/index.js';

export interface PersonalInfo {
  fullName: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  summary?: string;
  photo?: string;
  links: PersonalLink[];
  birthDate?: string;
  identityDocument?: string;
}
