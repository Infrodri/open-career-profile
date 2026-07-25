import { type BaseEntity } from '../value-objects/index.js';
import { type PersonalInfo } from './personal-info.js';
import { type WorkExperience } from './work-experience.js';
import { type Education } from './education.js';
import { type Certification } from './certification.js';
import { type Course } from './course.js';
import { type Language } from './language.js';
import { type Skill } from './skill.js';
import { type Project } from './project.js';
import { type Publication } from './publication.js';
import { type Award } from './award.js';
import { type Affiliation } from './affiliation.js';
import { type Volunteering } from './volunteering.js';
import { type Reference } from './reference.js';

export interface ProfileSections {
  workExperience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  courses: Course[];
  languages: Language[];
  skills: Skill[];
  projects: Project[];
  publications: Publication[];
  awards: Award[];
  affiliations: Affiliation[];
  volunteering: Volunteering[];
  references: Reference[];
}

export interface ProfessionalProfile extends BaseEntity {
  personalInfo: PersonalInfo;
  sections: ProfileSections;
}
