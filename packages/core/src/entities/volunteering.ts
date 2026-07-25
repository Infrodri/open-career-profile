import { type BaseEntity, type PartialDate } from '../value-objects/index.js';

export interface Volunteering extends BaseEntity {
  organization: string;
  role?: string;
  description?: string;
  startDate?: PartialDate;
  endDate?: PartialDate;
}
