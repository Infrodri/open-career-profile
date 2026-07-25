import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../api/profile.api';
import { ProfileForm } from '../components/ProfileForm';
import type { CreateProfilePayload } from '../types/profile';

export function EditProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfile(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (data: CreateProfilePayload) => updateProfile(id!, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile', id] });
      navigate(`/profile/${id}`);
    },
  });

  if (isLoading) {
    return <p className="max-w-4xl mx-auto px-6 py-12 text-slate-500">Cargando perfil...</p>;
  }

  if (isError || !profile) {
    return <p className="max-w-4xl mx-auto px-6 py-12 text-red-600">No se pudo cargar el perfil.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Editar Perfil
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Aquí puedes editar tu información personal. Las secciones del CV se gestionan
          subiendo documentos desde "Agregar Documento".
        </p>
      </header>

      {mutation.isError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
          {mutation.error.message}
        </div>
      )}

      <ProfileForm
        onSubmit={(data) => mutation.mutate(data)}
        isLoading={mutation.isPending}
        submitLabel="Guardar cambios"
        initialData={profile.personalInfo}
      />
    </div>
  );
}
