import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unwrap, expectNoContent } from '../api/http';
import { SECTION_KEYS, SECTION_LABELS, type SectionKey } from '../types/profile';

interface InstitutionalTemplate {
  id: string;
  name: string;
  institution: string;
  description?: string;
  templatePath?: string;
  rules: TemplateRules;
  createdAt: string;
  updatedAt: string;
}

interface TemplateRules {
  /** Sections to include in the generated CV. Empty = include all. */
  includeSections?: SectionKey[];
  /** Sections to explicitly exclude. */
  excludeSections?: SectionKey[];
  /** Whether to require photo. */
  requirePhoto?: boolean;
  /** Whether to include only verified entries. */
  onlyVerified?: boolean;
  /** Max pages for the output. */
  maxPages?: number;
  /** Custom notes for the institution. */
  notes?: string;
}

async function fetchTemplates(): Promise<InstitutionalTemplate[]> {
  const res = await fetch('/api/templates');
  return unwrap<InstitutionalTemplate[]>(res);
}

async function deleteTemplate(id: string): Promise<void> {
  const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
  return expectNoContent(res);
}

export function TemplatesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['templates'] }),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Formatos y Plantillas
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Gestiona los formatos institucionales que definen qué información incluir en tu CV.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          Nueva plantilla
        </button>
      </header>

      {/* Navigation tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-700">
        <a href="/plantillas" className="px-4 py-2 text-sm font-medium border-b-2 border-blue-600 text-blue-600 dark:text-blue-400">
          Reglas institucionales
        </a>
        <a href="/diseno" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          Diseño visual (Handlebars)
        </a>
        <a href="/importar-formato" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          Importar formato con IA
        </a>
      </div>

      {showForm && (
        <CreateTemplateForm
          onCreated={() => {
            setShowForm(false);
            void queryClient.invalidateQueries({ queryKey: ['templates'] });
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {isLoading && <p className="text-slate-500">Cargando plantillas...</p>}

      {!isLoading && (!templates || templates.length === 0) && !showForm && (
        <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            No hay plantillas configuradas
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sube el formato que pide cada institución para generar CVs a medida.
          </p>
        </div>
      )}

      {templates && templates.length > 0 && (
        <ul className="space-y-3">
          {templates.map((tpl) => (
            <li key={tpl.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{tpl.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{tpl.institution}</p>
                  {tpl.description && (
                    <p className="text-xs text-slate-400 mt-1">{tpl.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {tpl.rules?.onlyVerified && (
                      <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded">
                        Solo verificados
                      </span>
                    )}
                    {tpl.rules?.requirePhoto && (
                      <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded">
                        Requiere foto
                      </span>
                    )}
                    {tpl.rules?.maxPages && (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                        Máx {tpl.rules.maxPages} páginas
                      </span>
                    )}
                    {tpl.templatePath && (
                      <a
                        href={`/api/templates/${tpl.id}/file`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 rounded hover:underline"
                      >
                        Ver formato original
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Eliminar la plantilla "${tpl.name}"?`)) {
                        deleteMutation.mutate(tpl.id);
                      }
                    }}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- Create Form ---

function CreateTemplateForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [requirePhoto, setRequirePhoto] = useState(false);
  const [maxPages, setMaxPages] = useState('');
  const [includeSections, setIncludeSections] = useState<SectionKey[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSection = (key: SectionKey) => {
    setIncludeSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !institution.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('institution', institution.trim());
      if (description.trim()) formData.append('description', description.trim());
      if (file) formData.append('templateFile', file);

      const rules: TemplateRules = {};
      if (onlyVerified) rules.onlyVerified = true;
      if (requirePhoto) rules.requirePhoto = true;
      if (maxPages && parseInt(maxPages) > 0) rules.maxPages = parseInt(maxPages);
      if (includeSections.length > 0) rules.includeSections = includeSections;

      formData.append('rules', JSON.stringify(rules));

      const res = await fetch('/api/templates', { method: 'POST', body: formData });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? 'Error al crear la plantilla');
      }

      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 space-y-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Nueva Plantilla</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            placeholder="Ej: Formato Órgano Judicial"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Institución *</label>
          <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} required
            placeholder="Ej: Órgano Judicial de Bolivia"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Formato requerido para postulaciones al área de informática"
          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Archivo de plantilla (PDF/Word del formato que pide la institución)
        </label>
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/20 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100" />
      </div>

      {/* Rules */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Reglas de generación</h4>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={onlyVerified} onChange={(e) => setOnlyVerified(e.target.checked)}
              className="rounded text-blue-600" />
            Solo entradas verificadas
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={requirePhoto} onChange={(e) => setRequirePhoto(e.target.checked)}
              className="rounded text-blue-600" />
            Requiere foto
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-700 dark:text-slate-300">Máx páginas:</label>
            <input type="number" value={maxPages} onChange={(e) => setMaxPages(e.target.value)}
              min="1" max="50" placeholder="—"
              className="w-16 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
          </div>
        </div>
      </div>

      {/* Section selector */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
          Secciones a incluir <span className="font-normal text-slate-400">(vacío = todas)</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {SECTION_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleSection(key)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                includeSections.includes(key)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-blue-400'
              }`}
            >
              {SECTION_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting || !name.trim() || !institution.trim()}
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {isSubmitting ? 'Creando...' : 'Crear plantilla'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
          Cancelar
        </button>
      </div>
    </form>
  );
}
