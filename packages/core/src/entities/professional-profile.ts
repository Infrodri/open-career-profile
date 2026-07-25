import { type BaseEntity } from '../value-objects/index.js';
import { type PersonalInfo } from './personal-info.js';
import {
  type FormacionAcademica,
  type Postgrado,
  type CursoEspecialidad,
  type CertificacionCiberseguridad,
  type CertificacionSistemasInstitucionales,
  type CursoAdministrativo,
  type CursoProgramacion,
  type CursoGeneral,
  type ExperienciaAdministrativa,
  type ExperienciaDocente,
  type ExperienciaDesarrollo,
  type ReconocimientoExpositor,
  type ReconocimientoRepresentacion,
  type ReconocimientoLaboral,
  type Idioma,
  type Habilidad,
} from './sections.js';

/**
 * All the section arrays that make up a professional profile.
 * Each key matches a Prisma relation name and an AI analysis section key.
 */
export interface ProfileSections {
  formacionAcademica: FormacionAcademica[];
  postgrado: Postgrado[];
  cursosEspecialidad: CursoEspecialidad[];
  certificacionesCiberseguridad: CertificacionCiberseguridad[];
  certificacionesSistemasInstitucionales: CertificacionSistemasInstitucionales[];
  cursosAdministrativos: CursoAdministrativo[];
  cursosProgramacion: CursoProgramacion[];
  cursosGenerales: CursoGeneral[];
  experienciaAdministrativa: ExperienciaAdministrativa[];
  experienciaDocente: ExperienciaDocente[];
  experienciaDesarrollo: ExperienciaDesarrollo[];
  reconocimientosExpositor: ReconocimientoExpositor[];
  reconocimientosRepresentacion: ReconocimientoRepresentacion[];
  reconocimientosLaborales: ReconocimientoLaboral[];
  idiomas: Idioma[];
  habilidades: Habilidad[];
}

/** The keys of ProfileSections, useful for iteration. */
export const PROFILE_SECTION_KEYS: ReadonlyArray<keyof ProfileSections> = [
  'formacionAcademica',
  'postgrado',
  'cursosEspecialidad',
  'certificacionesCiberseguridad',
  'certificacionesSistemasInstitucionales',
  'cursosAdministrativos',
  'cursosProgramacion',
  'cursosGenerales',
  'experienciaAdministrativa',
  'experienciaDocente',
  'experienciaDesarrollo',
  'reconocimientosExpositor',
  'reconocimientosRepresentacion',
  'reconocimientosLaborales',
  'idiomas',
  'habilidades',
] as const;

/**
 * A complete professional profile.
 * This is the domain aggregate: personalInfo + all sections.
 */
export interface ProfessionalProfile extends BaseEntity {
  personalInfo: PersonalInfo;
  sections: ProfileSections;
}
