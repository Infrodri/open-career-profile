import { type BaseEntity, type PartialDate } from '../value-objects/index.js';

export interface WorkExperience extends BaseEntity {
  position: string;
  institution: string;
  startDate: PartialDate;
  endDate?: PartialDate | 'present';
  description?: string;
  achievements: string[];
  location?: string;
}
