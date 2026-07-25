import { type BaseEntity, type PartialDate, type PublicationType } from '../value-objects/index.js';

export interface Publication extends BaseEntity {
  title: string;
  type?: PublicationType;
  date?: PartialDate;
  publisher?: string;
  url?: string;
  description?: string;
}
