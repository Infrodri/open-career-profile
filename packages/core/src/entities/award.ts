import { type BaseEntity, type PartialDate } from '../value-objects/index.js';

export interface Award extends BaseEntity {
  name: string;
  issuer?: string;
  date?: PartialDate;
  description?: string;
}
