export interface PersonalLink {
  label: string;
  url: string;
}

export interface PersonalInfo {
  fullName: string;
  profesiones: string[];
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  nacionalidad?: string;
  sexo?: string;
  estadoCivil?: string;
  summary?: string;
  photo?: string;
  links: PersonalLink[];
  birthDate?: string;
  identityDocument?: string;
  libretaMilitar?: string;
}

/** Every section entry has these base fields. */
export interface SectionEntry {
  id: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  [field: string]: unknown;
}

/** The 16 section keys. */
export const SECTION_KEYS = [
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

export type SectionKey = (typeof SECTION_KEYS)[number];

/** Human-readable labels for sections. */
export const SECTION_LABELS: Record<SectionKey, string> = {
  formacionAcademica: 'Formación Académica',
  postgrado: 'Postgrado',
  cursosEspecialidad: 'Cursos de Especialidad',
  certificacionesCiberseguridad: 'Certificaciones de Ciberseguridad',
  certificacionesSistemasInstitucionales: 'Certificaciones de Sistemas Institucionales',
  cursosAdministrativos: 'Cursos/Talleres Administrativos',
  cursosProgramacion: 'Cursos/Talleres de Programación',
  cursosGenerales: 'Cursos y Congresos',
  experienciaAdministrativa: 'Experiencia Administrativa',
  experienciaDocente: 'Experiencia Docente',
  experienciaDesarrollo: 'Experiencia en Desarrollo/Programación',
  reconocimientosExpositor: 'Reconocimientos como Expositor/Ponente',
  reconocimientosRepresentacion: 'Reconocimientos por Representación',
  reconocimientosLaborales: 'Reconocimientos Laborales',
  idiomas: 'Idiomas',
  habilidades: 'Habilidades',
};

/** Human-readable labels for entry fields. */
export const FIELD_LABELS: Record<string, string> = {
  title: 'Título',
  institution: 'Institución',
  startDate: 'Inicio',
  endDate: 'Fin',
  field: 'Área',
  tipo: 'Tipo',
  detalle: 'Detalle',
  name: 'Nombre',
  issuer: 'Emisor',
  issueDate: 'Fecha',
  contenido: 'Contenido',
  position: 'Cargo',
  description: 'Funciones',
  location: 'Ubicación',
  proyectos: 'Proyectos',
  motivo: 'Motivo',
  level: 'Nivel',
  category: 'Categoría',
  certificado: 'Con certificación',
};

/** The profile sections object — each key holds an array of entries. */
export type ProfileSections = Record<SectionKey, SectionEntry[]>;

export interface ProfessionalProfile {
  id: string;
  personalInfo: PersonalInfo;
  sections: ProfileSections;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown[];
}

/**
 * Envelope returned by every API endpoint.
 * Exactly one of `data` / `error` is non-null.
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface CreateProfilePayload {
  personalInfo: PersonalInfo;
  sections?: Partial<Record<SectionKey, Array<Record<string, unknown>>>>;
}

export interface OutputRequest {
  templateId: string;
  format: 'html' | 'pdf';
}

/** Kinds of document the system recognises. */
export type DocumentType = 'certificado' | 'titulo' | 'contrato' | 'hoja_de_vida' | 'otro';

/** An uploaded file kept as the source of truth behind profile entries. */
export interface StoredDocument {
  id: string;
  profileId?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  documentType?: DocumentType;
  extractedText?: string;
  createdAt: string;
  updatedAt: string;
}

/** Link between a document and one specific profile entry. */
export interface Evidence {
  id: string;
  documentId: string;
  sectionType: SectionKey;
  entryId: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}
