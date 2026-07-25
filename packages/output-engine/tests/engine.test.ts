import { describe, it, expect } from 'vitest';
import { OutputEngine } from '../src/engine.js';
import { type PdfRenderer } from '../src/interfaces/renderer.js';
import { getTemplateIds } from '../src/templates/registry.js';
import { type ProfessionalProfile } from '@ocp/core';

const mockRenderer: PdfRenderer = {
  async renderPdf(html: string): Promise<Buffer> {
    return Buffer.from(html);
  },
};

function createTestProfile(): ProfessionalProfile {
  return {
    id: 'test-id-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
    personalInfo: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1-555-0100',
      city: 'San Francisco',
      country: 'USA',
      summary: 'Senior software engineer with 10 years of experience.',
      links: [{ label: 'GitHub', url: 'https://github.com/janedoe' }],
    },
    sections: {
      workExperience: [
        {
          id: 'we-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          position: 'Senior Engineer',
          institution: 'Acme Corp',
          startDate: '2020-01',
          endDate: 'present',
          description: 'Leading backend team.',
          achievements: ['Reduced latency by 40%', 'Mentored 5 junior developers'],
          location: 'Remote',
        },
      ],
      education: [
        {
          id: 'edu-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          title: 'B.Sc. Computer Science',
          institution: 'MIT',
          startDate: '2010-09',
          endDate: '2014-06',
          field: 'Computer Science',
        },
      ],
      skills: [
        { id: 'sk-1', createdAt: new Date(), updatedAt: new Date(), name: 'TypeScript', level: 'expert', category: 'Languages' },
        { id: 'sk-2', createdAt: new Date(), updatedAt: new Date(), name: 'Node.js', level: 'advanced', category: 'Runtime' },
      ],
      certifications: [
        {
          id: 'cert-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'AWS Solutions Architect',
          issuer: 'Amazon Web Services',
          issueDate: '2023-03',
        },
      ],
      courses: [],
      languages: [],
      projects: [],
      publications: [],
      awards: [],
      affiliations: [],
      volunteering: [],
      references: [],
    },
  };
}

describe('OutputEngine', () => {
  const engine = new OutputEngine(mockRenderer);
  const profile = createTestProfile();

  it('should have at least two templates available', () => {
    const ids = getTemplateIds();
    expect(ids.length).toBeGreaterThanOrEqual(2);
    expect(ids).toContain('standard');
    expect(ids).toContain('minimal');
  });

  describe('generateHtml', () => {
    it('should produce non-empty HTML for the standard template', () => {
      const html = engine.generateHtml(profile, 'standard');
      expect(html).toBeTruthy();
      expect(html.length).toBeGreaterThan(0);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Jane Doe');
    });

    it('should produce non-empty HTML for the minimal template', () => {
      const html = engine.generateHtml(profile, 'minimal');
      expect(html).toBeTruthy();
      expect(html.length).toBeGreaterThan(0);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Jane Doe');
    });

    it('should include work experience data in standard template', () => {
      const html = engine.generateHtml(profile, 'standard');
      expect(html).toContain('Senior Engineer');
      expect(html).toContain('Acme Corp');
      expect(html).toContain('Reduced latency by 40%');
    });

    it('should include education data in standard template', () => {
      const html = engine.generateHtml(profile, 'standard');
      expect(html).toContain('B.Sc. Computer Science');
      expect(html).toContain('MIT');
    });

    it('should include skills in standard template', () => {
      const html = engine.generateHtml(profile, 'standard');
      expect(html).toContain('TypeScript');
      expect(html).toContain('Node.js');
    });

    it('should include certifications in standard template', () => {
      const html = engine.generateHtml(profile, 'standard');
      expect(html).toContain('AWS Solutions Architect');
      expect(html).toContain('Amazon Web Services');
    });

    it('should throw for an unknown template ID', () => {
      expect(() => engine.generateHtml(profile, 'nonexistent')).toThrow(
        /Template "nonexistent" not found/,
      );
    });
  });

  describe('generatePdf', () => {
    it('should return a buffer (using mock renderer)', async () => {
      const result = await engine.generatePdf(profile, 'standard');
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
