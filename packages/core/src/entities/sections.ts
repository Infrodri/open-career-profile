import { type BaseEntity } from '../value-objects/index.js';

// =============================================================================
// Base trait for all section entries
// =============================================================================

/** Every section entry can be verified by uploading a supporting document. */
export interface Verifiable {
  verified: boolean;
}

// =============================================================================
// FORMACIÓN ACADÉMICA
// =============================================================================

/** Tipos de título académico en Bolivia. */
export const TITULO_TIPOS = [
  'bachiller',
  'tecnico_superior',
  'licenciatura',
  'provision_nacional',
  'ingenieria',
] as const;
export type TituloTipo = (typeof TITULO_TIPOS)[number];

export interface FormacionAcademica extends BaseEntity, Verifiable {
  title: string;
  institution: string;
  startDate?: string;
  endDate?: string;
  field?: string;
  tipo?: TituloTipo;
  detalle?: string;
}

// =============================================================================
// POSTGRADO
// =============================================================================

export interface Postgrado extends BaseEntity, Verifiable {
  title: string;
  institution: string;
  startDate?: string;
  endDate?: string;
  detalle?: string;
}

// =============================================================================
// CURSOS DE ESPECIALIDAD (Cisco, Código Facilito, etc.)
// =============================================================================

export interface CursoEspecialidad extends BaseEntity, Verifiable {
  name: string;
  issuer: string;
  issueDate?: string;
  contenido: string[];
}

// =============================================================================
// CERTIFICACIONES DE CIBERSEGURIDAD
// =============================================================================

export interface CertificacionCiberseguridad extends BaseEntity, Verifiable {
  name: string;
  issuer: string;
  issueDate?: string;
  contenido: string[];
  detalle?: string;
}

// =============================================================================
// CERTIFICACIONES DE SISTEMAS INSTITUCIONALES
// =============================================================================

export interface CertificacionSistemasInstitucionales extends BaseEntity, Verifiable {
  name: string;
  issuer: string;
  issueDate?: string;
  contenido: string[];
  detalle?: string;
}

// =============================================================================
// CURSOS ADMINISTRATIVOS
// =============================================================================

export interface CursoAdministrativo extends BaseEntity, Verifiable {
  name: string;
  issuer: string;
  issueDate?: string;
  detalle?: string;
  contenido: string[];
}

// =============================================================================
// CURSOS DE PROGRAMACIÓN
// =============================================================================

export interface CursoProgramacion extends BaseEntity, Verifiable {
  name: string;
  issuer: string;
  issueDate?: string;
  contenido: string[];
}

// =============================================================================
// CURSOS GENERALES (congresos, conferencias, foros)
// =============================================================================

export interface CursoGeneral extends BaseEntity, Verifiable {
  name: string;
  issuer: string;
  issueDate?: string;
  detalle?: string;
}

// =============================================================================
// EXPERIENCIA ADMINISTRATIVA
// =============================================================================

export interface ExperienciaAdministrativa extends BaseEntity, Verifiable {
  position: string;
  institution: string;
  startDate: string;
  endDate?: string;
  description?: string;
  location?: string;
}

// =============================================================================
// EXPERIENCIA DOCENTE
// =============================================================================

export interface ExperienciaDocente extends BaseEntity, Verifiable {
  position: string;
  institution: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

// =============================================================================
// EXPERIENCIA EN DESARROLLO
// =============================================================================

export interface ExperienciaDesarrollo extends BaseEntity, Verifiable {
  position: string;
  institution: string;
  startDate: string;
  endDate?: string;
  description?: string;
  proyectos: string[];
}

// =============================================================================
// RECONOCIMIENTOS COMO EXPOSITOR/PONENTE/EXPERTO
// =============================================================================

export interface ReconocimientoExpositor extends BaseEntity, Verifiable {
  name: string;
  issuer: string;
  issueDate?: string;
  detalle?: string;
}

// =============================================================================
// RECONOCIMIENTOS POR REPRESENTACIÓN
// =============================================================================

export interface ReconocimientoRepresentacion extends BaseEntity, Verifiable {
  name: string;
  issuer: string;
  issueDate?: string;
  detalle?: string;
}

// =============================================================================
// RECONOCIMIENTOS LABORALES
// =============================================================================

export interface ReconocimientoLaboral extends BaseEntity, Verifiable {
  name: string;
  issuer?: string;
  issueDate?: string;
  detalle?: string;
  motivo?: string;
}

// =============================================================================
// IDIOMAS
// =============================================================================

export interface Idioma extends BaseEntity, Verifiable {
  name: string;
  level: string; // basic | intermediate | advanced | native
  detalle?: string;
  certificado: boolean;
}

// =============================================================================
// HABILIDADES
// =============================================================================

export interface Habilidad extends BaseEntity, Verifiable {
  name: string;
  category?: string; // técnica | herramienta | blanda
  level?: string;    // basic | intermediate | advanced | expert
}
