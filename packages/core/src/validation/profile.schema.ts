import { z } from 'zod';
import { personalInfoSchema } from './personal-info.schema.js';
import { workExperienceSchema } from './work-experience.schema.js';
import { educationSchema } from './education.schema.js';
import { certificationSchema } from './certification.schema.js';
import { courseSchema } from './course.schema.js';
import { languageSchema } from './language.schema.js';
import { skillSchema } from './skill.schema.js';
import { projectSchema } from './project.schema.js';
import { publicationSchema } from './publication.schema.js';
import { awardSchema } from './award.schema.js';
import { affiliationSchema } from './affiliation.schema.js';
import { volunteeringSchema } from './volunteering.schema.js';
import { referenceSchema } from './reference.schema.js';

export const profileSectionsSchema = z.object({
  workExperience: z.array(workExperienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  courses: z.array(courseSchema).default([]),
  languages: z.array(languageSchema).default([]),
  skills: z.array(skillSchema).default([]),
  projects: z.array(projectSchema).default([]),
  publications: z.array(publicationSchema).default([]),
  awards: z.array(awardSchema).default([]),
  affiliations: z.array(affiliationSchema).default([]),
  volunteering: z.array(volunteeringSchema).default([]),
  references: z.array(referenceSchema).default([]),
});

export const createProfileSchema = z.object({
  personalInfo: personalInfoSchema,
  sections: profileSectionsSchema.default({
    workExperience: [],
    education: [],
    certifications: [],
    courses: [],
    languages: [],
    skills: [],
    projects: [],
    publications: [],
    awards: [],
    affiliations: [],
    volunteering: [],
    references: [],
  }),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
