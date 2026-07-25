import { type BaseEntity, type PartialDate } from '../value-objects/index.js';

export interface Certification extends BaseEntity {
  name: string;
  issuer: string;
  issueDate?: PartialDate;
  expirationDate?: PartialDate;
  verificationCode?: string;
  verificationUrl?: string;
}
