import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createJobConfig,
  deleteJobConfig,
  evaluateJob,
  listJobConfigs,
  listJobListings,
  scanJobs,
  updateListingStatus,
  type CreateConfigPayload,
  type JobListing,
  type JobSearchConfig,
} from '../api/job-search.api';
import { getActiveProfileId } from '../lib/active-profile';
import { EmptyProfileState } from '../components/EmptyProfileState';

const PORTALS = [
  { id: 'computrabajo_bo', label: 'CompuTrabajo Bolivia' },
  { id: 'linkedin_public', label: 'LinkedIn (Público)' },
  { id: 'trabajopolis_bo', label: 'Trabajopolis Bolivia' },
  { id: 'remoteok', label: 'RemoteOK (Internacional)' },
];

export function JobSearchPage() {
  const queryClient = useQueryClient();
  const profileId = getActiveProfileId();
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const configsQuery = useQuery({
    queryKey: ['job-configs', profileId],
    queryFn: () => listJobConfigs(profileId!),
    enabled: !!profileId,
  });

  const listingsQuery = useQuery({
    queryKey: ['job-listings', activeConfigId],
    queryFn: () => listJobListings(activeConfigId!),
    enabled: !!activeConfigId,
  });

  if (!profileId) {
    return <EmptyProfileState />;
  }

  const configs = configsQuery.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Búsqueda de Empleo
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Escanea portales de empleo, evalúa ofertas contra tu perfil, y genera CVs adaptados.
        </p>
      </header>

      {/* Config section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Configuraciones de búsqueda
          </h2>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Nueva búsqueda
          </button>
        </div>

        {showForm && (
          <CreateConfigForm
            profileId={profileId}
            onCreated={(config) => {
              setShowForm(false);
              setActiveConfigId(config.id);
              void queryClient.invalidateQueries({ queryKey: ['job-configs'] });
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {configs.length === 0 && !showForm && (
          <div className="text-center py-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-slate-500">No tienes configuraciones de búsqueda.</p>
            <p className="text-sm text-slate-400 mt-1">
              Crea una para empezar a escanear portales de empleo.
            </p>
          </div>
        )}

        {configs.length > 0 && (
          <div className="space-y-2">
            {configs.map((config) => (
              <ConfigCard
                key={config.id}
                config={config}
                isActive={activeConfigId === config.id}
                onSelect={() => setActiveConfigId(config.id)}
                onDelete={() => {
                  if (activeConfigId === config.id) setActiveConfigId(null);
                  void queryClient.invalidateQueries({ queryKey: ['job-configs'] });
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Listings section */}
      {activeConfigId && (
        <ListingsSection
          configId={activeConfigId}
          listings={listingsQuery.data ?? []}
          isLoading={listingsQuery.isLoading}
        />
      )}
    </div>
  );
}

// --- Config Card ---

function ConfigCard({
  config,
  isActive,
  onSelect,
  onDelete,
}: {
  config: JobSearchConfig;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const deleteMutation = useMutation({
    mutationFn: () => deleteJobConfig(config.id),
    onSuccess: onDelete,
  });

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        isActive
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
            {config.targetTitles.join(', ')}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {config.locations.length > 0 ? config.locations.join(', ') : 'Cualquier ubicación'}
            {config.modality && ` · ${config.modality}`}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(); }}
          className="text-xs text-red-500 hover:text-red-700 hover:underline"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

// --- Create Config Form ---

function CreateConfigForm({
  profileId,
  onCreated,
  onCancel,
}: {
  profileId: string;
  onCreated: (config: JobSearchConfig) => void;
  onCancel: () => void;
}) {
  const [titles, setTitles] = useState('');
  const [locations, setLocations] = useState('');
  const [modality, setModality] = useState('');
  const [excludeKw, setExcludeKw] = useState('');
  const [selectedPortals, setSelectedPortals] = useState<string[]>(['computrabajo_bo']);

  const createMutation = useMutation({
    mutationFn: (data: CreateConfigPayload) => createJobConfig(profileId, data),
    onSuccess: onCreated,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTitles = titles.split(',').map((t) => t.trim()).filter(Boolean);
    if (targetTitles.length === 0) return;

    createMutation.mutate({
      targetTitles,
      locations: locations.split(',').map((l) => l.trim()).filter(Boolean),
      modality: modality || undefined,
      excludeKeywords: excludeKw.split(',').map((k) => k.trim()).filter(Boolean),
      portals: selectedPortals,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Títulos a buscar *
        </label>
        <input
          type="text"
          value={titles}
          onChange={(e) => setTitles(e.target.value)}
          placeholder="Ingeniero de Sistemas, Analista, Desarrollador"
          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          required
        />
        <p className="text-xs text-slate-400 mt-0.5">Separados por coma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Ubicaciones
          </label>
          <input
            type="text"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            placeholder="Sucre, La Paz, Remoto"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Modalidad
          </label>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="">Cualquiera</option>
            <option value="presencial">Presencial</option>
            <option value="remoto">Remoto</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Excluir palabras clave
        </label>
        <input
          type="text"
          value={excludeKw}
          onChange={(e) => setExcludeKw(e.target.value)}
          placeholder="junior, pasantía, becario"
          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Portales
        </label>
        <div className="flex flex-wrap gap-2">
          {PORTALS.map((p) => (
            <label key={p.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPortals.includes(p.id)}
                onChange={(e) =>
                  setSelectedPortals((prev) =>
                    e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id),
                  )
                }
                className="rounded text-blue-600"
              />
              <span className="text-slate-700 dark:text-slate-300">{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      {createMutation.isError && (
        <p className="text-sm text-red-600">{createMutation.error.message}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Creando...' : 'Crear'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:underline">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// --- Listings Section ---

function ListingsSection({
  configId,
  listings,
  isLoading,
}: {
  configId: string;
  listings: JobListing[];
  isLoading: boolean;
}) {
  const queryClient = useQueryClient();

  const scanMutation = useMutation({
    mutationFn: () => scanJobs(configId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['job-listings', configId] });
    },
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Ofertas encontradas
          {listings.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-400">({listings.length})</span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {scanMutation.isPending ? 'Escaneando...' : 'Escanear portales'}
        </button>
      </div>

      {scanMutation.isSuccess && (
        <div className="mb-3 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-sm text-green-700 dark:text-green-300">
          Encontradas {scanMutation.data.totalFound} ofertas, {scanMutation.data.afterFilters} pasaron filtros, {scanMutation.data.newListings} nuevas guardadas.
          {scanMutation.data.errors.length > 0 && (
            <span className="text-amber-600 ml-2">
              ({scanMutation.data.errors.length} portal(es) con error)
            </span>
          )}
        </div>
      )}

      {isLoading && <p className="text-slate-500 text-sm">Cargando ofertas...</p>}

      {!isLoading && listings.length === 0 && (
        <div className="text-center py-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-slate-500">No hay ofertas aún.</p>
          <p className="text-sm text-slate-400 mt-1">
            Haz clic en "Escanear portales" para buscar ofertas.
          </p>
        </div>
      )}

      {listings.length > 0 && (
        <div className="space-y-2">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} configId={configId} />
          ))}
        </div>
      )}
    </section>
  );
}

// --- Listing Card ---

function ListingCard({ listing, configId }: { listing: JobListing; configId: string }) {
  const queryClient = useQueryClient();

  const evaluateMutation = useMutation({
    mutationFn: () => evaluateJob(listing.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['job-listings', configId] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateListingStatus(listing.id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['job-listings', configId] });
    },
  });

  const scoreColor = listing.score
    ? listing.score >= 4
      ? 'text-green-600 dark:text-green-400'
      : listing.score >= 2.5
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-500 dark:text-red-400'
    : 'text-slate-400';

  const recBadge = listing.recommendation
    ? listing.recommendation === 'apply'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      : listing.recommendation === 'maybe'
        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    : '';

  return (
    <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate text-sm"
            >
              {listing.title}
            </a>
            {listing.recommendation && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${recBadge}`}>
                {listing.recommendation === 'apply' ? 'Postular' : listing.recommendation === 'maybe' ? 'Quizás' : 'Descartar'}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {listing.company}
            {listing.location && ` · ${listing.location}`}
            {listing.postedDate && ` · ${listing.postedDate}`}
          </p>

          {listing.matchSummary && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">{listing.matchSummary}</p>
          )}

          {listing.skillGaps.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {listing.skillGaps.map((gap) => (
                <span
                  key={gap}
                  className="text-[10px] px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded"
                >
                  {gap}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score */}
        <div className="flex flex-col items-center shrink-0">
          {listing.score ? (
            <span className={`text-xl font-bold ${scoreColor}`}>
              {listing.score.toFixed(1)}
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
        {listing.status === 'new' && (
          <button
            type="button"
            onClick={() => evaluateMutation.mutate()}
            disabled={evaluateMutation.isPending}
            className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 disabled:opacity-50"
          >
            {evaluateMutation.isPending ? 'Evaluando...' : 'Evaluar con IA'}
          </button>
        )}
        {listing.status !== 'applied' && (
          <button
            type="button"
            onClick={() => statusMutation.mutate('applied')}
            className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-100"
          >
            Marcar aplicada
          </button>
        )}
        {listing.status !== 'saved' && listing.status !== 'applied' && (
          <button
            type="button"
            onClick={() => statusMutation.mutate('saved')}
            className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200"
          >
            Guardar
          </button>
        )}
        {listing.status !== 'rejected' && (
          <button
            type="button"
            onClick={() => statusMutation.mutate('rejected')}
            className="text-xs px-2 py-1 text-slate-400 hover:text-red-500 hover:underline"
          >
            Descartar
          </button>
        )}
        <span className="ml-auto text-[10px] text-slate-400 self-center">
          {listing.portal} · {listing.status}
        </span>
      </div>
    </div>
  );
}
