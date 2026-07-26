import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { analyzeFormat, type AnalyzeFormatResult } from '../api/ai-format.api';
import { DocumentUploader } from '../components/DocumentUploader';
import { SECTION_LABELS, type SectionKey } from '../types/profile';

export function FormatImportPage() {
  const [extractedText, setExtractedText] = useState('');
  const [result, setResult] = useState<AnalyzeFormatResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelected = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      const res = await fetch('/api/documents/extract', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Error al procesar el archivo');
      const json = await res.json();
      const text = json.data?.text ?? '';
      if (!text) throw new Error('No se pudo extraer texto del documento');
      setExtractedText(text);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al procesar');
    } finally {
      setIsUploading(false);
    }
  };

  const analyzeMutation = useMutation({
    mutationFn: () => analyzeFormat(extractedText),
    onSuccess: (data) => setResult(data),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const rules = result?.ruleSet ?? {};
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Formato detectado (${new Date().toLocaleDateString()})`,
          institution: 'Detectado por IA',
          rules,
        }),
      });
      if (!res.ok) throw new Error('No se pudo guardar');
      return res.json();
    },
    onSuccess: () => setSaved(true),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Importar Formato Institucional
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Sube el formato que te pide una institución. La IA detectará los requisitos y creará las reglas automáticamente.
        </p>
      </header>

      {/* Step 1: Upload */}
      {!extractedText && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Paso 1: Sube el formato
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Acepta PDF o imagen del formulario/formato institucional.
          </p>
          <DocumentUploader
            onFileSelected={handleFileSelected}
            isProcessing={isUploading}
          />
        </section>
      )}

      {/* Step 2: Analyze */}
      {extractedText && !result && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Paso 2: Analizar formato
          </h2>
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded text-xs text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto font-mono">
            {extractedText.slice(0, 500)}...
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {analyzeMutation.isPending ? 'Analizando con IA...' : 'Analizar formato con IA'}
            </button>
            <button
              type="button"
              onClick={() => setExtractedText('')}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:underline"
            >
              Volver
            </button>
          </div>
          {analyzeMutation.isError && (
            <p className="mt-2 text-sm text-red-600">{analyzeMutation.error.message}</p>
          )}
        </section>
      )}

      {/* Step 3: Review detected rules */}
      {result && !saved && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Paso 3: Revisar reglas detectadas
          </h2>

          {result.confidence > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Confianza:</span>
              <span className={`text-sm font-medium ${result.confidence >= 0.7 ? 'text-green-600' : result.confidence >= 0.4 ? 'text-amber-600' : 'text-red-500'}`}>
                {Math.round(result.confidence * 100)}%
              </span>
            </div>
          )}

          {result.notes && (
            <p className="mb-4 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              {result.notes}
            </p>
          )}

          <RuleSetPreview ruleSet={result.ruleSet} />

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Guardando...' : 'Guardar como formato institucional'}
            </button>
            <button
              type="button"
              onClick={() => { setResult(null); setExtractedText(''); }}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:underline"
            >
              Empezar de nuevo
            </button>
          </div>
          {saveMutation.isError && (
            <p className="mt-2 text-sm text-red-600">{saveMutation.error.message}</p>
          )}
        </section>
      )}

      {/* Success */}
      {saved && (
        <section className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
          <h2 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
            Formato guardado
          </h2>
          <p className="text-sm text-green-600 dark:text-green-400">
            El formato institucional se guardó correctamente. Lo puedes seleccionar al generar tu CV.
          </p>
          <button
            type="button"
            onClick={() => { setResult(null); setExtractedText(''); setSaved(false); }}
            className="mt-3 text-sm text-green-700 dark:text-green-300 hover:underline"
          >
            Importar otro formato
          </button>
        </section>
      )}
    </div>
  );
}

// --- Rule Set Preview ---

function RuleSetPreview({ ruleSet }: { ruleSet: Record<string, unknown> }) {
  const required = Array.isArray(ruleSet['requiredSections']) ? ruleSet['requiredSections'] as string[] : [];
  const included = Array.isArray(ruleSet['includeSections']) ? ruleSet['includeSections'] as string[] : [];
  const excluded = Array.isArray(ruleSet['excludeSections']) ? ruleSet['excludeSections'] as string[] : [];
  const onlyVerified = ruleSet['onlyVerified'] === true;
  const requirePhoto = ruleSet['requirePhoto'] === true;
  const notes = typeof ruleSet['notes'] === 'string' ? ruleSet['notes'] : '';

  const labelFor = (key: string) => SECTION_LABELS[key as SectionKey] ?? key;

  return (
    <div className="space-y-3 text-sm">
      {required.length > 0 && (
        <div>
          <span className="font-medium text-red-600 dark:text-red-400">Obligatorias: </span>
          <span className="text-slate-700 dark:text-slate-300">{required.map(labelFor).join(', ')}</span>
        </div>
      )}
      {included.length > 0 && (
        <div>
          <span className="font-medium text-green-600 dark:text-green-400">Incluir: </span>
          <span className="text-slate-700 dark:text-slate-300">{included.map(labelFor).join(', ')}</span>
        </div>
      )}
      {excluded.length > 0 && (
        <div>
          <span className="font-medium text-slate-500">Excluir: </span>
          <span className="text-slate-700 dark:text-slate-300">{excluded.map(labelFor).join(', ')}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {onlyVerified && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-xs">Solo verificados</span>}
        {requirePhoto && <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs">Requiere foto</span>}
      </div>
      {notes && <p className="text-xs text-slate-500 italic">{notes}</p>}
    </div>
  );
}
