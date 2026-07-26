import {
  type InstitutionalRuleSet,
  type ProfessionalProfile,
  type ProfileSections,
  type RulesEngine,
  type ValidationIssue,
  type ValidationResult,
  PROFILE_SECTION_KEYS,
} from '@ocp/core';

/** Human-readable labels for section keys (Spanish). */
const SECTION_LABELS: Record<keyof ProfileSections, string> = {
  formacionAcademica: 'Formación Académica',
  postgrado: 'Postgrado',
  cursosEspecialidad: 'Cursos de Especialidad',
  certificacionesCiberseguridad: 'Certificaciones de Ciberseguridad',
  certificacionesSistemasInstitucionales: 'Certificaciones de Sistemas Institucionales',
  cursosAdministrativos: 'Cursos Administrativos',
  cursosProgramacion: 'Cursos de Programación',
  cursosGenerales: 'Cursos Generales',
  experienciaAdministrativa: 'Experiencia Administrativa',
  experienciaDocente: 'Experiencia Docente',
  experienciaDesarrollo: 'Experiencia en Desarrollo',
  reconocimientosExpositor: 'Reconocimientos como Expositor',
  reconocimientosRepresentacion: 'Reconocimientos por Representación',
  reconocimientosLaborales: 'Reconocimientos Laborales',
  idiomas: 'Idiomas',
  habilidades: 'Habilidades',
};

/**
 * Implementation of the RulesEngine port.
 *
 * Validates profiles against institutional rules and produces transformed
 * views that conform to those rules. Never mutates the input profile.
 */
export class InstitutionalRulesEngine implements RulesEngine {
  /**
   * Validate a profile against an institutional rule set.
   *
   * Returns a ValidationResult with `valid = true` only when there are
   * zero issues with severity 'error'. Warnings and info do not block.
   */
  validate(profile: ProfessionalProfile, rules: InstitutionalRuleSet): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Check required sections
    for (const sectionKey of rules.requiredSections) {
      const entries = profile.sections[sectionKey];
      if (!entries || entries.length === 0) {
        issues.push({
          severity: 'error',
          code: 'MISSING_REQUIRED_SECTION',
          message: `La sección "${SECTION_LABELS[sectionKey]}" es obligatoria y está vacía.`,
          field: sectionKey,
        });
      }
    }

    // Check photo requirement
    if (rules.requirePhoto && !profile.personalInfo.photo) {
      issues.push({
        severity: 'error',
        code: 'MISSING_PHOTO',
        message: 'Se requiere una foto de perfil.',
        field: 'personalInfo.photo',
      });
    }

    // Check summary length
    if (rules.maxSummaryLength && profile.personalInfo.summary) {
      if (profile.personalInfo.summary.length > rules.maxSummaryLength) {
        issues.push({
          severity: 'warning',
          code: 'SUMMARY_TOO_LONG',
          message: `El resumen profesional excede el límite de ${rules.maxSummaryLength} caracteres (actual: ${profile.personalInfo.summary.length}).`,
          field: 'personalInfo.summary',
        });
      }
    }

    // Check onlyVerified — warn if there are unverified entries in included sections
    if (rules.onlyVerified) {
      const sectionsToCheck = this.resolveSections(rules);
      for (const sectionKey of sectionsToCheck) {
        const entries = profile.sections[sectionKey] as Array<{ verified?: boolean }>;
        const unverifiedCount = entries.filter((e) => !e.verified).length;
        if (unverifiedCount > 0) {
          issues.push({
            severity: 'warning',
            code: 'UNVERIFIED_ENTRIES',
            message: `${unverifiedCount} entrada(s) sin verificar en "${SECTION_LABELS[sectionKey]}" serán excluidas.`,
            field: sectionKey,
          });
        }
      }
    }

    // Add notes as info
    if (rules.notes) {
      issues.push({
        severity: 'info',
        code: 'INSTITUTIONAL_NOTE',
        message: rules.notes,
      });
    }

    return {
      valid: issues.every((issue) => issue.severity !== 'error'),
      issues,
    };
  }

  /**
   * Apply rules to produce a transformed view of the profile.
   *
   * The original profile object is NOT mutated; a new object is returned.
   *
   * Transformations applied (in order):
   * 1. Filter sections to only those included (or all minus excluded)
   * 2. Remove unverified entries if onlyVerified is set
   * 3. Truncate summary if maxSummaryLength is set
   */
  applyRules(profile: ProfessionalProfile, rules: InstitutionalRuleSet): ProfessionalProfile {
    const sectionsToInclude = this.resolveSections(rules);

    // Build new sections object
    const newSections: ProfileSections = {} as ProfileSections;

    for (const key of PROFILE_SECTION_KEYS) {
      if (sectionsToInclude.includes(key)) {
        let entries = [...profile.sections[key]] as unknown as Array<Record<string, unknown>>;

        // Filter unverified entries if required
        if (rules.onlyVerified) {
          entries = entries.filter((entry) => entry['verified'] === true);
        }

        (newSections[key] as unknown) = entries;
      } else {
        // Section excluded: return empty array
        (newSections[key] as unknown) = [];
      }
    }

    // Handle summary truncation
    let personalInfo = { ...profile.personalInfo };
    if (rules.maxSummaryLength && personalInfo.summary) {
      if (personalInfo.summary.length > rules.maxSummaryLength) {
        personalInfo = {
          ...personalInfo,
          summary: personalInfo.summary.slice(0, rules.maxSummaryLength),
        };
      }
    }

    return {
      id: profile.id,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      personalInfo,
      sections: newSections,
    };
  }

  /**
   * Resolve which section keys should be included based on the rules.
   *
   * Logic:
   * - If includeSections is non-empty, use that (whitelist)
   * - Otherwise, include all sections EXCEPT those in excludeSections
   */
  private resolveSections(rules: InstitutionalRuleSet): Array<keyof ProfileSections> {
    if (rules.includeSections.length > 0) {
      // Whitelist mode: only include specified sections
      return rules.includeSections.filter((key) => !rules.excludeSections.includes(key));
    }

    // Blacklist mode: include all except excluded
    return PROFILE_SECTION_KEYS.filter(
      (key) => !rules.excludeSections.includes(key),
    ) as Array<keyof ProfileSections>;
  }
}
