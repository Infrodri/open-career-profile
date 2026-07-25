import { useState } from 'react';
import type { ProfileAnalysis } from '../api/document.api';

interface ExtractedProfileReviewProps {
  analysis: ProfileAnalysis;
  onConfirm: (personalInfo: Record<string, unknown>, sections: ProfileAnalysis['sections']) => void;
  onDiscard: () => void;
  isSaving: boolean;
}

const PERSONAL_LABELS: Record<string, string> = {
  fullName: 'Nombre completo',
  profesiones: 'Profesiones',
  email: 'Correo electrónico',
  phone: 'Teléfono',
  city: 'Ciudad',
  country: 'País',
  nacionalidad: 'Nacionalidad',
  sexo: 'Sexo',
  estadoCivil: 'Estado civil',
  summary: 'Resumen profesional',
  birthDate: 'Fecha de nacimiento',
  identityDocument: 'Cédula de identidad',
  libretaMilitar: 'Libreta de servicio militar',
  linkedin: 'LinkedIn',
  github: 'GitHub',
};

const SECTION_LABELS: Record<string, string> = {
  formacionAcademica: 'Formación Académica',
  postgrado: 'Postgrado',
  experienciaAdministrativa: 'Experiencia Administrativa',
  experienciaDocente: 'Experiencia Docente',
  experienciaDesarrollo: 'Experiencia en Desarrollo',
  certificacionesCiberseguridad: 'Certificaciones en Ciberseguridad',
  certificacionesSistemasInstitucionales: 'Certificaciones en Sistemas Institucionales',
  cursosAdministrativos: 'Cursos Administrativos/Normativos',
  cursosProgramacion: 'Cursos de Programación',
  cursosEspecialidad: 'Cursos de Especialidad',
  cursosGenerales: 'Cursos y Congresos',
  reconocimientosExpositor: 'Reconocimientos como Expositor/Ponente',
  reconocimientosRepresentacion: 'Reconocimientos de Representación',
  reconocimientosLaborales: 'Reconocimientos Laborales',
  languages: 'Idiomas',
  skills: 'Habilidades',
  // Legacy keys (backwards compat)
  workExperience: 'Experiencia Laboral',
  education: 'Educación',
  certifications: 'Certificaciones',
  courses: 'Cursos',
};

const FIELD_LABELS: Record<string, string> = {
  position: 'Cargo',
  institution: 'Institución',
  startDate: 'Inicio',
  endDate: 'Fin',
  description: 'Descripción',
  location: 'Ubicación',
  title: 'Título',
  field: 'Área',
  tipo: 'Tipo',
  detalle: 'Detalle',
  name: 'Nombre',
  issuer: 'Emisor',
  issueDate: 'Fecha',
  expirationDate: 'Vencimiento',
  completionDate: 'Fecha',
  duration: 'Duración',
  category: 'Categoría',
  level: 'Nivel',
  certification: 'Certificación',
  certificado: 'Tiene certificado',
  contenido: 'Contenido',
  profesiones: 'Profesiones',
  proyectos: 'Proyectos',
};

export function ExtractedProfileReview({
  analysis,
  onConfirm,
  onDiscard,
  isSaving,
}: ExtractedProfileReviewProps) {
  const [personalInfo, setPersonalInfo] = useState(analysis.personalInfo);
  const [sections, setSections] = useState(analysis.sections);

  const updatePersonal = (key: string, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [key]: value }));
  };

  const updateEntry = (
    sectionKey: string,
    index: number,
    field: string,
    value: string,
  ) => {
    setSections((prev) => {
      const list = [...(prev[sectionKey] ?? [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [sectionKey]: list };
    });
  };

  const removeEntry = (sectionKey: string, index: number) => {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: (prev[sectionKey] ?? []).filter((_, i) => i !== index),
    }));
  };

  const totalEntries = Object.values(sections).reduce((sum, arr) => sum + arr.length, 0);

  const confidenceColor =
    analysis.confidence >= 0.7
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : analysis.confidence >= 0.4
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';

  return (
    <div className="space-y-6">
      {/* Resumen del análisis */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Información detectada
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Tipo de documento: <strong>{analysis.documentType}</strong> · {totalEntries} registros
              encontrados
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${confidenceColor}`}>
            Confianza {Math.round(analysis.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Recomendaciones de la IA */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">
            Recomendaciones de la IA
          </h3>
          <ul className="space-y-1.5">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-blue-800 dark:text-blue-300 flex gap-2">
                <span className="text-blue-500 dark:text-blue-400">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Información personal */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
          Información Personal
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.keys(PERSONAL_LABELS).map((key) => {
            const value = personalInfo[key];
            // Arrays (like profesiones)
            if (Array.isArray(value)) {
              return (
                <div key={key} className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {PERSONAL_LABELS[key]}
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {value.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                        {String(item)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <div key={key} className={key === 'summary' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {PERSONAL_LABELS[key]}
                </label>
                {key === 'summary' ? (
                  <textarea
                    value={String(value ?? '')}
                    onChange={(e) => updatePersonal(key, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={String(value ?? '')}
                    onChange={(e) => updatePersonal(key, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Secciones extraídas */}
      {Object.keys(sections).map((sectionKey) => {
        const entries = sections[sectionKey] ?? [];
        if (entries.length === 0) return null;

        return (
          <div
            key={sectionKey}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
              {SECTION_LABELS[sectionKey] ?? sectionKey}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                ({entries.length})
              </span>
            </h3>
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-md border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex justify-end mb-2">
                    <button
                      type="button"
                      onClick={() => removeEntry(sectionKey, index)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.keys(entry).map((field) => {
                      const value = entry[field];
                      // Skip rendering arrays inline — show them below
                      if (Array.isArray(value)) {
                        return (
                          <div key={field} className="sm:col-span-2">
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              {FIELD_LABELS[field] ?? field}
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {value.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded"
                                >
                                  {String(item)}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      // Booleans
                      if (typeof value === 'boolean') {
                        return (
                          <div key={field}>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              {FIELD_LABELS[field] ?? field}
                            </label>
                            <span className="text-sm text-slate-900 dark:text-slate-100">
                              {value ? 'Sí' : 'No'}
                            </span>
                          </div>
                        );
                      }
                      // Normal string/number fields
                      return (
                        <div key={field} className={field === 'description' || field === 'detalle' ? 'sm:col-span-2' : ''}>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            {FIELD_LABELS[field] ?? field}
                          </label>
                          <input
                            type="text"
                            value={String(value ?? '')}
                            onChange={(e) => updateEntry(sectionKey, index, field, e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 sticky bottom-20 lg:bottom-4 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
        <button
          type="button"
          onClick={() => onConfirm(personalInfo, sections)}
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Confirmar y guardar en mi perfil'}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={isSaving}
          className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          Descartar
        </button>
      </div>
    </div>
  );
}
