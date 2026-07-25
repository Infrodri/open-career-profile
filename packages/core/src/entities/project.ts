import { type BaseEntity, type PartialDate } from '../value-objects/index.js';

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  role?: string;
  startDate?: PartialDate;
  endDate?: PartialDate;
  url?: string;
  technologies: string[];
}
