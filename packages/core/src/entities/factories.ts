import { v4 as uuidv4 } from 'uuid';
import { type ProfessionalProfile, type ProfileSections } from './professional-profile.js';
import { type PersonalInfo } from './personal-info.js';
import { type BaseEntity } from '../value-objects/index.js';

/** Creates a new empty ProfileSections object */
function createEmptySections(): ProfileSections {
  return {
    workExperience: [],
    education: [],
    certifications: [],
    courses: [],
    languages: [],
    skills: [],
    projects: [],
    publications: [],
    awards: [],
    affiliations: [],
    volunteering: [],
    references: [],
  };
}

/** Creates a new ProfessionalProfile with generated id and timestamps */
export function createProfile(personalInfo: PersonalInfo): ProfessionalProfile {
  const now = new Date();
  return {
    id: uuidv4(),
    personalInfo,
    sections: createEmptySections(),
    createdAt: now,
    updatedAt: now,
  };
}

/** Creates a new entry (any section item) with generated id and timestamps */
export function createEntry<T extends BaseEntity>(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
  const now = new Date();
  return {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  } as T;
}
