import {
  type ProfileRepository,
  type ProfessionalProfile,
  type PersonalInfo,
  type ProfileSections,
  createProfile,
  createEntry,
  createEmptySections,
  PROFILE_SECTION_KEYS,
  type BaseEntity,
} from '@ocp/core';

/** Input for creating a profile via the REST API. */
export interface CreateProfileInput {
  personalInfo: PersonalInfo;
  sections?: Partial<Record<keyof ProfileSections, Array<Record<string, unknown>>>>;
}

export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  async create(input: CreateProfileInput): Promise<ProfessionalProfile> {
    const profile = createProfile(input.personalInfo);

    if (input.sections) {
      profile.sections = this.buildSections(input.sections);
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
        ? this.buildSections(input.sections)
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

  /** Save a profile as-is (used by the import endpoint). */
  async updateDirect(profile: ProfessionalProfile): Promise<ProfessionalProfile> {
    return this.repository.update({ ...profile, updatedAt: new Date() });
  }

  /** Persist a fully constructed profile (used by the import endpoint). */
  async createDirect(profile: ProfessionalProfile): Promise<ProfessionalProfile> {
    return this.repository.create(profile);
  }

  /**
   * Build a ProfileSections from raw input, assigning ids and timestamps.
   * Unknown section keys are ignored; missing sections default to empty arrays.
   */
  private buildSections(
    raw: Partial<Record<keyof ProfileSections, Array<Record<string, unknown>>>>,
  ): ProfileSections {
    const sections = createEmptySections();

    for (const key of PROFILE_SECTION_KEYS) {
      const entries = raw[key];
      if (!Array.isArray(entries) || entries.length === 0) continue;

      (sections as any)[key] = entries.map((entry) =>
        createEntry<BaseEntity>({ ...entry, verified: entry['verified'] ?? false } as any),
      );
    }

    return sections;
  }
}
