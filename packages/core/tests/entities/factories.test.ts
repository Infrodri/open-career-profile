import { describe, it, expect } from 'vitest';
import { createProfile, createEntry } from '../../src/entities/factories.js';
import { type WorkExperience } from '../../src/entities/work-experience.js';

describe('createProfile', () => {
  it('creates a profile with generated id', () => {
    const profile = createProfile({ fullName: 'Test User', links: [] });
    expect(profile.id).toBeDefined();
    expect(profile.id).toHaveLength(36); // UUID v4 format
  });

  it('creates a profile with timestamps', () => {
    const before = new Date();
    const profile = createProfile({ fullName: 'Test', links: [] });
    const after = new Date();

    expect(profile.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(profile.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(profile.updatedAt).toEqual(profile.createdAt);
  });

  it('creates a profile with empty sections', () => {
    const profile = createProfile({ fullName: 'Test', links: [] });
    expect(profile.sections.workExperience).toEqual([]);
    expect(profile.sections.education).toEqual([]);
    expect(profile.sections.certifications).toEqual([]);
    expect(profile.sections.courses).toEqual([]);
    expect(profile.sections.languages).toEqual([]);
    expect(profile.sections.skills).toEqual([]);
    expect(profile.sections.projects).toEqual([]);
    expect(profile.sections.publications).toEqual([]);
    expect(profile.sections.awards).toEqual([]);
    expect(profile.sections.affiliations).toEqual([]);
    expect(profile.sections.volunteering).toEqual([]);
    expect(profile.sections.references).toEqual([]);
  });

  it('preserves personalInfo', () => {
    const info = { fullName: 'Ana García', email: 'ana@test.com', links: [] };
    const profile = createProfile(info);
    expect(profile.personalInfo.fullName).toBe('Ana García');
    expect(profile.personalInfo.email).toBe('ana@test.com');
  });

  it('generates unique ids for different profiles', () => {
    const p1 = createProfile({ fullName: 'User 1', links: [] });
    const p2 = createProfile({ fullName: 'User 2', links: [] });
    expect(p1.id).not.toBe(p2.id);
  });
});

describe('createEntry', () => {
  it('creates an entry with generated id and timestamps', () => {
    const entry = createEntry<WorkExperience>({
      position: 'Developer',
      institution: 'Corp',
      startDate: '2020',
      achievements: [],
    });

    expect(entry.id).toBeDefined();
    expect(entry.id).toHaveLength(36);
    expect(entry.createdAt).toBeInstanceOf(Date);
    expect(entry.updatedAt).toBeInstanceOf(Date);
    expect(entry.position).toBe('Developer');
    expect(entry.institution).toBe('Corp');
  });

  it('generates unique ids for different entries', () => {
    const e1 = createEntry<WorkExperience>({
      position: 'Dev',
      institution: 'A',
      startDate: '2020',
      achievements: [],
    });
    const e2 = createEntry<WorkExperience>({
      position: 'Dev',
      institution: 'B',
      startDate: '2021',
      achievements: [],
    });
    expect(e1.id).not.toBe(e2.id);
  });
});
