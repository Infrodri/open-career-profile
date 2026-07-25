import { Router, type Request, type Response } from 'express';
import {
  createProfile,
  createEntry,
  type WorkExperience,
  type Education,
  type Certification,
  type Course,
  type Skill,
  type Language,
  type PersonalInfo,
} from '@ocp/core';
import { type ProfileService } from '../services/profile.service.js';
import { type DocumentService } from '../services/document.service.js';
import { success, failure } from '../middleware/error-handler.js';

interface ImportBody {
  personalInfo: Record<string, string>;
  sections: Record<string, Array<Record<string, string>>>;
  profileId?: string;
  documentId?: string;
}

function buildPersonalInfo(raw: Record<string, string>): PersonalInfo {
  return {
    fullName: raw['fullName'] || 'Sin nombre',
    email: raw['email'] || undefined,
    phone: raw['phone'] || undefined,
    city: raw['city'] || undefined,
    country: raw['country'] || undefined,
    summary: raw['summary'] || undefined,
    birthDate: raw['birthDate'] || undefined,
    identityDocument: raw['identityDocument'] || undefined,
    links: [],
  };
}

function buildSections(raw: Record<string, Array<Record<string, string>>>) {
  return {
    workExperience: (raw['workExperience'] ?? [])
      .filter((e) => e['position'] || e['institution'])
      .map((e) =>
        createEntry<WorkExperience>({
          position: e['position'] || 'Sin cargo',
          institution: e['institution'] || 'Sin institución',
          startDate: e['startDate'] || '2020',
          endDate: e['endDate'] || undefined,
          description: e['description'] || undefined,
          achievements: [],
          location: e['location'] || undefined,
        }),
      ),
    education: (raw['education'] ?? [])
      .filter((e) => e['title'] || e['institution'])
      .map((e) =>
        createEntry<Education>({
          title: e['title'] || 'Sin título',
          institution: e['institution'] || 'Sin institución',
          startDate: e['startDate'] || undefined,
          endDate: e['endDate'] || undefined,
          description: e['description'] || undefined,
          field: e['field'] || undefined,
        }),
      ),
    certifications: (raw['certifications'] ?? [])
      .filter((e) => e['name'])
      .map((e) =>
        createEntry<Certification>({
          name: e['name'] || '',
          issuer: e['issuer'] || 'Sin emisor',
          issueDate: e['issueDate'] || undefined,
          expirationDate: e['expirationDate'] || undefined,
          verificationCode: undefined,
          verificationUrl: undefined,
        }),
      ),
    courses: (raw['courses'] ?? [])
      .filter((e) => e['name'])
      .map((e) =>
        createEntry<Course>({
          name: e['name'] || '',
          institution: e['institution'] || undefined,
          completionDate: e['completionDate'] || undefined,
          duration: e['duration'] || undefined,
          description: e['description'] || undefined,
        }),
      ),
    skills: (raw['skills'] ?? [])
      .filter((e) => e['name'])
      .map((e) =>
        createEntry<Skill>({
          name: e['name'] || '',
          category: e['category'] || undefined,
          level: (e['level'] as Skill['level']) || undefined,
        }),
      ),
    languages: (raw['languages'] ?? [])
      .filter((e) => e['name'])
      .map((e) =>
        createEntry<Language>({
          name: e['name'] || '',
          level: (e['level'] as Language['level']) || 'intermediate',
          certification: e['certification'] || undefined,
        }),
      ),
    projects: [],
    publications: [],
    awards: [],
    affiliations: [],
    volunteering: [],
    references: [],
  };
}

export function createProfileImportRoutes(service: ProfileService, documentService: DocumentService): Router {
  const router = Router();

  // POST /api/profiles/import — Crea o actualiza un perfil desde datos extraídos por IA
  router.post('/import', async (req: Request, res: Response) => {
    try {
      const body = req.body as ImportBody;

      if (!body.personalInfo) {
        res.status(400).json(failure('INVALID_INPUT', 'Falta personalInfo'));
        return;
      }

      const personalInfo = buildPersonalInfo(body.personalInfo);
      const newSections = buildSections(body.sections ?? {});

      // Si hay profileId, actualizar el perfil existente agregando los datos
      if (body.profileId) {
        const existing = await service.findById(body.profileId);
        if (!existing) {
          res.status(404).json(failure('NOT_FOUND', 'Perfil no encontrado'));
          return;
        }

        existing.personalInfo = {
          ...existing.personalInfo,
          ...Object.fromEntries(
            Object.entries(personalInfo).filter(([, v]) => v !== undefined && v !== ''),
          ),
        };

        existing.sections.workExperience.push(...newSections.workExperience);
        existing.sections.education.push(...newSections.education);
        existing.sections.certifications.push(...newSections.certifications);
        existing.sections.courses.push(...newSections.courses);
        existing.sections.skills.push(...newSections.skills);
        existing.sections.languages.push(...newSections.languages);

        const updated = await service.updateDirect(existing);
        // Vincular el documento si se proporcionó
        if (body.documentId) {
          // Crear evidencia para todas las secciones añadidas
          for (const section of ['workExperience', 'education', 'certifications', 'courses', 'skills', 'languages']) {
            const sectionData = body.sections?.[section] as Array<Record<string, string>> | undefined;
            if (sectionData) {
              for (const _ of sectionData) {
                await documentService.createEvidence(body.documentId!, section, '');
              }
            }
          }
        }
        res.json(success(updated));
        return;
      }

      // Crear un perfil nuevo
      const profile = createProfile(personalInfo);
      profile.sections = newSections;

      const created = await service.createDirect(profile);
      // Vincular el documento si se proporcionó
      if (body.documentId) {
        const entryIds = [
          ...profile.sections.workExperience.map(e => e.id),
          ...profile.sections.education.map(e => e.id),
          ...profile.sections.certifications.map(e => e.id),
          ...profile.sections.courses.map(e => e.id),
          ...profile.sections.skills.map(e => e.id),
          ...profile.sections.languages.map(e => e.id),
        ];
        for (const entryId of entryIds) {
          await documentService.createEvidence(body.documentId!, 'workExperience', entryId);
        }
      }
      res.status(201).json(success(created));
    } catch (err) {
      console.error('[Import Error]', err);
      const message = err instanceof Error ? err.message : 'Error al importar el perfil';
      res.status(500).json(failure('IMPORT_ERROR', message));
    }
  });

  return router;
}
