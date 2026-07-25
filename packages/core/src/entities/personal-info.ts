import { type PersonalLink } from '../value-objects/index.js';

/**
 * Personal information of the profile owner.
 * Extended for Bolivian/Latin American CVs.
 */
export interface PersonalInfo {
  fullName: string;
  profesiones: string[]; // ["Ing. Sistemas Informático", "T.S. Contador General"]
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  nacionalidad?: string;
  sexo?: string;
  estadoCivil?: string;
  summary?: string;
  photo?: string;
  birthDate?: string;
  identityDocument?: string; // CI con extensión: "5669226 Ch."
  libretaMilitar?: string;
  links: PersonalLink[];
}
