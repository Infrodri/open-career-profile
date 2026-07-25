import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api/profile.api';
import { getActiveProfileId } from '../lib/active-profile';
import { OutputGenerator } from '../components/OutputGenerator';
import { EmptyProfileState } from '../components/EmptyProfileState';

/**
 * Standalone page for the "Generar CV" nav item.
 * Works on the active profile, since this route carries no id.
 */
export function GeneratePage() {
  const profileId = getActiveProfileId();

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => getProfile(profileId!),
    enabled: !!profileId,
  });

  if (!profileId) {
    return (
      <EmptyProfileState
        title="Necesitas un perfil para generar un documento"
        description="El CV es una vista de tu Perfil Profesional, así que primero hay que crearlo."
      />
    );
  }

  if (isLoading) {
    return (
      <p className="max-w-3xl mx-auto px-6 py-12 text-slate-500 dark:text-slate-400">
        Cargando perfil...
      </p>
    );
  }

  if (isError || !profile) {
    return (
      <EmptyProfileState
        title="No se pudo cargar tu perfil"
        description={error?.message ?? 'El perfil guardado ya no está disponible.'}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Generar CV
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Elige una plantilla y un formato. El documento se genera a partir de{' '}
          <strong>{profile.personalInfo.fullName}</strong> y no reemplaza tu perfil.
        </p>
      </header>

      <OutputGenerator profileId={profile.id} />
    </div>
  );
}
