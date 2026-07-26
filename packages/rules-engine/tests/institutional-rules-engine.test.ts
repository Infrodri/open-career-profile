import { describe, it, expect } from 'vitest';
import { type InstitutionalRuleSet, type ProfessionalProfile } from '@ocp/core';
import { InstitutionalRulesEngine } from '../src/institutional-rules-engine.js';

function createTestProfile(overrides?: Partial<ProfessionalProfile>): ProfessionalProfile {
  return {
    id: 'profile-1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    personalInfo: {
      fullName: 'Juan Pérez',
      profesiones: ['Ingeniero de Sistemas'],
      email: 'juan@test.com',
      phone: '+591 71234567',
      city: 'Sucre',
      country: 'Bolivia',
      summary: 'Profesional con 5 años de experiencia en desarrollo de software.',
      photo: undefined,
      links: [],
    },
    sections: {
      formacionAcademica: [
        { id: 'fa-1', title: 'Licenciatura en Informática', institution: 'USFX', verified: true, createdAt: new Date(), updatedAt: new Date() },
      ],
      postgrado: [],
      cursosEspecialidad: [
        { id: 'ce-1', name: 'Cisco CCNA', issuer: 'Cisco', contenido: ['Redes'], verified: true, createdAt: new Date(), updatedAt: new Date() },
        { id: 'ce-2', name: 'React Avanzado', issuer: 'Platzi', contenido: ['Frontend'], verified: false, createdAt: new Date(), updatedAt: new Date() },
      ],
      certificacionesCiberseguridad: [],
      certificacionesSistemasInstitucionales: [],
      cursosAdministrativos: [],
      cursosProgramacion: [],
      cursosGenerales: [],
      experienciaAdministrativa: [
        { id: 'ea-1', position: 'Analista', institution: 'OJ', startDate: '2020-01', verified: true, createdAt: new Date(), updatedAt: new Date() },
      ],
      experienciaDocente: [],
      experienciaDesarrollo: [
        { id: 'ed-1', position: 'Dev Senior', institution: 'Tech Corp', startDate: '2022-01', proyectos: ['Sistema X'], verified: false, createdAt: new Date(), updatedAt: new Date() },
      ],
      reconocimientosExpositor: [],
      reconocimientosRepresentacion: [],
      reconocimientosLaborales: [],
      idiomas: [
        { id: 'i-1', name: 'Inglés', level: 'intermediate', certificado: false, verified: false, createdAt: new Date(), updatedAt: new Date() },
      ],
      habilidades: [
        { id: 'h-1', name: 'TypeScript', category: 'técnica', level: 'advanced', verified: true, createdAt: new Date(), updatedAt: new Date() },
      ],
    },
    ...overrides,
  };
}

function createDefaultRules(overrides?: Partial<InstitutionalRuleSet>): InstitutionalRuleSet {
  return {
    requiredSections: [],
    includeSections: [],
    excludeSections: [],
    onlyVerified: false,
    requirePhoto: false,
    ...overrides,
  };
}

describe('InstitutionalRulesEngine', () => {
  const engine = new InstitutionalRulesEngine();

  describe('validate', () => {
    it('returns valid when profile satisfies all rules', () => {
      const profile = createTestProfile();
      const rules = createDefaultRules();

      const result = engine.validate(profile, rules);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('reports error for missing required sections', () => {
      const profile = createTestProfile();
      const rules = createDefaultRules({
        requiredSections: ['postgrado', 'experienciaDocente'],
      });

      const result = engine.validate(profile, rules);

      expect(result.valid).toBe(false);
      const errors = result.issues.filter((i) => i.severity === 'error');
      expect(errors).toHaveLength(2);
      expect(errors[0].code).toBe('MISSING_REQUIRED_SECTION');
      expect(errors[0].field).toBe('postgrado');
      expect(errors[1].field).toBe('experienciaDocente');
    });

    it('reports error when photo is required but missing', () => {
      const profile = createTestProfile();
      const rules = createDefaultRules({ requirePhoto: true });

      const result = engine.validate(profile, rules);

      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: 'MISSING_PHOTO', severity: 'error' }),
      );
    });

    it('passes photo check when photo is present', () => {
      const profile = createTestProfile({
        personalInfo: {
          ...createTestProfile().personalInfo,
          photo: 'data:image/png;base64,abc',
        },
      });
      const rules = createDefaultRules({ requirePhoto: true });

      const result = engine.validate(profile, rules);

      expect(result.valid).toBe(true);
    });

    it('reports warning when summary exceeds max length', () => {
      const profile = createTestProfile({
        personalInfo: {
          ...createTestProfile().personalInfo,
          summary: 'A'.repeat(600),
        },
      });
      const rules = createDefaultRules({ maxSummaryLength: 500 });

      const result = engine.validate(profile, rules);

      expect(result.valid).toBe(true); // Warnings don't block
      const warnings = result.issues.filter((i) => i.severity === 'warning');
      expect(warnings).toContainEqual(
        expect.objectContaining({ code: 'SUMMARY_TOO_LONG' }),
      );
    });

    it('reports warning for unverified entries when onlyVerified is set', () => {
      const profile = createTestProfile();
      const rules = createDefaultRules({ onlyVerified: true });

      const result = engine.validate(profile, rules);

      const warnings = result.issues.filter((i) => i.code === 'UNVERIFIED_ENTRIES');
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('adds institutional notes as info', () => {
      const profile = createTestProfile();
      const rules = createDefaultRules({ notes: 'Adjuntar declaración jurada' });

      const result = engine.validate(profile, rules);

      expect(result.valid).toBe(true);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          severity: 'info',
          code: 'INSTITUTIONAL_NOTE',
          message: 'Adjuntar declaración jurada',
        }),
      );
    });
  });

  describe('applyRules', () => {
    it('does not mutate the original profile', () => {
      const profile = createTestProfile();
      const originalSections = JSON.stringify(profile.sections);
      const rules = createDefaultRules({ excludeSections: ['idiomas'] });

      engine.applyRules(profile, rules);

      expect(JSON.stringify(profile.sections)).toBe(originalSections);
    });

    it('returns all sections when no include/exclude rules', () => {
      const profile = createTestProfile();
      const rules = createDefaultRules();

      const result = engine.applyRules(profile, rules);

      expect(result.sections.formacionAcademica).toHaveLength(1);
      expect(result.sections.cursosEspecialidad).toHaveLength(2);
      expect(result.sections.idiomas).toHaveLength(1);
    });

    it('excludes specified sections', () => {
      const profile = createTestProfile();
      const rules = createDefaultRules({
        excludeSections: ['idiomas', 'habilidades', 'postgrado'],
      });

      const result = engine.applyRules(profile, rules);

      expect(result.sections.idiomas).toHaveLength(0);
      expect(result.sections.habilidades).toHaveLength(0);
      expect(result.sections.postgrado).toHaveLength(0);
      // Included sections remain untouched
      expect(result.sections.formacionAcademica).toHaveLength(1);
    });

    it('includes only specified sections (whitelist mode)', () => {
      const profile = createTestProfile();
      const rules = createDefaultRules({
        includeSections: ['formacionAcademica', 'experienciaAdministrativa'],
      });

      const result = engine.applyRules(profile, rules);

      expect(result.sections.formacionAcademica).toHaveLength(1);
      expect(result.sections.experienciaAdministrativa).toHaveLength(1);
      // Everything else is empty
      expect(result.sections.cursosEspecialidad).toHaveLength(0);
      expect(result.sections.idiomas).toHaveLength(0);
      expect(result.sections.habilidades).toHaveLength(0);
    });

    it('filters unverified entries when onlyVerified is true', () => {
      const profile = createTestProfile();
      const rules = createDefaultRules({ onlyVerified: true });

      const result = engine.applyRules(profile, rules);

      // cursosEspecialidad had 2: one verified, one not
      expect(result.sections.cursosEspecialidad).toHaveLength(1);
      expect((result.sections.cursosEspecialidad[0] as { id: string }).id).toBe('ce-1');

      // experienciaDesarrollo had 1 unverified
      expect(result.sections.experienciaDesarrollo).toHaveLength(0);

      // idiomas had 1 unverified
      expect(result.sections.idiomas).toHaveLength(0);

      // formacionAcademica had 1 verified
      expect(result.sections.formacionAcademica).toHaveLength(1);
    });

    it('truncates summary when it exceeds maxSummaryLength', () => {
      const longSummary = 'Profesional con amplia experiencia en múltiples áreas.';
      const profile = createTestProfile({
        personalInfo: { ...createTestProfile().personalInfo, summary: longSummary },
      });
      const rules = createDefaultRules({ maxSummaryLength: 20 });

      const result = engine.applyRules(profile, rules);

      expect(result.personalInfo.summary).toHaveLength(20);
      expect(result.personalInfo.summary).toBe(longSummary.slice(0, 20));
    });

    it('does not truncate summary when within limits', () => {
      const profile = createTestProfile();
      const rules = createDefaultRules({ maxSummaryLength: 1000 });

      const result = engine.applyRules(profile, rules);

      expect(result.personalInfo.summary).toBe(profile.personalInfo.summary);
    });

    it('combines include and onlyVerified filters', () => {
      const profile = createTestProfile();
      const rules = createDefaultRules({
        includeSections: ['cursosEspecialidad', 'experienciaDesarrollo'],
        onlyVerified: true,
      });

      const result = engine.applyRules(profile, rules);

      // cursosEspecialidad: only verified one remains
      expect(result.sections.cursosEspecialidad).toHaveLength(1);
      // experienciaDesarrollo: unverified, removed
      expect(result.sections.experienciaDesarrollo).toHaveLength(0);
      // Other sections excluded by whitelist
      expect(result.sections.formacionAcademica).toHaveLength(0);
    });
  });
});
