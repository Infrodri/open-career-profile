import { useState } from 'react';
import type { DocumentAnalysis } from '../api/document.api';

interface ExtractedDataReviewProps {
  analysis: DocumentAnalysis;
  onConfirm: (editedFields: Record<string, string>) => void;
  onDiscard: () => void;
  isConfirming: boolean;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  certificate: 'Certificado',
  degree: 'Título académico',
  contract: 'Contrato laboral',
  reference: 'Carta de referencia',
  course: 'Curso / Capacitación',
  other: 'Otro',
};

const SECTION_LABELS: Record<string, string> = {
  workExperience: 'Experiencia Laboral',
  education: 'Educación',
  certifications: 'Certificaciones',
  courses: 'Cursos',
  skills: 'Habilidades',
  languages: 'Idiomas',
};

export function ExtractedDataReview({
  analysis,
  onConfirm,
  onDiscard,
  isConfirming,
}: ExtractedDataReviewProps) {
  const [fields, setFields] = useState<Record<string, string>>(
    analysis.extractedFields,
  );

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const confidenceColor =
    analysis.confidence >= 0.8
      ? 'text-green-600 dark:text-green-400'
      : analysis.confidence >= 0.5
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400';

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          Datos extraídos
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Revisa y edita la información antes de confirmar.
        </p>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md">
        <div>
          <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Tipo de documento
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {DOCUMENT_TYPE_LABELS[analysis.documentType] ?? analysis.documentType}
          </span>
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Sección sugerida
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {SECTION_LABELS[analysis.suggestedSection] ?? analysis.suggestedSection}
          </span>
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Confianza
          </span>
          <span className={`text-sm font-medium ${confidenceColor}`}>
            {Math.round(analysis.confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Campos editables */}
      <div className="space-y-3">
        {Object.entries(fields).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={() => onConfirm(fields)}
          disabled={isConfirming}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isConfirming ? 'Guardando...' : 'Confirmar y agregar al perfil'}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={isConfirming}
          className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          Descartar
        </button>
      </div>
    </div>
  );
}
