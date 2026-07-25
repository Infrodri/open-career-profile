import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentFileUrl, uploadDocument, linkEvidence } from '../api/document.api';
import type { Evidence, SectionKey } from '../types/profile';

interface VerifyEntryButtonProps {
  /** The profile that owns this entry. */
  profileId: string;
  /** Which section this entry belongs to. */
  sectionKey: SectionKey;
  /** The entry's id within the section. */
  entryId: string;
  /** Whether the entry is already verified. */
  verified: boolean;
  /** Evidence links already pointing at this entry. */
  evidence: Evidence[];
}

/**
 * Inline action for each profile entry:
 * - If not verified: shows "Verificar" → opens file picker → uploads → links → marks verified
 * - If verified: shows "Ver certificado" → opens the document in a new tab
 */
export function VerifyEntryButton({
  profileId,
  sectionKey,
  entryId,
  verified,
  evidence,
}: VerifyEntryButtonProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setError(null);

      // 1. Upload the file, linked to the profile
      const result = await uploadDocument(file, { profileId });

      // 2. Link it as evidence of this specific entry
      await linkEvidence(result.documentId, [{ sectionType: sectionKey, entryId }]);

      // 3. Mark the entry as verified via the section API
      await fetch(`/api/profiles/${profileId}/sections/${sectionKey}/${entryId}/verify`, {
        method: 'PATCH',
      });

      return result;
    },
    onSuccess: () => {
      setIsUploading(false);
      // Invalidate profile and evidence queries so the UI updates
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['evidence'] });
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: Error) => {
      setIsUploading(false);
      setError(err.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      verifyMutation.mutate(file);
    }
    // Reset so the same file can be selected again if needed
    e.target.value = '';
  };

  // Already verified: show "Ver certificado" button
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

  // Not verified: show "Verificar" button
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:opacity-50 transition-colors"
        title="Sube el PDF o foto del certificado para verificar esta entrada"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        {isUploading ? 'Subiendo...' : 'Verificar'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}
