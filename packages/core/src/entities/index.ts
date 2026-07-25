// Personal info
export { type PersonalInfo } from './personal-info.js';

// Section entities (the 16 sections)
export {
  type Verifiable,
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
  type TituloTipo,
  TITULO_TIPOS,
} from './sections.js';

// Profile aggregate
export {
  type ProfessionalProfile,
  type ProfileSections,
  PROFILE_SECTION_KEYS,
} from './professional-profile.js';

// Documents & evidence
export {
  type Document,
  type Evidence,
  type DocumentType,
  type SectionType,
  DOCUMENT_TYPES,
  SECTION_TYPES,
  isSectionType,
  isDocumentType,
} from './document.js';

// Factories
export { createProfile, createEntry, createEmptySections } from './factories.js';
