import { type BaseEntity, type PartialDate } from '../value-objects/index.js';

export interface Course extends BaseEntity {
  name: string;
  institution?: string;
  completionDate?: PartialDate;
  duration?: string;
  description?: string;
}
