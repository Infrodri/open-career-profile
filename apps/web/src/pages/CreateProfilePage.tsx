import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createProfile } from '../api/profile.api';
import { ProfileForm } from '../components/ProfileForm';
import { setActiveProfileId } from '../lib/active-profile';
import type { CreateProfilePayload } from '../types/profile';

export function CreateProfilePage() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: CreateProfilePayload) => createProfile(data),
    onSuccess: (profile) => {
      // Makes /perfil, /documentos and /generar resolve to this profile.
      setActiveProfileId(profile.id);
      navigate(`/profile/${profile.id}`);
    },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Crear Perfil
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          También puedes subir un documento y dejar que la IA lo complete por ti.
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
        submitLabel="Crear Perfil"
      />
    </div>
  );
}
