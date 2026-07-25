import { type ProfessionalProfile } from '../entities/professional-profile.js';

/**
 * Port for profile persistence.
 * Implementations (adapters) will provide the actual storage mechanism.
 */
export interface ProfileRepository {
  create(profile: ProfessionalProfile): Promise<ProfessionalProfile>;
  findById(id: string): Promise<ProfessionalProfile | null>;
  update(profile: ProfessionalProfile): Promise<ProfessionalProfile>;
  delete(id: string): Promise<void>;
}
