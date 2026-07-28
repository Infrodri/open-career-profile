import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fillForm } from '../api/form-fill.api';
import { DocumentUploader } from '../components/DocumentUploader';
import { getActiveProfileId } from '../lib/active-profile';
import { EmptyProfileState } from '../components/EmptyProfileState';

export function FillFormPage() {
  const profileId = getActiveProfileId();
  const [extractedText, setExtractedText] = useState('');
  const [filledResult, setFilledResult] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fillMutation = useMutation({
    mutationFn: () => fillForm(profileId!, extractedText),
    onSuccess: (data) => setFilledResult(data.filledForm),
  });

  if (!profileId) return <EmptyProfileState />;

  const handleFileSelected = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);

      // Use extract endpoint — if it returns 409 (duplicate), fetch the text
      // from the existing document instead of failing
      const res = await fetch('/api/documents/extract', { method: 'POST', body: formData });

      if (res.status === 409) {
        // Duplicate — try to read the file directly as text on the client
        const text = await readFileAsText(file);
        if (text) {
          setExtractedText(text);
          return;
        }
        throw new Error('Este archivo ya fue subido. Intenta con otro o usa "Agregar Documento" primero.');
      }

      if (!res.ok) throw new Error('Error al procesar');
      const json = await res.json();
      const text = json.data?.text ?? '';
      if (!text) throw new Error('No se pudo extraer texto del formulario');
      setExtractedText(text);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Llenar Formulario
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Sube un formulario de postulación (PDF, Word, imagen). La IA llenará cada campo con los datos de tu perfil automáticamente.
        </p>
      </header>

      {/* Step 1: Upload form */}
      {!extractedText && !filledResult && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Paso 1: Sube el formulario vacío
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Acepta PDF, Word o imagen del formulario de postulación que te pidieron llenar.
          </p>
          <DocumentUploader onFileSelected={handleFileSelected} isProcessing={isUploading} />
        </section>
      )}

      {/* Step 2: Confirm and fill */}
      {extractedText && !filledResult && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
            Paso 2: Llenar con IA
          </h2>
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded text-xs text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto font-mono whitespace-pre-wrap">
            {extractedText.slice(0, 800)}...
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fillMutation.mutate()}
              disabled={fillMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {fillMutation.isPending ? 'Llenando formulario con IA...' : 'Llenar con mis datos'}
            </button>
            <button
              type="button"
              onClick={() => setExtractedText('')}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:underline"
            >
              Volver
            </button>
          </div>
          {fillMutation.isError && (
            <p className="mt-2 text-sm text-red-600">{fillMutation.error.message}</p>
          )}
        </section>
      )}

      {/* Step 3: Show filled result */}
      {filledResult && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              Formulario completado
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(filledResult);
                  alert('Copiado al portapapeles');
                }}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Copiar todo
              </button>
              <button
                type="button"
                onClick={() => { setFilledResult(''); setExtractedText(''); }}
                className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Nuevo formulario
              </button>
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 max-h-[70vh] overflow-y-auto">
            <pre className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
              {filledResult}
            </pre>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Revisa la información antes de usarla. Puedes copiar y pegar en el formulario digital, o usar como referencia para llenar el formato físico.
          </p>
        </section>
      )}
    </div>
  );
}


/**
 * Try to read a file as text on the client side.
 * Works for text-based files (txt, csv). For PDFs/images returns null.
 */
async function readFileAsText(file: File): Promise<string | null> {
  // Only attempt for text-like types
  if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
    return file.text();
  }
  return null;
}
