export interface PersonalLink {
  label: string;
  url: string;
}

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

export interface WorkExperience {
  id: string;
  position: string;
  institution: string;
  startDate: string;
  endDate?: string;
  description?: string;
  achievements: string[];
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: string;
  title: string;
  institution: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  field?: string;
  createdAt: string;
  updatedAt: string;
}

export type SkillLevel = 'basic' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  id: string;
  name: string;
  category?: string;
  level?: SkillLevel;
  createdAt: string;
  updatedAt: string;
}

export type LanguageLevel = 'basic' | 'intermediate' | 'advanced' | 'native';

export interface Language {
  id: string;
  name: string;
  level: LanguageLevel;
  certification?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  expirationDate?: string;
  verificationCode?: string;
  verificationUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileSections {
  workExperience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  courses: unknown[];
  languages: Language[];
  skills: Skill[];
  projects: unknown[];
  publications: unknown[];
  awards: unknown[];
  affiliations: unknown[];
  volunteering: unknown[];
  references: unknown[];
}

export interface ProfessionalProfile {
  id: string;
  personalInfo: PersonalInfo;
  sections: ProfileSections;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown[];
}

/**
 * Envelope returned by every API endpoint.
 * Must mirror ApiResponse in apps/api/src/middleware/error-handler.ts:
 * exactly one of `data` / `error` is non-null.
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

/** Kinds of document the system recognises. Mirrors DOCUMENT_TYPES in @ocp/core. */
export type DocumentType = 'certificado' | 'titulo' | 'contrato' | 'hoja_de_vida' | 'otro';

/** Profile sections evidence can point at. Mirrors SECTION_TYPES in @ocp/core. */
export type SectionType =
  | 'workExperience'
  | 'education'
  | 'certifications'
  | 'courses'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'publications'
  | 'awards'
  | 'affiliations'
  | 'volunteering'
  | 'references';

/** An uploaded file kept as the source of truth behind profile entries. */
export interface StoredDocument {
  id: string;
  /** Absent while the document has not been imported into a profile yet. */
  profileId?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  documentType?: DocumentType;
  extractedText?: string;
  createdAt: string;
  updatedAt: string;
}

/** Link between a document and one specific profile entry. */
export interface Evidence {
  id: string;
  documentId: string;
  sectionType: SectionType;
  entryId: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfilePayload {
  personalInfo: PersonalInfo;
  sections: {
    workExperience: Omit<WorkExperience, 'id' | 'createdAt' | 'updatedAt'>[];
    education: Omit<Education, 'id' | 'createdAt' | 'updatedAt'>[];
    skills: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>[];
    certifications: Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>[];
    languages: Omit<Language, 'id' | 'createdAt' | 'updatedAt'>[];
    courses: unknown[];
    projects: unknown[];
    publications: unknown[];
    awards: unknown[];
    affiliations: unknown[];
    volunteering: unknown[];
    references: unknown[];
  };
}

export interface OutputRequest {
  templateId: string;
  format: 'html' | 'pdf';
}
