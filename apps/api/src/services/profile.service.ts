import {
  type ProfileRepository,
  type ProfessionalProfile,
  type CreateProfileInput,
  createProfile,
  createEntry,
  type WorkExperience,
  type Education,
  type Certification,
  type Course,
  type Language,
  type Skill,
  type Project,
  type Publication,
  type Award,
  type Affiliation,
  type Volunteering,
  type Reference,
} from '@ocp/core';

export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  async create(input: CreateProfileInput): Promise<ProfessionalProfile> {
    const profile = createProfile(input.personalInfo);

    if (input.sections) {
      profile.sections = {
        workExperience: (input.sections.workExperience || []).map((e) => createEntry<WorkExperience>(e)),
        education: (input.sections.education || []).map((e) => createEntry<Education>(e)),
        certifications: (input.sections.certifications || []).map((e) => createEntry<Certification>(e)),
        courses: (input.sections.courses || []).map((e) => createEntry<Course>(e)),
        languages: (input.sections.languages || []).map((e) => createEntry<Language>(e)),
        skills: (input.sections.skills || []).map((e) => createEntry<Skill>(e)),
        projects: (input.sections.projects || []).map((e) => createEntry<Project>(e)),
        publications: (input.sections.publications || []).map((e) => createEntry<Publication>(e)),
        awards: (input.sections.awards || []).map((e) => createEntry<Award>(e)),
        affiliations: (input.sections.affiliations || []).map((e) => createEntry<Affiliation>(e)),
        volunteering: (input.sections.volunteering || []).map((e) => createEntry<Volunteering>(e)),
        references: (input.sections.references || []).map((e) => createEntry<Reference>(e)),
      };
    }

    return this.repository.create(profile);
  }

  async findById(id: string): Promise<ProfessionalProfile | null> {
    return this.repository.findById(id);
  }

  async update(id: string, input: CreateProfileInput): Promise<ProfessionalProfile | null> {
    const existing = await this.repository.findById(id);
    if (!existing) return null;

    const updated: ProfessionalProfile = {
      ...existing,
      personalInfo: input.personalInfo,
      sections: input.sections
        ? {
            workExperience: (input.sections.workExperience || []).map((e) => createEntry<WorkExperience>(e)),
            education: (input.sections.education || []).map((e) => createEntry<Education>(e)),
            certifications: (input.sections.certifications || []).map((e) => createEntry<Certification>(e)),
            courses: (input.sections.courses || []).map((e) => createEntry<Course>(e)),
            languages: (input.sections.languages || []).map((e) => createEntry<Language>(e)),
            skills: (input.sections.skills || []).map((e) => createEntry<Skill>(e)),
            projects: (input.sections.projects || []).map((e) => createEntry<Project>(e)),
            publications: (input.sections.publications || []).map((e) => createEntry<Publication>(e)),
            awards: (input.sections.awards || []).map((e) => createEntry<Award>(e)),
            affiliations: (input.sections.affiliations || []).map((e) => createEntry<Affiliation>(e)),
            volunteering: (input.sections.volunteering || []).map((e) => createEntry<Volunteering>(e)),
            references: (input.sections.references || []).map((e) => createEntry<Reference>(e)),
          }
        : existing.sections,
      updatedAt: new Date(),
    };

    return this.repository.update(updated);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) return false;

    await this.repository.delete(id);
    return true;
  }
}
