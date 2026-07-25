import { Router, type Request, type Response } from 'express';
import {
  createProfile,
  createEntry,
  createEmptySections,
  type PersonalInfo,
  type ProfileSections,
  type EvidenceTarget,
  type SectionType,
  PROFILE_SECTION_KEYS,
  type BaseEntity,
} from '@ocp/core';
import { type ProfileService } from '../services/profile.service.js';
import { type DocumentService } from '../services/document.service.js';
import { success, failure } from '../middleware/error-handler.js';

interface ImportBody {
  personalInfo: Record<string, unknown>;
  sections: Record<string, Array<Record<string, unknown>>>;
  profileId?: string;
  /** When present, every entry created by this import is linked to that document. */
  documentId?: string;
  /**
   * When true (single document upload), entries are marked as verified.
   * When false/absent (CV base upload), entries are unverified.
   */
  verified?: boolean;
}

function buildPersonalInfo(raw: Record<string, unknown>): PersonalInfo {
  return {
    fullName: String(raw['fullName'] ?? 'Sin nombre'),
    profesiones: Array.isArray(raw['profesiones']) ? raw['profesiones'].map(String) : [],
    email: raw['email'] ? String(raw['email']) : undefined,
    phone: raw['phone'] ? String(raw['phone']) : undefined,
    city: raw['city'] ? String(raw['city']) : undefined,
    country: raw['country'] ? String(raw['country']) : undefined,
    nacionalidad: raw['nacionalidad'] ? String(raw['nacionalidad']) : undefined,
    sexo: raw['sexo'] ? String(raw['sexo']) : undefined,
    estadoCivil: raw['estadoCivil'] ? String(raw['estadoCivil']) : undefined,
    summary: raw['summary'] ? String(raw['summary']) : undefined,
    birthDate: raw['birthDate'] ? String(raw['birthDate']) : undefined,
    identityDocument: raw['identityDocument'] ? String(raw['identityDocument']) : undefined,
    libretaMilitar: raw['libretaMilitar'] ? String(raw['libretaMilitar']) : undefined,
    links: [],
  };
}

/**
 * Build all 16 sections from raw AI output, assigning ids and verified status.
 * Returns the built sections AND the list of all entry ids for evidence linking.
 */
function buildSections(
  raw: Record<string, Array<Record<string, unknown>>>,
  verified: boolean,
): { sections: ProfileSections; evidenceTargets: EvidenceTarget[] } {
  const sections = createEmptySections();
  const evidenceTargets: EvidenceTarget[] = [];

  for (const key of PROFILE_SECTION_KEYS) {
    const entries = raw[key];
    if (!Array.isArray(entries) || entries.length === 0) continue;

    const built: any[] = [];
    for (const entry of entries) {
      const created = createEntry<BaseEntity>({
        ...entry,
        verified,
      } as any);
      built.push(created);
      evidenceTargets.push({ sectionType: key as SectionType, entryId: created.id });
    }
    (sections as any)[key] = built;
  }

  return { sections, evidenceTargets };
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
      const isVerified = body.verified === true && !!body.documentId;
      const { sections: newSections, evidenceTargets } = buildSections(
        body.sections ?? {},
        isVerified,
      );

      let profileId: string;
      let result;

      if (body.profileId) {
        // --- Extend existing profile ---
        const existing = await service.findById(body.profileId);
        if (!existing) {
          res.status(404).json(failure('NOT_FOUND', 'Perfil no encontrado'));
          return;
        }

        // Merge personal info: only overwrite non-empty fields
        existing.personalInfo = {
          ...existing.personalInfo,
          ...Object.fromEntries(
            Object.entries(personalInfo).filter(
              ([key, v]) => v !== undefined && v !== '' && key !== 'links' && key !== 'profesiones',
            ),
          ),
        };
        // Merge profesiones (add new, keep existing)
        if (personalInfo.profesiones.length > 0) {
          const existingSet = new Set(existing.personalInfo.profesiones);
          for (const p of personalInfo.profesiones) {
            existingSet.add(p);
          }
          existing.personalInfo.profesiones = [...existingSet];
        }

        // Append new entries to each section (skip duplicates)
        for (const key of PROFILE_SECTION_KEYS) {
          const newEntries = (newSections as any)[key] as Array<Record<string, unknown>>;
          if (!newEntries || newEntries.length === 0) continue;

          const existingEntries = (existing.sections as any)[key] as Array<Record<string, unknown>>;
          for (const entry of newEntries) {
            if (!isDuplicate(entry, existingEntries)) {
              existingEntries.push(entry);
            }
          }
        }

        result = await service.updateDirect(existing);
        profileId = existing.id;
      } else {
        // --- Create new profile ---
        const profile = createProfile(personalInfo);
        profile.sections = newSections;
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

/**
 * Check if a new entry would be a duplicate of an existing one.
 * Compares by the "identity" fields: title/name + institution/issuer + date.
 * This prevents the same certificate from being added twice when the user
 * uploads the same document again.
 */
function isDuplicate(
  newEntry: Record<string, unknown>,
  existingEntries: Array<Record<string, unknown>>,
): boolean {
  // Extract the key fields that identify an entry
  const newTitle = normalize(newEntry['title'] ?? newEntry['name'] ?? newEntry['position']);
  const newInstitution = normalize(newEntry['institution'] ?? newEntry['issuer']);
  const newDate = normalize(newEntry['startDate'] ?? newEntry['issueDate']);

  if (!newTitle) return false; // Can't determine identity without at least a title

  for (const existing of existingEntries) {
    const existingTitle = normalize(existing['title'] ?? existing['name'] ?? existing['position']);
    const existingInstitution = normalize(existing['institution'] ?? existing['issuer']);
    const existingDate = normalize(existing['startDate'] ?? existing['issueDate']);

    // Match: same title AND (same institution OR same date)
    if (existingTitle === newTitle) {
      if (existingInstitution === newInstitution) return true;
      if (newDate && existingDate === newDate) return true;
      // If title matches exactly and institution/date are both empty, it's still a duplicate
      if (!newInstitution && !existingInstitution) return true;
    }
  }

  return false;
}

/** Normalize a value for comparison: trim, lowercase, remove extra spaces. */
function normalize(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}
