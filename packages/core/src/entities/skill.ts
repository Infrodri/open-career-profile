import { type BaseEntity, type SkillLevel } from '../value-objects/index.js';

export interface Skill extends BaseEntity {
  name: string;
  category?: string;
  level?: SkillLevel;
}
