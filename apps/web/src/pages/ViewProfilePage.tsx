import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, deleteProfile } from '../api/profile.api';
import { listProfileDocuments, listProfileEvidence } from '../api/document.api';
import { ProfileView } from '../components/ProfileView';
import { OutputGenerator } from '../components/OutputGenerator';
import { EmptyProfileState } from '../components/EmptyProfileState';
import {
  clearActiveProfileId,
  getActiveProfileId,
  setActiveProfileId,
} from '../lib/active-profile';

export function ViewProfilePage() {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // /perfil has no id in the URL, so fall back to the active profile.
  const id = routeId ?? getActiveProfileId() ?? undefined;

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfile(id!),
    enabled: !!id,
  });

  const evidenceQuery = useQuery({
    queryKey: ['evidence', id],
    queryFn: () => listProfileEvidence(id!),
    enabled: !!id,
  });

  const documentsQuery = useQuery({
    queryKey: ['documents', id],
    queryFn: () => listProfileDocuments(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProfile(id!),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['profile', id] });
      if (getActiveProfileId() === id) clearActiveProfileId();
      navigate('/');
    },
  });

  // Visiting an explicit profile URL makes it the active one.
  useEffect(() => {
    if (routeId) setActiveProfileId(routeId);
  }, [routeId]);

  if (!id) {
    return <EmptyProfileState />;
  }

  if (isLoading) {
    return (
      <p className="max-w-4xl mx-auto px-6 py-12 text-slate-500 dark:text-slate-400">
        Cargando perfil...
      </p>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-xl mx-auto text-center px-6 py-16">
        <p className="text-red-600 dark:text-red-400 mb-4">
          {error?.message ?? 'No se pudo cargar el perfil.'}
        </p>
        <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const documentCount = documentsQuery.data?.length ?? 0;

  return (
    <div className="space-y-6 py-6">
      {/* Actions */}
      <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mi Perfil</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {documentCount === 0
              ? 'Sin documentos de respaldo todavía'
              : `${documentCount} ${documentCount === 1 ? 'documento' : 'documentos'} de respaldo`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/documento"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Agregar documento
          </Link>
          <Link
            to={`/profile/${profile.id}/edit`}
            className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Editar
          </Link>
          <Link
            to="/documentos"
            className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Ver documentos
          </Link>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  '¿Eliminar este perfil? Se borrarán también sus documentos y evidencias. Esta acción no se puede deshacer.',
                )
              ) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>

      {deleteMutation.isError && (
        <p className="max-w-4xl mx-auto px-6 text-sm text-red-600 dark:text-red-400">
          {deleteMutation.error.message}
        </p>
      )}

      <ProfileView profile={profile} evidence={evidenceQuery.data ?? []} />

      <div className="max-w-4xl mx-auto px-6">
        <OutputGenerator profileId={profile.id} />
      </div>
    </div>
  );
}
