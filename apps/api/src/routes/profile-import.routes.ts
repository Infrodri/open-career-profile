import { Router, type Request, type Response } from 'express';
import {
  createProfile,
  createEntry,
  type Certification,
  type Course,
  type Education,
  type EvidenceTarget,
  type Language,
  type PersonalInfo,
  type ProfileSections,
  type SectionType,
  type Skill,
  type WorkExperience,
} from '@ocp/core';
import { type ProfileService } from '../services/profile.service.js';
import { type DocumentService } from '../services/document.service.js';
import { success, failure } from '../middleware/error-handler.js';

interface ImportBody {
  personalInfo: Record<string, string>;
  sections: Record<string, Array<Record<string, string>>>;
  profileId?: string;
  /** When present, every entry created by this import is linked to that document. */
  documentId?: string;
}

/** Sections the AI extraction pipeline currently produces. */
const IMPORTABLE_SECTIONS = [
  'workExperience',
  'education',
  'certifications',
  'courses',
  'skills',
  'languages',
] as const satisfies readonly SectionType[];

type ImportableSection = (typeof IMPORTABLE_SECTIONS)[number];

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

/** Only the sections this endpoint knows how to build, each with real entry ids. */
type ImportedSections = Pick<ProfileSections, ImportableSection>;

function buildSections(raw: Record<string, Array<Record<string, string>>>): ImportedSections {
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
  };
}

/**
 * Build one evidence target per entry created by this import, carrying the real
 * entry id and the section the entry actually belongs to.
 */
function buildEvidenceTargets(sections: ImportedSections): EvidenceTarget[] {
  return IMPORTABLE_SECTIONS.flatMap((sectionType) =>
    sections[sectionType].map((entry) => ({ sectionType, entryId: entry.id })),
  );
}

export function createProfileImportRoutes(
  service: ProfileService,
  documentService: DocumentService,
): Router {
  const router = Router();

  // POST /api/profiles/import — creates or extends a profile from AI-extracted data
  router.post('/import', async (req: Request, res: Response) => {
    try {
      const body = req.body as ImportBody;

      if (!body.personalInfo) {
        res.status(400).json(failure('INVALID_INPUT', 'Falta personalInfo'));
        return;
      }

      // Validate the document up front so we never half-import.
      if (body.documentId && !(await documentService.findById(body.documentId))) {
        res.status(404).json(failure('DOCUMENT_NOT_FOUND', 'El documento indicado no existe'));
        return;
      }

      const personalInfo = buildPersonalInfo(body.personalInfo);
      const newSections = buildSections(body.sections ?? {});
      const evidenceTargets = buildEvidenceTargets(newSections);

      let profileId: string;
      let result;

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

        for (const sectionType of IMPORTABLE_SECTIONS) {
          // Cast is safe: each section array holds entries of its own type.
          (existing.sections[sectionType] as unknown[]).push(...newSections[sectionType]);
        }

        result = await service.updateDirect(existing);
        profileId = existing.id;
      } else {
        const profile = createProfile(personalInfo);
        profile.sections = { ...profile.sections, ...newSections };
        result = await service.createDirect(profile);
        profileId = result.id;
      }

      // Link the document to the profile and to every entry it produced.
      if (body.documentId) {
        await documentService.assignToProfile(body.documentId, profileId);
        if (evidenceTargets.length > 0) {
          await documentService.linkEvidence(body.documentId, evidenceTargets);
        }
      }

      res.status(body.profileId ? 200 : 201).json(success(result));
    } catch (err) {
      console.error('[Import Error]', err);
      const message = err instanceof Error ? err.message : 'Error al importar el perfil';
      res.status(500).json(failure('IMPORT_ERROR', message));
    }
  });

  return router;
}
