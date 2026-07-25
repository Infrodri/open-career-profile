import { type BaseEntity, type PartialDate } from '../value-objects/index.js';

export interface Education extends BaseEntity {
  title: string;
  institution: string;
  startDate?: PartialDate;
  endDate?: PartialDate | 'present';
  description?: string;
  field?: string;
}
