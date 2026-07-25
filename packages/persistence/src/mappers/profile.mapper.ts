import {
  type ProfessionalProfile,
  type PersonalInfo,
  type ProfileSections,
  PROFILE_SECTION_KEYS,
} from '@ocp/core';

/**
 * Maps a Prisma profile (with all 16 section relations) to a domain ProfessionalProfile.
 *
 * The mapper is intentionally generic: each section is an array of records with
 * an `id`, timestamps, and a `verified` flag. The specific fields vary by section
 * but TypeScript trusts the Prisma schema to match the domain interface.
 */
export function toDomain(prismaProfile: PrismaProfileFull): ProfessionalProfile {
  const personalInfo: PersonalInfo = {
    fullName: prismaProfile.fullName,
    profesiones: prismaProfile.profesiones ?? [],
    email: prismaProfile.email ?? undefined,
    phone: prismaProfile.phone ?? undefined,
    city: prismaProfile.city ?? undefined,
    country: prismaProfile.country ?? undefined,
    nacionalidad: prismaProfile.nacionalidad ?? undefined,
    sexo: prismaProfile.sexo ?? undefined,
    estadoCivil: prismaProfile.estadoCivil ?? undefined,
    summary: prismaProfile.summary ?? undefined,
    photo: prismaProfile.photo ?? undefined,
    birthDate: prismaProfile.birthDate ?? undefined,
    identityDocument: prismaProfile.identityDocument ?? undefined,
    libretaMilitar: prismaProfile.libretaMilitar ?? undefined,
    links: (prismaProfile.links ?? []).map((l) => ({ label: l.label, url: l.url })),
  };

  // Map each section generically: strip profileId, convert nulls to undefined
  const sections = {} as ProfileSections;
  for (const key of PROFILE_SECTION_KEYS) {
    const rawArray = (prismaProfile as any)[key];
    if (!Array.isArray(rawArray)) {
      (sections as any)[key] = [];
      continue;
    }
    (sections as any)[key] = rawArray.map((row: any) => mapSectionRow(row));
  }

  return {
    id: prismaProfile.id,
    personalInfo,
    sections,
    createdAt: prismaProfile.createdAt,
    updatedAt: prismaProfile.updatedAt,
  };
}

/**
 * Map a single section row from Prisma to domain.
 * - Removes `profileId` (it's implicit from the parent)
 * - Converts null → undefined for optional fields
 * - Keeps arrays (contenido, proyectos, profesiones) as-is
 */
function mapSectionRow(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === 'profileId') continue;
    if (value === null) {
      result[key] = undefined;
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Type representing a Prisma profile with all relations included.
 * Kept loose (Record-based) so we don't need to replicate every Prisma generated type.
 */
export interface PrismaProfileFull {
  id: string;
  fullName: string;
  profesiones: string[];
  email: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  nacionalidad: string | null;
  sexo: string | null;
  estadoCivil: string | null;
  summary: string | null;
  photo: string | null;
  birthDate: string | null;
  identityDocument: string | null;
  libretaMilitar: string | null;
  createdAt: Date;
  updatedAt: Date;
  links: Array<{ id: string; label: string; url: string }>;
  // Each section is an array of records — typed loosely here.
  [sectionKey: string]: unknown;
}

/** Include object for Prisma queries to fetch all 16 section relations + links. */
export const profileIncludeAll = {
  links: true,
  formacionAcademica: true,
  postgrado: true,
  cursosEspecialidad: true,
  certificacionesCiberseguridad: true,
  certificacionesSistemasInstitucionales: true,
  cursosAdministrativos: true,
  cursosProgramacion: true,
  cursosGenerales: true,
  experienciaAdministrativa: true,
  experienciaDocente: true,
  experienciaDesarrollo: true,
  reconocimientosExpositor: true,
  reconocimientosRepresentacion: true,
  reconocimientosLaborales: true,
  idiomas: true,
  habilidades: true,
} as const;
