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
      fullName: 'José Rodrigo Ríos Arcienega',
      profesiones: ['Ingeniero en Sistemas Informáticos', 'Contador General'],
      email: 'jose@example.com',
      phone: '+591 71234567',
      city: 'Sucre',
      country: 'Bolivia',
      identityDocument: '5669226 Ch.',
      nacionalidad: 'Boliviano',
      summary: 'Profesional con amplia experiencia en administración de sistemas y desarrollo.',
      links: [],
    },
    sections: {
      formacionAcademica: [
        {
          id: 'fa-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          title: 'Licenciatura en Informática',
          institution: 'U.M.R. P.S.F.X.CH.',
          startDate: '2010',
          endDate: '2015',
          verified: true,
        },
      ],
      postgrado: [
        {
          id: 'pg-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          title: 'Diplomado en Educación Superior',
          institution: 'Universidad Andina',
          startDate: '2020',
          endDate: '2021',
          verified: true,
        },
      ],
      cursosEspecialidad: [],
      certificacionesCiberseguridad: [],
      certificacionesSistemasInstitucionales: [],
      cursosAdministrativos: [
        {
          id: 'ca-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'Ley 1178 SAFCO',
          issuer: 'CENCAP',
          issueDate: '2019',
          contenido: [],
          verified: true,
        },
      ],
      cursosProgramacion: [],
      cursosGenerales: [],
      experienciaAdministrativa: [
        {
          id: 'ea-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          position: 'Analista de Sistemas',
          institution: 'Órgano Judicial',
          startDate: '2020-01',
          endDate: '2024-06',
          description: 'Desarrollo y mantenimiento de sistemas institucionales',
          location: 'Sucre',
          verified: true,
        },
      ],
      experienciaDocente: [
        {
          id: 'ed-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          position: 'Docente de Programación',
          institution: 'USFX',
          startDate: '2019',
          endDate: '2020',
          verified: true,
        },
      ],
      experienciaDesarrollo: [],
      reconocimientosExpositor: [],
      reconocimientosRepresentacion: [],
      reconocimientosLaborales: [],
      idiomas: [
        { id: 'i-1', createdAt: new Date(), updatedAt: new Date(), name: 'Español', level: 'native', certificado: true, verified: true },
        { id: 'i-2', createdAt: new Date(), updatedAt: new Date(), name: 'Inglés', level: 'intermediate', certificado: false, verified: false },
      ],
      habilidades: [
        { id: 'h-1', createdAt: new Date(), updatedAt: new Date(), name: 'TypeScript', category: 'técnica', level: 'advanced', verified: true },
        { id: 'h-2', createdAt: new Date(), updatedAt: new Date(), name: 'PostgreSQL', category: 'técnica', level: 'advanced', verified: true },
      ],
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
      expect(html).toContain('José Rodrigo Ríos Arcienega');
    });

    it('should produce non-empty HTML for the minimal template', () => {
      const html = engine.generateHtml(profile, 'minimal');
      expect(html).toBeTruthy();
      expect(html.length).toBeGreaterThan(0);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('José Rodrigo Ríos Arcienega');
    });

    it('should include experiencia laboral in standard template', () => {
      const html = engine.generateHtml(profile, 'standard');
      expect(html).toContain('Analista de Sistemas');
      expect(html).toContain('Órgano Judicial');
      expect(html).toContain('Desarrollo y mantenimiento de sistemas institucionales');
    });

    it('should include formacion academica in standard template', () => {
      const html = engine.generateHtml(profile, 'standard');
      expect(html).toContain('Licenciatura en Informática');
      expect(html).toContain('U.M.R. P.S.F.X.CH.');
    });

    it('should include habilidades in standard template', () => {
      const html = engine.generateHtml(profile, 'standard');
      expect(html).toContain('TypeScript');
      expect(html).toContain('PostgreSQL');
    });

    it('should include cursos administrativos in standard template', () => {
      const html = engine.generateHtml(profile, 'standard');
      expect(html).toContain('Ley 1178 SAFCO');
      expect(html).toContain('CENCAP');
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
