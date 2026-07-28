import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentUploader } from '../components/DocumentUploader';
import { ExtractedProfileReview } from '../components/ExtractedProfileReview';
import {
  analyzeDocumentText,
  deleteDocument,
  documentFileUrl,
  importProfile,
  linkEvidence,
  uploadDocument,
  type ExtractionResult,
  type ProfileAnalysis,
} from '../api/document.api';
import { getActiveProfileId, setActiveProfileId } from '../lib/active-profile';
import { SECTION_KEYS, SECTION_LABELS, type SectionKey } from '../types/profile';

type Step = 'upload' | 'processing' | 'review' | 'success' | 'error';
type UploadMode = 'full' | 'single';

export function DocumentCapturePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>('upload');
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [upload, setUpload] = useState<ExtractionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedProfileId, setSavedProfileId] = useState('');
  const [uploadMode, setUploadMode] = useState<UploadMode>('full');
  const [targetSection, setTargetSection] = useState<SectionKey>('cursosEspecialidad');

  const activeProfileId = getActiveProfileId();

  const processMutation = useMutation({
    mutationFn: async (file: File) => {
      // The file is stored server-side here, so it survives even if the AI step fails.
      const result = await uploadDocument(file, {
        ...(activeProfileId ? { profileId: activeProfileId } : {}),
      });
      setUpload(result);

      if (!result.hasText) {
        throw new Error(
          'El documento se guardó, pero no se pudo leer texto de él. Si es una foto, intenta con una imagen más nítida o mejor iluminada.',
        );
      }

      return analyzeDocumentText(result.text);
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setStep('review');
      // The document is already listed under "Mis Documentos".
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
      setStep('error');
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  // Single certificate mode: upload, add to the selected section, link as evidence
  const singleCertMutation = useMutation({
    mutationFn: async (file: File) => {
      const result = await uploadDocument(file, {
        ...(activeProfileId ? { profileId: activeProfileId } : {}),
      });
      setUpload(result);

      if (!activeProfileId) {
        throw new Error('Necesitas crear un perfil antes de agregar certificados individuales.');
      }

      // Extract a simple name from the filename or text
      const name = result.hasText
        ? result.text.split('\n').filter(Boolean)[0]?.slice(0, 100) ?? file.name
        : file.name.replace(/\.[^.]+$/, '');

      // Add entry to the selected section.
      // Different sections use different field names for the headline:
      // - formacionAcademica, postgrado: "title"
      // - cursosEspecialidad, cursos*, certificaciones*, reconocimientos*: "name"
      // - experiencia*: "position"
      const usesTitle = ['formacionAcademica', 'postgrado'].includes(targetSection);
      const usesPosition = targetSection.startsWith('experiencia');

      const entryData: Record<string, unknown> = {
        issuer: 'Ver documento adjunto',
        issueDate: new Date().getFullYear().toString(),
        verified: true,
      };

      if (usesTitle) {
        entryData['title'] = name;
        entryData['institution'] = 'Ver documento adjunto';
      } else if (usesPosition) {
        entryData['position'] = name;
        entryData['institution'] = 'Ver documento adjunto';
        entryData['startDate'] = new Date().getFullYear().toString();
      } else {
        entryData['name'] = name;
      }

      // Add entry to the selected section
      const entryRes = await fetch(`/api/profiles/${activeProfileId}/sections/${targetSection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData),
      });

      if (!entryRes.ok) throw new Error('No se pudo agregar la entrada');
      const entryJson = await entryRes.json();
      const entryId = entryJson.data?.id;

      // Link the document as evidence
      if (entryId) {
        await linkEvidence(result.documentId, [{ sectionType: targetSection, entryId }]);
      }

      return result;
    },
    onSuccess: () => {
      setSavedProfileId(activeProfileId!);
      setStep('success');
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
      void queryClient.invalidateQueries({ queryKey: ['evidence'] });
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
      setStep('error');
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({
      personalInfo,
      sections,
    }: {
      personalInfo: Record<string, unknown>;
      sections: ProfileAnalysis['sections'];
    }) =>
      importProfile(personalInfo, sections, {
        // Extend the existing profile instead of creating a duplicate.
        ...(activeProfileId ? { profileId: activeProfileId } : {}),
        // Links the document as evidence of every entry created from it.
        ...(upload ? { documentId: upload.documentId } : {}),
      }),
    onSuccess: (data) => {
      setSavedProfileId(data.id);
      setActiveProfileId(data.id);
      setStep('success');
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
      void queryClient.invalidateQueries({ queryKey: ['evidence'] });
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
      setStep('error');
    },
  });

  const reset = () => {
    setStep('upload');
    setAnalysis(null);
    setUpload(null);
    setErrorMessage('');
  };

  /**
   * Discard the upload and remove the stored file.
   *
   * The file is persisted before the AI step so it survives a failure, but
   * discarding means the user does not want it. Leaving it behind would also
   * block a retry, since uploading the same file again hits deduplication.
   */
  const discardMutation = useMutation({
    mutationFn: async () => {
      if (upload) {
        await deleteDocument(upload.documentId);
      }
    },
    onSettled: () => {
      // Return to the upload step even if cleanup failed: the document can
      // still be removed by hand from "Mis Documentos".
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
      reset();
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Agregar Documento
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Sube tu hoja de vida, un certificado, título o cualquier documento profesional. La IA
          extraerá la información y podrás revisarla antes de guardarla.
        </p>
        {activeProfileId && step === 'upload' && (
          <p className="mt-3 text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-2">
            La información se agregará a tu perfil existente, y el archivo quedará guardado como
            respaldo.
          </p>
        )}
      </header>

      {step === 'upload' && (
        <div className="space-y-4">
          {/* Mode selector */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setUploadMode('full')}
              className={`flex-1 p-3 rounded-lg border text-left transition-colors ${
                uploadMode === 'full'
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Hoja de Vida completa</p>
              <p className="text-xs text-slate-500 mt-0.5">La IA analiza todas las secciones automáticamente</p>
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('single')}
              className={`flex-1 p-3 rounded-lg border text-left transition-colors ${
                uploadMode === 'single'
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
              }`}
            >
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Certificado individual</p>
              <p className="text-xs text-slate-500 mt-0.5">Eliges la categoría manualmente (sin IA)</p>
            </button>
          </div>

          {/* Category selector for single certificate */}
          {uploadMode === 'single' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                ¿A qué sección pertenece?
              </label>
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value as SectionKey)}
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                {SECTION_KEYS.map((key) => (
                  <option key={key} value={key}>{SECTION_LABELS[key]}</option>
                ))}
              </select>
            </div>
          )}

          <DocumentUploader
            onFileSelected={(f) => {
              if (uploadMode === 'single') {
                setStep('processing');
                singleCertMutation.mutate(f);
              } else {
                setStep('processing');
                processMutation.mutate(f);
              }
            }}
            isProcessing={false}
          />
        </div>
      )}

      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
            Analizando documento...
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
            Guardando el archivo, extrayendo el texto y detectando información profesional con IA.
            Esto puede tomar unos segundos.
          </p>
        </div>
      )}

      {step === 'review' && analysis && (
        <div className="space-y-4">
          {upload && (
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Archivo guardado: <strong className="text-slate-900 dark:text-slate-100">{upload.fileName}</strong>
              </p>
              <a
                href={documentFileUrl(upload.documentId)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver original
              </a>
            </div>
          )}

          <ExtractedProfileReview
            analysis={analysis}
            onConfirm={(personalInfo, sections) => saveMutation.mutate({ personalInfo, sections })}
            onDiscard={() => discardMutation.mutate()}
            isSaving={saveMutation.isPending}
          />
        </div>
      )}

      {step === 'success' && (
        <div className="text-center py-16 space-y-5">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
            <svg className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Información guardada en tu perfil
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              El documento original quedó vinculado como respaldo de las entradas creadas.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => navigate(`/profile/${savedProfileId}`)}
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            >
              Ver mi perfil
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Subir otro documento
            </button>
          </div>
        </div>
      )}

      {step === 'error' && (
        <div className="space-y-5 py-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <svg className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              No se pudo procesar el documento
            </h2>
            <p className="text-sm text-red-600 dark:text-red-400 max-w-md mx-auto">{errorMessage}</p>
          </div>

          {upload && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                El archivo sí quedó guardado. Puedes revisarlo o eliminarlo desde{' '}
                <Link to="/documentos" className="font-semibold underline">
                  Mis Documentos
                </Link>
                .
              </p>
            </div>
          )}

          {upload?.text && (
            <details className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <summary className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Ver texto extraído del documento
              </summary>
              <pre className="mt-3 text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {upload.text}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => discardMutation.mutate()}
              disabled={discardMutation.isPending}
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {discardMutation.isPending ? 'Descartando...' : 'Descartar y subir otro'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Conservar archivo y volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
