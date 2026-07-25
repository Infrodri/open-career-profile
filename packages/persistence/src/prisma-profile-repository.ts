import { PrismaClient } from '@prisma/client';
import {
  type ProfileRepository,
  type ProfessionalProfile,
  PROFILE_SECTION_KEYS,
} from '@ocp/core';
import { toDomain, profileIncludeAll } from './mappers/profile.mapper.js';

/**
 * Maps a domain section key to the corresponding Prisma model relation name.
 * They happen to be the same strings in our schema design.
 */
const PRISMA_SECTION_KEY = (key: string) => key;

/**
 * Prisma client model accessors are singular (the model name), but our section
 * keys match the relation names on Profile (which are plural). This maps between them.
 */
const PRISMA_MODEL_NAME: Record<string, string> = {
  formacionAcademica: 'formacionAcademica', // same
  postgrado: 'postgrado', // same
  cursosEspecialidad: 'cursoEspecialidad',
  certificacionesCiberseguridad: 'certificacionCiberseguridad',
  certificacionesSistemasInstitucionales: 'certificacionSistemasInstitucionales',
  cursosAdministrativos: 'cursoAdministrativo',
  cursosProgramacion: 'cursoProgramacion',
  cursosGenerales: 'cursoGeneral',
  experienciaAdministrativa: 'experienciaAdministrativa', // same
  experienciaDocente: 'experienciaDocente', // same
  experienciaDesarrollo: 'experienciaDesarrollo', // same
  reconocimientosExpositor: 'reconocimientoExpositor',
  reconocimientosRepresentacion: 'reconocimientoRepresentacion',
  reconocimientosLaborales: 'reconocimientoLaboral',
  idiomas: 'idioma',
  habilidades: 'habilidad',
};

export class PrismaProfileRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(profile: ProfessionalProfile): Promise<ProfessionalProfile> {
    const sectionData = this.buildSectionCreateData(profile);

    const result = await this.prisma.profile.create({
      data: {
        id: profile.id,
        fullName: profile.personalInfo.fullName,
        profesiones: profile.personalInfo.profesiones,
        email: profile.personalInfo.email ?? null,
        phone: profile.personalInfo.phone ?? null,
        city: profile.personalInfo.city ?? null,
        country: profile.personalInfo.country ?? null,
        nacionalidad: profile.personalInfo.nacionalidad ?? null,
        sexo: profile.personalInfo.sexo ?? null,
        estadoCivil: profile.personalInfo.estadoCivil ?? null,
        summary: profile.personalInfo.summary ?? null,
        photo: profile.personalInfo.photo ?? null,
        birthDate: profile.personalInfo.birthDate ?? null,
        identityDocument: profile.personalInfo.identityDocument ?? null,
        libretaMilitar: profile.personalInfo.libretaMilitar ?? null,
        links: {
          create: profile.personalInfo.links.map((l) => ({
            label: l.label,
            url: l.url,
          })),
        },
        ...sectionData,
      },
      include: profileIncludeAll,
    });

    return toDomain(result as any);
  }

  async findById(id: string): Promise<ProfessionalProfile | null> {
    const result = await this.prisma.profile.findUnique({
      where: { id },
      include: profileIncludeAll,
    });

    if (!result) return null;
    return toDomain(result as any);
  }

  async update(profile: ProfessionalProfile): Promise<ProfessionalProfile> {
    // Strategy: delete all section records and recreate them.
    // This is simpler than diffing and handles all cases correctly.
    // Prisma model names for standalone access match the relation names in our schema.
    const deleteOps: any[] = [
      this.prisma.profileLink.deleteMany({ where: { profileId: profile.id } }),
    ];

    for (const key of PROFILE_SECTION_KEYS) {
      const modelName = PRISMA_MODEL_NAME[key] ?? key;
      const model = (this.prisma as any)[modelName];
      if (model && typeof model.deleteMany === 'function') {
        deleteOps.push(model.deleteMany({ where: { profileId: profile.id } }));
      }
    }

    await this.prisma.$transaction(deleteOps);

    const sectionData = this.buildSectionCreateData(profile);

    const result = await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        fullName: profile.personalInfo.fullName,
        profesiones: profile.personalInfo.profesiones,
        email: profile.personalInfo.email ?? null,
        phone: profile.personalInfo.phone ?? null,
        city: profile.personalInfo.city ?? null,
        country: profile.personalInfo.country ?? null,
        nacionalidad: profile.personalInfo.nacionalidad ?? null,
        sexo: profile.personalInfo.sexo ?? null,
        estadoCivil: profile.personalInfo.estadoCivil ?? null,
        summary: profile.personalInfo.summary ?? null,
        photo: profile.personalInfo.photo ?? null,
        birthDate: profile.personalInfo.birthDate ?? null,
        identityDocument: profile.personalInfo.identityDocument ?? null,
        libretaMilitar: profile.personalInfo.libretaMilitar ?? null,
        links: {
          create: profile.personalInfo.links.map((l) => ({
            label: l.label,
            url: l.url,
          })),
        },
        ...sectionData,
      },
      include: profileIncludeAll,
    });

    return toDomain(result as any);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.profile.delete({ where: { id } });
  }

  /**
   * Builds the `create` nested writes for all 16 sections.
   * Each entry is stored with its id so Evidence can reference it.
   */
  private buildSectionCreateData(profile: ProfessionalProfile): Record<string, { create: unknown[] }> {
    const data: Record<string, { create: unknown[] }> = {};

    for (const key of PROFILE_SECTION_KEYS) {
      const entries = profile.sections[key] as unknown as Array<Record<string, unknown>>;
      if (!entries || entries.length === 0) continue;

      data[PRISMA_SECTION_KEY(key)] = {
        create: entries.map((entry) => this.stripForCreate(entry)),
      };
    }

    return data;
  }

  /**
   * Strip domain-only fields that Prisma doesn't accept in create:
   * - `createdAt` and `updatedAt` are auto-generated by the DB
   * - `profileId` is set by the relation
   * Convert undefined → null for optional fields.
   */
  private stripForCreate(entry: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(entry)) {
      if (key === 'createdAt' || key === 'updatedAt' || key === 'profileId') continue;
      result[key] = value === undefined ? null : value;
    }
    return result;
  }
}
