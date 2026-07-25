import { type ProfessionalProfile, type PersonalInfo, type ProfileSections } from '@ocp/core';

/**
 * Maps a Prisma profile (with all relations) to a domain ProfessionalProfile.
 */
export function toDomain(prismaProfile: PrismaProfileFull): ProfessionalProfile {
  const personalInfo: PersonalInfo = {
    fullName: prismaProfile.fullName,
    email: prismaProfile.email ?? undefined,
    phone: prismaProfile.phone ?? undefined,
    city: prismaProfile.city ?? undefined,
    country: prismaProfile.country ?? undefined,
    summary: prismaProfile.summary ?? undefined,
    photo: prismaProfile.photo ?? undefined,
    birthDate: prismaProfile.birthDate ?? undefined,
    identityDocument: prismaProfile.identityDocument ?? undefined,
    links: prismaProfile.links.map((l) => ({ label: l.label, url: l.url })),
  };

  const sections: ProfileSections = {
    workExperience: prismaProfile.workExperience.map((e) => ({
      id: e.id,
      position: e.position,
      institution: e.institution,
      startDate: e.startDate,
      endDate: e.endDate ?? undefined,
      description: e.description ?? undefined,
      achievements: e.achievements,
      location: e.location ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    education: prismaProfile.education.map((e) => ({
      id: e.id,
      title: e.title,
      institution: e.institution,
      startDate: e.startDate ?? undefined,
      endDate: e.endDate ?? undefined,
      description: e.description ?? undefined,
      field: e.field ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    certifications: prismaProfile.certifications.map((e) => ({
      id: e.id,
      name: e.name,
      issuer: e.issuer,
      issueDate: e.issueDate ?? undefined,
      expirationDate: e.expirationDate ?? undefined,
      verificationCode: e.verificationCode ?? undefined,
      verificationUrl: e.verificationUrl ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    courses: prismaProfile.courses.map((e) => ({
      id: e.id,
      name: e.name,
      institution: e.institution ?? undefined,
      completionDate: e.completionDate ?? undefined,
      duration: e.duration ?? undefined,
      description: e.description ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    languages: prismaProfile.languages.map((e) => ({
      id: e.id,
      name: e.name,
      level: e.level as 'basic' | 'intermediate' | 'advanced' | 'native',
      certification: e.certification ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    skills: prismaProfile.skills.map((e) => ({
      id: e.id,
      name: e.name,
      category: e.category ?? undefined,
      level: e.level as 'basic' | 'intermediate' | 'advanced' | 'expert' | undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    projects: prismaProfile.projects.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description ?? undefined,
      role: e.role ?? undefined,
      startDate: e.startDate ?? undefined,
      endDate: e.endDate ?? undefined,
      url: e.url ?? undefined,
      technologies: e.technologies,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    publications: prismaProfile.publications.map((e) => ({
      id: e.id,
      title: e.title,
      type: e.type as 'article' | 'book' | 'talk' | 'paper' | 'other' | undefined,
      date: e.date ?? undefined,
      publisher: e.publisher ?? undefined,
      url: e.url ?? undefined,
      description: e.description ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    awards: prismaProfile.awards.map((e) => ({
      id: e.id,
      name: e.name,
      issuer: e.issuer ?? undefined,
      date: e.date ?? undefined,
      description: e.description ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    affiliations: prismaProfile.affiliations.map((e) => ({
      id: e.id,
      organization: e.organization,
      role: e.role ?? undefined,
      startDate: e.startDate ?? undefined,
      endDate: e.endDate ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    volunteering: prismaProfile.volunteering.map((e) => ({
      id: e.id,
      organization: e.organization,
      role: e.role ?? undefined,
      description: e.description ?? undefined,
      startDate: e.startDate ?? undefined,
      endDate: e.endDate ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
    references: prismaProfile.references.map((e) => ({
      id: e.id,
      fullName: e.fullName,
      relationship: e.relationship ?? undefined,
      institution: e.institution ?? undefined,
      phone: e.phone ?? undefined,
      email: e.email ?? undefined,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
  };

  return {
    id: prismaProfile.id,
    personalInfo,
    sections,
    createdAt: prismaProfile.createdAt,
    updatedAt: prismaProfile.updatedAt,
  };
}

/**
 * Type representing a Prisma profile with all relations included.
 * This avoids importing generated Prisma types directly into the mapper signature.
 */
export interface PrismaProfileFull {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  summary: string | null;
  photo: string | null;
  birthDate: string | null;
  identityDocument: string | null;
  createdAt: Date;
  updatedAt: Date;
  links: Array<{ id: string; label: string; url: string }>;
  workExperience: Array<{ id: string; position: string; institution: string; startDate: string; endDate: string | null; description: string | null; achievements: string[]; location: string | null; createdAt: Date; updatedAt: Date }>;
  education: Array<{ id: string; title: string; institution: string; startDate: string | null; endDate: string | null; description: string | null; field: string | null; createdAt: Date; updatedAt: Date }>;
  certifications: Array<{ id: string; name: string; issuer: string; issueDate: string | null; expirationDate: string | null; verificationCode: string | null; verificationUrl: string | null; createdAt: Date; updatedAt: Date }>;
  courses: Array<{ id: string; name: string; institution: string | null; completionDate: string | null; duration: string | null; description: string | null; createdAt: Date; updatedAt: Date }>;
  languages: Array<{ id: string; name: string; level: string; certification: string | null; createdAt: Date; updatedAt: Date }>;
  skills: Array<{ id: string; name: string; category: string | null; level: string | null; createdAt: Date; updatedAt: Date }>;
  projects: Array<{ id: string; name: string; description: string | null; role: string | null; startDate: string | null; endDate: string | null; url: string | null; technologies: string[]; createdAt: Date; updatedAt: Date }>;
  publications: Array<{ id: string; title: string; type: string | null; date: string | null; publisher: string | null; url: string | null; description: string | null; createdAt: Date; updatedAt: Date }>;
  awards: Array<{ id: string; name: string; issuer: string | null; date: string | null; description: string | null; createdAt: Date; updatedAt: Date }>;
  affiliations: Array<{ id: string; organization: string; role: string | null; startDate: string | null; endDate: string | null; createdAt: Date; updatedAt: Date }>;
  volunteering: Array<{ id: string; organization: string; role: string | null; description: string | null; startDate: string | null; endDate: string | null; createdAt: Date; updatedAt: Date }>;
  references: Array<{ id: string; fullName: string; relationship: string | null; institution: string | null; phone: string | null; email: string | null; createdAt: Date; updatedAt: Date }>;
}

/** Include object for Prisma queries to fetch all relations */
export const profileIncludeAll = {
  links: true,
  workExperience: true,
  education: true,
  certifications: true,
  courses: true,
  languages: true,
  skills: true,
  projects: true,
  publications: true,
  awards: true,
  affiliations: true,
  volunteering: true,
  references: true,
} as const;
