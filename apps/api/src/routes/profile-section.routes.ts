import { Router, type Request, type Response } from 'express';
import { type ProfileService } from '../services/profile.service.js';
import { createEntry, type WorkExperience, type Education, type Certification, type Course, type Skill, type Language } from '@ocp/core';
import { success, failure } from '../middleware/error-handler.js';

interface AddSectionEntryBody {
  section: string;
  fields: Record<string, string>;
}

export function createProfileSectionRoutes(service: ProfileService): Router {
  const router = Router();

  // POST /api/profiles/:id/sections — Add extracted data to a profile section
  router.post('/:id/sections', async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const { section, fields } = req.body as AddSectionEntryBody;

      if (!section || !fields) {
        res.status(400).json(failure('INVALID_INPUT', 'Body must include "section" and "fields"'));
        return;
      }

      const profile = await service.findById(id);
      if (!profile) {
        res.status(404).json(failure('NOT_FOUND', 'Profile not found'));
        return;
      }

      // Add entry to the correct section
      switch (section) {
        case 'workExperience':
          profile.sections.workExperience.push(
            createEntry<WorkExperience>({
              position: fields['position'] ?? '',
              institution: fields['institution'] ?? fields['organization'] ?? '',
              startDate: fields['startDate'] ?? fields['fecha'] ?? '',
              endDate: fields['endDate'],
              description: fields['description'],
              achievements: [],
              location: fields['location'],
            }),
          );
          break;

        case 'education':
          profile.sections.education.push(
            createEntry<Education>({
              title: fields['title'] ?? fields['titulo'] ?? '',
              institution: fields['institution'] ?? fields['institucion'] ?? '',
              startDate: fields['startDate'],
              endDate: fields['endDate'],
              description: fields['description'],
              field: fields['field'] ?? fields['campo'],
            }),
          );
          break;

        case 'certifications':
          profile.sections.certifications.push(
            createEntry<Certification>({
              name: fields['name'] ?? fields['nombre'] ?? '',
              issuer: fields['issuer'] ?? fields['emisor'] ?? fields['institution'] ?? '',
              issueDate: fields['issueDate'] ?? fields['fecha'],
              expirationDate: fields['expirationDate'],
              verificationCode: fields['verificationCode'],
              verificationUrl: fields['verificationUrl'],
            }),
          );
          break;

        case 'courses':
          profile.sections.courses.push(
            createEntry<Course>({
              name: fields['name'] ?? fields['nombre'] ?? '',
              institution: fields['institution'] ?? fields['institucion'],
              completionDate: fields['completionDate'] ?? fields['fecha'],
              duration: fields['duration'] ?? fields['horas'],
              description: fields['description'],
            }),
          );
          break;

        case 'skills':
          profile.sections.skills.push(
            createEntry<Skill>({
              name: fields['name'] ?? fields['nombre'] ?? '',
              category: fields['category'] ?? fields['categoria'],
              level: fields['level'] as Skill['level'],
            }),
          );
          break;

        case 'languages':
          profile.sections.languages.push(
            createEntry<Language>({
              name: fields['name'] ?? fields['nombre'] ?? '',
              level: (fields['level'] ?? 'intermediate') as Language['level'],
              certification: fields['certification'],
            }),
          );
          break;

        default:
          res.status(400).json(failure('INVALID_SECTION', `Unknown section: ${section}`));
          return;
      }

      // Save the updated profile
      const updated = await service.updateDirect(profile);
      res.json(success(updated));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add section entry';
      res.status(500).json(failure('ADD_ENTRY_ERROR', message));
    }
  });

  return router;
}
