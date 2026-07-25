import { type BaseEntity, type LanguageLevel } from '../value-objects/index.js';

export interface Language extends BaseEntity {
  name: string;
  level: LanguageLevel;
  certification?: string;
}
