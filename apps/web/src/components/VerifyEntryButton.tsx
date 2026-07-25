import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentFileUrl, uploadDocument, linkEvidence } from '../api/document.api';
import type { Evidence, SectionKey } from '../types/profile';
import { MultiPhotoCapture } from './MultiPhotoCapture';

interface VerifyEntryButtonProps {
  profileId: string;
  sectionKey: SectionKey;
  entryId: string;
  verified: boolean;
  evidence: Evidence[];
}

/**
 * Action button for each profile entry:
 * - Not verified → "Verificar" → opens MultiPhotoCapture → uploads → links → marks verified
 * - Verified → "Ver certificado" → opens the document in a new tab
 */
export function VerifyEntryButton({
  profileId,
  sectionKey,
  entryId,
  verified,
  evidence,
}: VerifyEntryButtonProps) {
  const queryClient = useQueryClient();
  const [showCapture, setShowCapture] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyMutation = useMutation({
    mutationFn: async (file: File) => {
      setError(null);

      // 1. Upload the file (PDF or image), linked to the profile
      const result = await uploadDocument(file, { profileId });

      // 2. Link it as evidence of this specific entry
      await linkEvidence(result.documentId, [{ sectionType: sectionKey, entryId }]);

      // 3. Mark the entry as verified
      await fetch(`/api/profiles/${profileId}/sections/${sectionKey}/${entryId}/verify`, {
        method: 'PATCH',
      });

      return result;
    },
    onSuccess: () => {
      setShowCapture(false);
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['evidence'] });
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Already verified: show "Ver certificado"
  if (verified && evidence.length > 0) {
    const lastEvidence = evidence[evidence.length - 1]!;
    return (
      <a
        href={documentFileUrl(lastEvidence.documentId)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
        title="Ver el documento que respalda esta información"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
        Ver certificado
      </a>
    );
  }

  // Not verified: show capture UI
  if (showCapture) {
    return (
      <div className="w-full mt-2">
        <MultiPhotoCapture
          onComplete={(file) => verifyMutation.mutate(file)}
          onCancel={() => { setShowCapture(false); setError(null); }}
          isUploading={verifyMutation.isPending}
        />
        {error && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }

  // Not verified: show "Verificar" button
  return (
    <button
      type="button"
      onClick={() => setShowCapture(true)}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
      title="Sube el PDF o toma fotos del certificado para verificar"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
      Verificar
    </button>
  );
}
