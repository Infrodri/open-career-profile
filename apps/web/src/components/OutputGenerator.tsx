import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { generateOutput, validateProfile } from '../api/profile.api';
import { unwrap } from '../api/http';

interface InstitutionalTemplate {
  id: string;
  name: string;
  institution: string;
}

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  field?: string;
}

interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

async function fetchTemplates(): Promise<InstitutionalTemplate[]> {
  const res = await fetch('/api/templates');
  return unwrap<InstitutionalTemplate[]>(res);
}

interface OutputGeneratorProps {
  profileId: string;
}

export function OutputGenerator({ profileId }: OutputGeneratorProps) {
  const [templateId, setTemplateId] = useState('standard');
  const [format, setFormat] = useState<'html' | 'pdf'>('html');
  const [ruleSetId, setRuleSetId] = useState<string>('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const templatesQuery = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const validateMutation = useMutation({
    mutationFn: () => validateProfile(profileId, ruleSetId),
    onSuccess: (result) => setValidation(result),
  });

  const generateMutation = useMutation({
    mutationFn: () => generateOutput(profileId, templateId, format, ruleSetId || undefined),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      if (format === 'html') {
        window.open(url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `perfil.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    },
  });

  const handleRuleSetChange = (newRuleSetId: string) => {
    setRuleSetId(newRuleSetId);
    setValidation(null);
  };

  const hasErrors = validation?.issues.some((i) => i.severity === 'error') ?? false;

  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
        Generar Documento
      </h3>

      <div className="space-y-4">
        {/* Template de renderizado */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Plantilla de diseño
            <span className="text-slate-400 font-normal ml-1">(cómo se ve el CV)</span>
          </label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">Estándar</option>
            <option value="minimal">Minimalista</option>
            <option value="senasag">Formato SENASAG (Hoja de Vida)</option>
          </select>
        </div>

        {/* Formato institucional (opcional) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Formato institucional
            <span className="text-slate-400 font-normal ml-1">(qué secciones incluir — opcional)</span>
          </label>
          <select
            value={ruleSetId}
            onChange={(e) => handleRuleSetChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sin formato institucional</option>
            {templatesQuery.data?.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name} — {tpl.institution}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            La plantilla de diseño define la apariencia visual. El formato institucional define qué información incluir.
          </p>
        </div>

        {/* Validar contra reglas */}
        {ruleSetId && (
          <button
            type="button"
            onClick={() => validateMutation.mutate()}
            disabled={validateMutation.isPending}
            className="w-full px-4 py-2 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 font-medium rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 transition-colors"
          >
            {validateMutation.isPending ? 'Validando...' : 'Verificar requisitos'}
          </button>
        )}

        {/* Resultado de validación */}
        {validation && (
          <ValidationDisplay issues={validation.issues} valid={validation.valid} />
        )}

        {/* Formato de salida */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Formato de salida
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="html"
                checked={format === 'html'}
                onChange={() => setFormat('html')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">HTML</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={format === 'pdf'}
                onChange={() => setFormat('pdf')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">PDF</span>
            </label>
          </div>
        </div>

        {/* Botón generar */}
        <button
          type="button"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending || (ruleSetId !== '' && hasErrors)}
          className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {generateMutation.isPending ? 'Generando...' : 'Generar Documento'}
        </button>

        {ruleSetId !== '' && hasErrors && (
          <p className="text-xs text-red-600 dark:text-red-400">
            No se puede generar: hay requisitos obligatorios sin cumplir.
          </p>
        )}

        {generateMutation.isError && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            {generateMutation.error.message}
          </p>
        )}
      </div>
    </section>
  );
}

// --- Validation Display ---

function ValidationDisplay({ issues, valid }: { issues: ValidationIssue[]; valid: boolean }) {
  if (issues.length === 0) {
    return (
      <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
        <p className="text-sm text-green-700 dark:text-green-300 font-medium">
          El perfil cumple todos los requisitos.
        </p>
      </div>
    );
  }

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  return (
    <div className="space-y-2">
      {valid && (
        <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            Listo para generar (con advertencias menores).
          </p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
            Requisitos no cumplidos ({errors.length})
          </p>
          <ul className="list-disc list-inside text-xs text-red-600 dark:text-red-400 space-y-0.5">
            {errors.map((issue, idx) => (
              <li key={idx}>{issue.message}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
            Advertencias ({warnings.length})
          </p>
          <ul className="list-disc list-inside text-xs text-amber-600 dark:text-amber-400 space-y-0.5">
            {warnings.map((issue, idx) => (
              <li key={idx}>{issue.message}</li>
            ))}
          </ul>
        </div>
      )}

      {infos.length > 0 && (
        <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
            Notas de la institución
          </p>
          <ul className="list-disc list-inside text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
            {infos.map((issue, idx) => (
              <li key={idx}>{issue.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
