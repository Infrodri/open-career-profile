import { describe, it, expect } from 'vitest';
import { createProfileSchema } from '../../src/validation/index.js';

describe('createProfileSchema', () => {
  it('accepts a profile with only personalInfo', () => {
    const data = {
      personalInfo: { fullName: 'María López' },
    };

    const result = createProfileSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sections.workExperience).toEqual([]);
      expect(result.data.sections.education).toEqual([]);
      expect(result.data.sections.certifications).toEqual([]);
    }
  });

  it('accepts a full profile with multiple sections', () => {
    const data = {
      personalInfo: {
        fullName: 'Carlos Ruiz',
        email: 'carlos@test.com',
        links: [{ label: 'Web', url: 'https://carlos.dev' }],
      },
      sections: {
        workExperience: [
          { position: 'CTO', institution: 'MyCompany', startDate: '2018', endDate: 'present' },
        ],
        education: [
          { title: 'Computer Science', institution: 'Universidad X', startDate: '2010', endDate: '2015' },
        ],
        skills: [
          { name: 'TypeScript', level: 'expert' },
          { name: 'Leadership', category: 'soft' },
        ],
        languages: [
          { name: 'Spanish', level: 'native' },
          { name: 'English', level: 'advanced' },
        ],
      },
    };

    const result = createProfileSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects profile without personalInfo', () => {
    const data = { sections: {} };
    const result = createProfileSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects profile with invalid nested data', () => {
    const data = {
      personalInfo: { fullName: 'Test' },
      sections: {
        workExperience: [{ position: '', institution: '', startDate: 'invalid' }],
      },
    };
    const result = createProfileSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
