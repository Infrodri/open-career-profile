import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { DocumentUploader } from '../components/DocumentUploader';
import { ExtractedDataReview } from '../components/ExtractedDataReview';
import {
  extractTextFromDocument,
  analyzeDocumentText,
  type DocumentAnalysis,
} from '../api/document.api';

type PageStep = 'upload' | 'processing' | 'review' | 'success' | 'error';

export function DocumentCapturePage() {
  const [step, setStep] = useState<PageStep>('upload');
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const processMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await extractTextFromDocument(file);
      const result = await analyzeDocumentText(text);
      return result;
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setStep('review');
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
      setStep('error');
    },
  });

  const handleFileSelected = (file: File) => {
    setStep('processing');
    setErrorMessage('');
    processMutation.mutate(file);
  };

  const handleConfirm = (_editedFields: Record<string, string>) => {
    // TODO: save to profile via API
    setStep('success');
  };

  const handleDiscard = () => {
    setStep('upload');
    setAnalysis(null);
  };

  const handleReset = () => {
    setStep('upload');
    setAnalysis(null);
    setErrorMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Agregar Documento
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Sube una foto o archivo de un certificado, título, contrato u otro documento.
          La IA extraerá la información automáticamente.
        </p>
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <DocumentUploader
          onFileSelected={handleFileSelected}
          isProcessing={false}
        />
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Procesando documento...
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Extrayendo texto y analizando con IA
          </p>
        </div>
      )}

      {/* Step: Review */}
      {step === 'review' && analysis && (
        <ExtractedDataReview
          analysis={analysis}
          onConfirm={handleConfirm}
          onDiscard={handleDiscard}
          isConfirming={false}
        />
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Documento agregado exitosamente
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            La información fue guardada en tu perfil.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            Subir otro documento
          </button>
        </div>
      )}

      {/* Step: Error */}
      {step === 'error' && (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Error al procesar el documento
          </h2>
          <p className="text-sm text-red-600 dark:text-red-400">
            {errorMessage || 'Ocurrió un error inesperado. Intenta de nuevo.'}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
