import { Router, type Request, type Response } from 'express';
import { createProfileSchema } from '@ocp/core';
import { validate } from '../middleware/validate.js';
import { success, failure } from '../middleware/error-handler.js';
import { type ProfileService } from '../services/profile.service.js';

export function createProfileRoutes(service: ProfileService): Router {
  const router = Router();

  // POST /api/profiles — Create a new profile
  router.post('/', validate(createProfileSchema), async (req: Request, res: Response) => {
    try {
      const profile = await service.create(req.body);
      res.status(201).json(success(profile));
    } catch (_err) {
      res.status(500).json(failure('CREATE_ERROR', 'Failed to create profile'));
    }
  });

  // GET /api/profiles/:id — Get a profile by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const profile = await service.findById(id);

      if (!profile) {
        res.status(404).json(failure('NOT_FOUND', 'Profile not found'));
        return;
      }

      res.json(success(profile));
    } catch (_err) {
      res.status(500).json(failure('FETCH_ERROR', 'Failed to fetch profile'));
    }
  });

  // PUT /api/profiles/:id — Update a profile
  router.put('/:id', validate(createProfileSchema), async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const profile = await service.update(id, req.body);

      if (!profile) {
        res.status(404).json(failure('NOT_FOUND', 'Profile not found'));
        return;
      }

      res.json(success(profile));
    } catch (_err) {
      res.status(500).json(failure('UPDATE_ERROR', 'Failed to update profile'));
    }
  });

  // DELETE /api/profiles/:id — Delete a profile
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const deleted = await service.delete(id);

      if (!deleted) {
        res.status(404).json(failure('NOT_FOUND', 'Profile not found'));
        return;
      }

      res.status(204).send();
    } catch (_err) {
      res.status(500).json(failure('DELETE_ERROR', 'Failed to delete profile'));
    }
  });

  return router;
}
