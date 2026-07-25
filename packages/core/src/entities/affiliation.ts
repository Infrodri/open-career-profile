import { type BaseEntity, type PartialDate } from '../value-objects/index.js';

export interface Affiliation extends BaseEntity {
  organization: string;
  role?: string;
  startDate?: PartialDate;
  endDate?: PartialDate;
}
