import { PrismaClient } from '@prisma/client';
import { type ProfileRepository, type ProfessionalProfile } from '@ocp/core';
import { toDomain, profileIncludeAll } from './mappers/profile.mapper.js';

export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(profile: ProfessionalProfile): Promise<ProfessionalProfile> {
    const result = await this.prisma.profile.create({
      data: {
        id: profile.id,
        fullName: profile.personalInfo.fullName,
        email: profile.personalInfo.email ?? null,
        phone: profile.personalInfo.phone ?? null,
        city: profile.personalInfo.city ?? null,
        country: profile.personalInfo.country ?? null,
        summary: profile.personalInfo.summary ?? null,
        photo: profile.personalInfo.photo ?? null,
        birthDate: profile.personalInfo.birthDate ?? null,
        identityDocument: profile.personalInfo.identityDocument ?? null,
        links: {
          create: profile.personalInfo.links.map((l) => ({
            label: l.label,
            url: l.url,
          })),
        },
        workExperience: {
          create: profile.sections.workExperience.map((e) => ({
            id: e.id,
            position: e.position,
            institution: e.institution,
            startDate: e.startDate,
            endDate: e.endDate ?? null,
            description: e.description ?? null,
            achievements: e.achievements,
            location: e.location ?? null,
          })),
        },
        education: {
          create: profile.sections.education.map((e) => ({
            id: e.id,
            title: e.title,
            institution: e.institution,
            startDate: e.startDate ?? null,
            endDate: e.endDate ?? null,
            description: e.description ?? null,
            field: e.field ?? null,
          })),
        },
        certifications: {
          create: profile.sections.certifications.map((e) => ({
            id: e.id,
            name: e.name,
            issuer: e.issuer,
            issueDate: e.issueDate ?? null,
            expirationDate: e.expirationDate ?? null,
            verificationCode: e.verificationCode ?? null,
            verificationUrl: e.verificationUrl ?? null,
          })),
        },
        courses: {
          create: profile.sections.courses.map((e) => ({
            id: e.id,
            name: e.name,
            institution: e.institution ?? null,
            completionDate: e.completionDate ?? null,
            duration: e.duration ?? null,
            description: e.description ?? null,
          })),
        },
        languages: {
          create: profile.sections.languages.map((e) => ({
            id: e.id,
            name: e.name,
            level: e.level,
            certification: e.certification ?? null,
          })),
        },
        skills: {
          create: profile.sections.skills.map((e) => ({
            id: e.id,
            name: e.name,
            category: e.category ?? null,
            level: e.level ?? null,
          })),
        },
        projects: {
          create: profile.sections.projects.map((e) => ({
            id: e.id,
            name: e.name,
            description: e.description ?? null,
            role: e.role ?? null,
            startDate: e.startDate ?? null,
            endDate: e.endDate ?? null,
            url: e.url ?? null,
            technologies: e.technologies,
          })),
        },
        publications: {
          create: profile.sections.publications.map((e) => ({
            id: e.id,
            title: e.title,
            type: e.type ?? null,
            date: e.date ?? null,
            publisher: e.publisher ?? null,
            url: e.url ?? null,
            description: e.description ?? null,
          })),
        },
        awards: {
          create: profile.sections.awards.map((e) => ({
            id: e.id,
            name: e.name,
            issuer: e.issuer ?? null,
            date: e.date ?? null,
            description: e.description ?? null,
          })),
        },
        affiliations: {
          create: profile.sections.affiliations.map((e) => ({
            id: e.id,
            organization: e.organization,
            role: e.role ?? null,
            startDate: e.startDate ?? null,
            endDate: e.endDate ?? null,
          })),
        },
        volunteering: {
          create: profile.sections.volunteering.map((e) => ({
            id: e.id,
            organization: e.organization,
            role: e.role ?? null,
            description: e.description ?? null,
            startDate: e.startDate ?? null,
            endDate: e.endDate ?? null,
          })),
        },
        references: {
          create: profile.sections.references.map((e) => ({
            id: e.id,
            fullName: e.fullName,
            relationship: e.relationship ?? null,
            institution: e.institution ?? null,
            phone: e.phone ?? null,
            email: e.email ?? null,
          })),
        },
      },
      include: profileIncludeAll,
    });

    return toDomain(result);
  }

  async findById(id: string): Promise<ProfessionalProfile | null> {
    const result = await this.prisma.profile.findUnique({
      where: { id },
      include: profileIncludeAll,
    });

    if (!result) return null;
    return toDomain(result);
  }

  async update(profile: ProfessionalProfile): Promise<ProfessionalProfile> {
    // Strategy: delete all related records and recreate them.
    // This is simpler than diffing and handles all cases correctly.
    await this.prisma.$transaction([
      this.prisma.profileLink.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.workExperience.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.education.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.certification.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.course.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.language.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.skill.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.project.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.publication.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.award.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.affiliation.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.volunteering.deleteMany({ where: { profileId: profile.id } }),
      this.prisma.reference.deleteMany({ where: { profileId: profile.id } }),
    ]);

    const result = await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        fullName: profile.personalInfo.fullName,
        email: profile.personalInfo.email ?? null,
        phone: profile.personalInfo.phone ?? null,
        city: profile.personalInfo.city ?? null,
        country: profile.personalInfo.country ?? null,
        summary: profile.personalInfo.summary ?? null,
        photo: profile.personalInfo.photo ?? null,
        birthDate: profile.personalInfo.birthDate ?? null,
        identityDocument: profile.personalInfo.identityDocument ?? null,
        links: {
          create: profile.personalInfo.links.map((l) => ({
            label: l.label,
            url: l.url,
          })),
        },
        workExperience: {
          create: profile.sections.workExperience.map((e) => ({
            id: e.id,
            position: e.position,
            institution: e.institution,
            startDate: e.startDate,
            endDate: e.endDate ?? null,
            description: e.description ?? null,
            achievements: e.achievements,
            location: e.location ?? null,
          })),
        },
        education: {
          create: profile.sections.education.map((e) => ({
            id: e.id,
            title: e.title,
            institution: e.institution,
            startDate: e.startDate ?? null,
            endDate: e.endDate ?? null,
            description: e.description ?? null,
            field: e.field ?? null,
          })),
        },
        certifications: {
          create: profile.sections.certifications.map((e) => ({
            id: e.id,
            name: e.name,
            issuer: e.issuer,
            issueDate: e.issueDate ?? null,
            expirationDate: e.expirationDate ?? null,
            verificationCode: e.verificationCode ?? null,
            verificationUrl: e.verificationUrl ?? null,
          })),
        },
        courses: {
          create: profile.sections.courses.map((e) => ({
            id: e.id,
            name: e.name,
            institution: e.institution ?? null,
            completionDate: e.completionDate ?? null,
            duration: e.duration ?? null,
            description: e.description ?? null,
          })),
        },
        languages: {
          create: profile.sections.languages.map((e) => ({
            id: e.id,
            name: e.name,
            level: e.level,
            certification: e.certification ?? null,
          })),
        },
        skills: {
          create: profile.sections.skills.map((e) => ({
            id: e.id,
            name: e.name,
            category: e.category ?? null,
            level: e.level ?? null,
          })),
        },
        projects: {
          create: profile.sections.projects.map((e) => ({
            id: e.id,
            name: e.name,
            description: e.description ?? null,
            role: e.role ?? null,
            startDate: e.startDate ?? null,
            endDate: e.endDate ?? null,
            url: e.url ?? null,
            technologies: e.technologies,
          })),
        },
        publications: {
          create: profile.sections.publications.map((e) => ({
            id: e.id,
            title: e.title,
            type: e.type ?? null,
            date: e.date ?? null,
            publisher: e.publisher ?? null,
            url: e.url ?? null,
            description: e.description ?? null,
          })),
        },
        awards: {
          create: profile.sections.awards.map((e) => ({
            id: e.id,
            name: e.name,
            issuer: e.issuer ?? null,
            date: e.date ?? null,
            description: e.description ?? null,
          })),
        },
        affiliations: {
          create: profile.sections.affiliations.map((e) => ({
            id: e.id,
            organization: e.organization,
            role: e.role ?? null,
            startDate: e.startDate ?? null,
            endDate: e.endDate ?? null,
          })),
        },
        volunteering: {
          create: profile.sections.volunteering.map((e) => ({
            id: e.id,
            organization: e.organization,
            role: e.role ?? null,
            description: e.description ?? null,
            startDate: e.startDate ?? null,
            endDate: e.endDate ?? null,
          })),
        },
        references: {
          create: profile.sections.references.map((e) => ({
            id: e.id,
            fullName: e.fullName,
            relationship: e.relationship ?? null,
            institution: e.institution ?? null,
            phone: e.phone ?? null,
            email: e.email ?? null,
          })),
        },
      },
      include: profileIncludeAll,
    });

    return toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.profile.delete({ where: { id } });
  }
}
