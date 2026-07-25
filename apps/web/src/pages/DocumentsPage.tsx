import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteDocument,
  documentDownloadUrl,
  documentFileUrl,
  listProfileDocuments,
  listProfileEvidence,
  listUnassignedDocuments,
  updateDocumentType,
} from '../api/document.api';
import { getProfile } from '../api/profile.api';
import { getActiveProfileId } from '../lib/active-profile';
import { EmptyProfileState } from '../components/EmptyProfileState';
import type {
  DocumentType,
  Evidence,
  ProfessionalProfile,
  SectionType,
  StoredDocument,
} from '../types/profile';

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  certificado: 'Certificado',
  titulo: 'Título',
  contrato: 'Contrato',
  hoja_de_vida: 'Hoja de vida',
  otro: 'Otro',
};

const SECTION_LABELS: Record<SectionType, string> = {
  workExperience: 'Experiencia',
  education: 'Educación',
  certifications: 'Certificación',
  courses: 'Curso',
  skills: 'Habilidad',
  languages: 'Idioma',
  projects: 'Proyecto',
  publications: 'Publicación',
  awards: 'Reconocimiento',
  affiliations: 'Afiliación',
  volunteering: 'Voluntariado',
  references: 'Referencia',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
}

/**
 * Resolve a human-readable label for the profile entry an evidence points at.
 * Returns null when the entry no longer exists, so stale links can be surfaced.
 */
function describeEntry(profile: ProfessionalProfile | undefined, evidence: Evidence): string | null {
  if (!profile) return null;

  const section: unknown = profile.sections[evidence.sectionType as keyof typeof profile.sections];
  if (!Array.isArray(section)) return null;

  const entry = (section as unknown[]).find(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      (item as { id?: unknown }).id === evidence.entryId,
  ) as Record<string, unknown> | undefined;

  if (!entry) return null;

  // Entries name their headline field differently depending on the section.
  const label = entry['position'] ?? entry['title'] ?? entry['name'] ?? entry['fullName'];
  return typeof label === 'string' && label !== '' ? label : 'Entrada sin título';
}

export function DocumentsPage() {
  const queryClient = useQueryClient();
  const profileId = getActiveProfileId();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => getProfile(profileId!),
    enabled: !!profileId,
  });

  const documentsQuery = useQuery({
    queryKey: ['documents', profileId],
    queryFn: () => listProfileDocuments(profileId!),
    enabled: !!profileId,
  });

  const unassignedQuery = useQuery({
    queryKey: ['documents', 'unassigned'],
    queryFn: listUnassignedDocuments,
  });

  const evidenceQuery = useQuery({
    queryKey: ['evidence', profileId],
    queryFn: () => listProfileEvidence(profileId!),
    enabled: !!profileId,
  });

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['documents'] });
    void queryClient.invalidateQueries({ queryKey: ['evidence'] });
  };

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: invalidateAll,
  });

  const typeMutation = useMutation({
    mutationFn: ({ id, documentType }: { id: string; documentType: DocumentType | null }) =>
      updateDocumentType(id, documentType),
    onSuccess: invalidateAll,
  });

  /** Evidence links grouped by the document they belong to. */
  const evidenceByDocument = useMemo(() => {
    const map = new Map<string, Evidence[]>();
    for (const evidence of evidenceQuery.data ?? []) {
      const list = map.get(evidence.documentId) ?? [];
      list.push(evidence);
      map.set(evidence.documentId, list);
    }
    return map;
  }, [evidenceQuery.data]);

  const documents = documentsQuery.data ?? [];
  const unassigned = unassignedQuery.data ?? [];
  const hasAnything = documents.length > 0 || unassigned.length > 0;

  if (!profileId && unassigned.length === 0 && !unassignedQuery.isLoading) {
    return <EmptyProfileState />;
  }

  const renderCard = (doc: StoredDocument, isUnassigned: boolean) => {
    const links = evidenceByDocument.get(doc.id) ?? [];
    const isExpanded = expandedId === doc.id;
    const isImage = doc.mimeType.startsWith('image/');

    return (
      <li
        key={doc.id}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
      >
        <div className="p-4 flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Thumbnail / icon */}
          <div className="shrink-0 w-full sm:w-24 h-24 bg-slate-100 dark:bg-slate-700/50 rounded-md flex items-center justify-center overflow-hidden">
            {isImage ? (
              <img
                src={documentFileUrl(doc.id)}
                alt={`Vista previa de ${doc.fileName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="h-8 w-8 text-slate-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {doc.fileName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatDate(doc.createdAt)} · {formatBytes(doc.sizeBytes)} ·{' '}
                  {isImage ? 'Imagen' : 'PDF'}
                </p>
              </div>

              {isUnassigned ? (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  Sin vincular a un perfil
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {links.length === 0
                    ? 'Sin entradas respaldadas'
                    : `Respalda ${links.length} ${links.length === 1 ? 'entrada' : 'entradas'}`}
                </span>
              )}
            </div>

            {/* Document type */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label
                htmlFor={`type-${doc.id}`}
                className="text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Tipo
              </label>
              <select
                id={`type-${doc.id}`}
                value={doc.documentType ?? ''}
                onChange={(e) =>
                  typeMutation.mutate({
                    id: doc.id,
                    documentType: e.target.value === '' ? null : (e.target.value as DocumentType),
                  })
                }
                disabled={typeMutation.isPending}
                className="px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin clasificar</option>
                {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
                  <option key={type} value={type}>
                    {DOCUMENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            {/* Entries backed by this document */}
            {links.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {links.map((evidence) => {
                  const label = describeEntry(profileQuery.data, evidence);
                  return (
                    <li
                      key={evidence.id}
                      className={`px-2 py-0.5 text-xs rounded border ${
                        label
                          ? 'bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                      }`}
                      title={label ? undefined : 'La entrada vinculada ya no existe en el perfil'}
                    >
                      <span className="font-medium">{SECTION_LABELS[evidence.sectionType]}</span>
                      {': '}
                      {label ?? 'entrada eliminada'}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <a
                href={documentFileUrl(doc.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Ver original
              </a>
              <a
                href={documentDownloadUrl(doc.id)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Descargar
              </a>
              {doc.extractedText && (
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                  className="text-slate-600 dark:text-slate-400 hover:underline font-medium"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? 'Ocultar texto' : 'Ver texto extraído'}
                </button>
              )}
              {isUnassigned && (
                <Link
                  to="/documento"
                  className="text-slate-600 dark:text-slate-400 hover:underline font-medium"
                >
                  Procesar
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `¿Eliminar "${doc.fileName}"? Se borrará el archivo del disco y sus vínculos con el perfil. Las entradas del perfil se conservan.`,
                    )
                  ) {
                    deleteMutation.mutate(doc.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="text-red-600 dark:text-red-400 hover:underline font-medium disabled:opacity-50 ml-auto"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>

        {isExpanded && doc.extractedText && (
          <pre className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-64 overflow-y-auto">
            {doc.extractedText}
          </pre>
        )}
      </li>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Mis Documentos
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Los archivos originales que respaldan tu perfil. Todo se guarda en tu equipo, nada se
          sube a la nube.
        </p>
      </header>

      {(deleteMutation.isError || typeMutation.isError) && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">
          {(deleteMutation.error ?? typeMutation.error)?.message}
        </p>
      )}

      {(documentsQuery.isLoading || unassignedQuery.isLoading) && (
        <p className="text-slate-500 dark:text-slate-400">Cargando documentos...</p>
      )}

      {documentsQuery.isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {documentsQuery.error.message}
        </p>
      )}

      {!documentsQuery.isLoading && !unassignedQuery.isLoading && !hasAnything && (
        <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Aún no has subido ningún documento
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sube un certificado, título o tu hoja de vida para empezar.
          </p>
          <Link
            to="/documento"
            className="inline-block mt-5 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Subir documento
          </Link>
        </div>
      )}

      {unassigned.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
            Pendientes de procesar ({unassigned.length})
          </h2>
          <ul className="space-y-3">{unassigned.map((doc) => renderCard(doc, true))}</ul>
        </section>
      )}

      {documents.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
            En tu perfil ({documents.length})
          </h2>
          <ul className="space-y-3">{documents.map((doc) => renderCard(doc, false))}</ul>
        </section>
      )}
    </div>
  );
}
