import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentFileUrl, uploadDocument, linkEvidence } from '../api/document.api';
import type { Evidence, SectionEntry, SectionKey } from '../types/profile';
import { FIELD_LABELS } from '../types/profile';
import { MultiPhotoCapture } from './MultiPhotoCapture';

interface EntryActionsProps {
  profileId: string;
  sectionKey: SectionKey;
  entry: SectionEntry;
  evidence: Evidence[];
}

/**
 * Action buttons for a profile entry:
 * - Eye icon: view details in a modal
 * - Edit icon: edit the entry in a floating modal
 * - Verify: upload document OR mark as verified manually
 */
export function EntryActions({ profileId, sectionKey, entry, evidence }: EntryActionsProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  return (
    <div className="flex items-center gap-1 shrink-0">
      {/* View button */}
      <button
        type="button"
        onClick={() => setShowDetail(true)}
        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
        title="Ver detalles"
        aria-label="Ver detalles de la entrada"
      >
        <EyeIcon />
      </button>

      {/* Edit button */}
      <button
        type="button"
        onClick={() => setShowEdit(true)}
        className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded transition-colors"
        title="Editar"
        aria-label="Editar entrada"
      >
        <EditIcon />
      </button>

      {/* Verify action */}
      {entry.verified && evidence.length > 0 ? (
        <a
          href={documentFileUrl(evidence[evidence.length - 1]!.documentId)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-green-600 dark:text-green-400 hover:text-green-800 rounded transition-colors"
          title="Ver certificado"
          aria-label="Ver documento de respaldo"
        >
          <CertificateIcon />
        </a>
      ) : (
        <button
          type="button"
          onClick={() => setShowVerify(true)}
          className="p-1.5 text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 rounded transition-colors"
          title="Verificar"
          aria-label="Verificar esta entrada"
        >
          <UploadIcon />
        </button>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <DetailModal entry={entry} sectionKey={sectionKey} onClose={() => setShowDetail(false)} />
      )}

      {/* Edit Modal */}
      {showEdit && (
        <EditModal
          profileId={profileId}
          sectionKey={sectionKey}
          entry={entry}
          onClose={() => setShowEdit(false)}
        />
      )}

      {/* Verify Modal */}
      {showVerify && (
        <VerifyModal
          profileId={profileId}
          sectionKey={sectionKey}
          entry={entry}
          onClose={() => setShowVerify(false)}
        />
      )}
    </div>
  );
}

// =============================================================================
// Detail Modal
// =============================================================================

function DetailModal({ entry, sectionKey, onClose }: { entry: SectionEntry; sectionKey: string; onClose: () => void }) {
  const fields = Object.entries(entry).filter(
    ([key]) => !['id', 'createdAt', 'updatedAt', 'profileId'].includes(key),
  );

  return (
    <Overlay onClose={onClose}>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Detalle de la entrada</h3>
      <p className="text-xs text-slate-400 mb-3">Sección: {sectionKey}</p>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {fields.map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-28 shrink-0">
              {FIELD_LABELS[key] ?? key}:
            </span>
            <span className="text-sm text-slate-800 dark:text-slate-200 break-words">
              {renderValue(value)}
            </span>
          </div>
        ))}
      </div>
      <button type="button" onClick={onClose} className="mt-4 px-4 py-2 text-sm bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600">
        Cerrar
      </button>
    </Overlay>
  );
}

// =============================================================================
// Edit Modal
// =============================================================================

function EditModal({
  profileId,
  sectionKey,
  entry,
  onClose,
}: {
  profileId: string;
  sectionKey: SectionKey;
  entry: SectionEntry;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const editableFields = Object.entries(entry).filter(
    ([key]) => !['id', 'createdAt', 'updatedAt', 'profileId', 'verified'].includes(key),
  );

  const [values, setValues] = useState<Record<string, unknown>>(
    Object.fromEntries(editableFields),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/profiles/${profileId}/sections/${sectionKey}/${entry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? 'Error al guardar');
      }
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Editar entrada</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {editableFields.map(([key]) => (
          <div key={key}>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-0.5">
              {FIELD_LABELS[key] ?? key}
            </label>
            {Array.isArray(values[key]) ? (
              <textarea
                value={(values[key] as string[]).join('\n')}
                onChange={(e) => setValues({ ...values, [key]: e.target.value.split('\n').filter(Boolean) })}
                rows={3}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            ) : typeof values[key] === 'boolean' ? (
              <input
                type="checkbox"
                checked={values[key] as boolean}
                onChange={(e) => setValues({ ...values, [key]: e.target.checked })}
                className="rounded text-blue-600"
              />
            ) : (
              <input
                type="text"
                value={String(values[key] ?? '')}
                onChange={(e) => setValues({ ...values, [key]: e.target.value || undefined })}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            )}
          </div>
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="flex gap-2 mt-4">
        <button type="button" onClick={handleSave} disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:underline">
          Cancelar
        </button>
      </div>
    </Overlay>
  );
}

// =============================================================================
// Verify Modal
// =============================================================================

function VerifyModal({
  profileId,
  sectionKey,
  entry,
  onClose,
}: {
  profileId: string;
  sectionKey: SectionKey;
  entry: SectionEntry;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [showCapture, setShowCapture] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['profile'] });
    void queryClient.invalidateQueries({ queryKey: ['evidence'] });
    void queryClient.invalidateQueries({ queryKey: ['documents'] });
  };

  // Option 1: Upload a document
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const result = await uploadDocument(file, { profileId });
      await linkEvidence(result.documentId, [{ sectionType: sectionKey, entryId: entry.id }]);
      await fetch(`/api/profiles/${profileId}/sections/${sectionKey}/${entry.id}/verify`, { method: 'PATCH' });
      return result;
    },
    onSuccess: () => {
      invalidateAll();
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  // Option 2: Mark as verified manually (without document)
  const manualVerifyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/profiles/${profileId}/sections/${sectionKey}/${entry.id}/verify`, { method: 'PATCH' });
      if (!res.ok) throw new Error('No se pudo verificar');
    },
    onSuccess: () => {
      invalidateAll();
      onClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  if (showCapture) {
    return (
      <Overlay onClose={onClose}>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">Subir documento</h3>
        <p className="text-sm text-slate-500 mb-3">Sube el certificado, título o documento que respalda esta entrada.</p>
        <MultiPhotoCapture
          onComplete={(file) => uploadMutation.mutate(file)}
          onCancel={() => { setShowCapture(false); setError(null); }}
          isUploading={uploadMutation.isPending}
        />
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">Verificar entrada</h3>
      <p className="text-sm text-slate-500 mb-4">
        Elige cómo verificar esta información. La verificación con documento es preferible.
      </p>

      <div className="space-y-3">
        {/* Option 1: Upload document */}
        <button
          type="button"
          onClick={() => setShowCapture(true)}
          className="w-full flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors"
        >
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <UploadIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Subir documento</p>
            <p className="text-xs text-slate-500">PDF, foto o imagen del certificado</p>
          </div>
        </button>

        {/* Option 2: Mark manually */}
        <button
          type="button"
          onClick={() => manualVerifyMutation.mutate()}
          disabled={manualVerifyMutation.isPending}
          className="w-full flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors"
        >
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {manualVerifyMutation.isPending ? 'Verificando...' : 'Marcar como verificado'}
            </p>
            <p className="text-xs text-slate-500">Sin documento — se puede cambiar después</p>
          </div>
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      <button type="button" onClick={onClose} className="mt-4 text-sm text-slate-500 hover:underline">
        Cancelar
      </button>
    </Overlay>
  );
}

// =============================================================================
// Shared Components
// =============================================================================

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

// =============================================================================
// Icons
// =============================================================================

function EyeIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  );
}

function CertificateIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'h-4 w-4'} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}
