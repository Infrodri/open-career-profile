import { type BaseEntity } from '../value-objects/index.js';

export interface Reference extends BaseEntity {
  fullName: string;
  relationship?: string;
  institution?: string;
  phone?: string;
  email?: string;
}
