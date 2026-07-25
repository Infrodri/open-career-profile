import { Router, type Request, type Response } from 'express';
import {
  createEntry,
  isSectionType,
  type BaseEntity,
} from '@ocp/core';
import { type ProfileService } from '../services/profile.service.js';
import { success, failure } from '../middleware/error-handler.js';

/**
 * Generic section CRUD routes.
 * Works for all 16 sections via /api/profiles/:id/sections/:sectionKey
 */
export function createProfileSectionRoutes(service: ProfileService): Router {
  const router = Router();

  // GET /api/profiles/:id/sections/:sectionKey — list entries in a section
  router.get('/:id/sections/:sectionKey', async (req: Request, res: Response) => {
    try {
      const { id, sectionKey } = req.params as { id: string; sectionKey: string };

      if (!isSectionType(sectionKey)) {
        res.status(400).json(failure('INVALID_SECTION', `Sección inválida: ${sectionKey}`));
        return;
      }

      const profile = await service.findById(id);
      if (!profile) {
        res.status(404).json(failure('NOT_FOUND', 'Perfil no encontrado'));
        return;
      }

      const entries = (profile.sections as any)[sectionKey] ?? [];
      res.json(success(entries));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener la sección';
      res.status(500).json(failure('FETCH_ERROR', message));
    }
  });

  // POST /api/profiles/:id/sections/:sectionKey — add an entry to a section
  router.post('/:id/sections/:sectionKey', async (req: Request, res: Response) => {
    try {
      const { id, sectionKey } = req.params as { id: string; sectionKey: string };

      if (!isSectionType(sectionKey)) {
        res.status(400).json(failure('INVALID_SECTION', `Sección inválida: ${sectionKey}`));
        return;
      }

      const profile = await service.findById(id);
      if (!profile) {
        res.status(404).json(failure('NOT_FOUND', 'Perfil no encontrado'));
        return;
      }

      const entry = createEntry<BaseEntity>({
        ...req.body,
        verified: req.body.verified ?? false,
      });

      ((profile.sections as any)[sectionKey] as unknown[]).push(entry);
      await service.updateDirect(profile);

      res.status(201).json(success(entry));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agregar la entrada';
      res.status(500).json(failure('CREATE_ERROR', message));
    }
  });

  // DELETE /api/profiles/:id/sections/:sectionKey/:entryId — remove an entry
  router.delete('/:id/sections/:sectionKey/:entryId', async (req: Request, res: Response) => {
    try {
      const { id, sectionKey, entryId } = req.params as {
        id: string;
        sectionKey: string;
        entryId: string;
      };

      if (!isSectionType(sectionKey)) {
        res.status(400).json(failure('INVALID_SECTION', `Sección inválida: ${sectionKey}`));
        return;
      }

      const profile = await service.findById(id);
      if (!profile) {
        res.status(404).json(failure('NOT_FOUND', 'Perfil no encontrado'));
        return;
      }

      const section = (profile.sections as any)[sectionKey] as Array<{ id: string }>;
      const index = section.findIndex((e) => e.id === entryId);
      if (index === -1) {
        res.status(404).json(failure('ENTRY_NOT_FOUND', 'Entrada no encontrada'));
        return;
      }

      section.splice(index, 1);
      await service.updateDirect(profile);
      res.status(204).send();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar la entrada';
      res.status(500).json(failure('DELETE_ERROR', message));
    }
  });

  // PATCH /api/profiles/:id/sections/:sectionKey/:entryId/verify — mark as verified
  router.patch('/:id/sections/:sectionKey/:entryId/verify', async (req: Request, res: Response) => {
    try {
      const { id, sectionKey, entryId } = req.params as {
        id: string;
        sectionKey: string;
        entryId: string;
      };

      if (!isSectionType(sectionKey)) {
        res.status(400).json(failure('INVALID_SECTION', `Sección inválida: ${sectionKey}`));
        return;
      }

      const profile = await service.findById(id);
      if (!profile) {
        res.status(404).json(failure('NOT_FOUND', 'Perfil no encontrado'));
        return;
      }

      const section = (profile.sections as any)[sectionKey] as Array<{ id: string; verified: boolean }>;
      const entry = section.find((e) => e.id === entryId);
      if (!entry) {
        res.status(404).json(failure('ENTRY_NOT_FOUND', 'Entrada no encontrada'));
        return;
      }

      entry.verified = true;
      await service.updateDirect(profile);
      res.json(success(entry));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al verificar la entrada';
      res.status(500).json(failure('VERIFY_ERROR', message));
    }
  });

  return router;
}
