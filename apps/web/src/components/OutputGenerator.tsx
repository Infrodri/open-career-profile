import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { generateOutput } from '../api/profile.api';

interface OutputGeneratorProps {
  profileId: string;
}

export function OutputGenerator({ profileId }: OutputGeneratorProps) {
  const [templateId, setTemplateId] = useState('standard');
  const [format, setFormat] = useState<'html' | 'pdf'>('html');

  const mutation = useMutation({
    mutationFn: () => generateOutput(profileId, templateId, format),
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

  return (
    <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
        Generar Documento
      </h3>

      <div className="space-y-4">
        {/* Selección de plantilla */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Seleccionar plantilla
          </label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">Estándar</option>
            <option value="minimal">Minimalista</option>
          </select>
        </div>

        {/* Selección de formato */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Formato
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
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {mutation.isPending ? 'Generando...' : 'Generar Documento'}
        </button>

        {mutation.isError && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            {mutation.error.message}
          </p>
        )}
      </div>
    </section>
  );
}
