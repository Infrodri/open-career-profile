import { describe, it, expect } from 'vitest';
import { workExperienceSchema } from '../../src/validation/index.js';

describe('workExperienceSchema', () => {
  it('accepts valid work experience', () => {
    const data = {
      position: 'Senior Developer',
      institution: 'Tech Corp',
      startDate: '2020-03',
      endDate: 'present',
      description: 'Led a team of 5 developers.',
      achievements: ['Reduced load time by 40%', 'Implemented CI/CD'],
      location: 'Quito, Ecuador',
    };

    const result = workExperienceSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('accepts minimal work experience (position, institution, startDate)', () => {
    const data = {
      position: 'Intern',
      institution: 'Startup X',
      startDate: '2022',
    };
    const result = workExperienceSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects missing position', () => {
    const data = { institution: 'Corp', startDate: '2020' };
    const result = workExperienceSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects missing institution', () => {
    const data = { position: 'Dev', startDate: '2020' };
    const result = workExperienceSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects missing startDate', () => {
    const data = { position: 'Dev', institution: 'Corp' };
    const result = workExperienceSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const data = { position: 'Dev', institution: 'Corp', startDate: '03/2020' };
    const result = workExperienceSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('accepts YYYY format for startDate', () => {
    const data = { position: 'Dev', institution: 'Corp', startDate: '2020' };
    const result = workExperienceSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('accepts YYYY-MM format for startDate', () => {
    const data = { position: 'Dev', institution: 'Corp', startDate: '2020-06' };
    const result = workExperienceSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('accepts "present" as endDate', () => {
    const data = { position: 'Dev', institution: 'Corp', startDate: '2020', endDate: 'present' };
    const result = workExperienceSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('defaults achievements to empty array', () => {
    const data = { position: 'Dev', institution: 'Corp', startDate: '2020' };
    const result = workExperienceSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.achievements).toEqual([]);
    }
  });
});
