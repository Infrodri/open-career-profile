import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormatTabs } from '../components/FormatTabs';
import {
  createOutputTemplate,
  deleteOutputTemplate,
  listOutputTemplates,
  previewTemplate,
  type CreateOutputTemplatePayload,
  type OutputTemplate,
} from '../api/output-template.api';

const CATEGORIES = [
  { value: 'cv', label: 'CV' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'academic', label: 'Académico' },
  { value: 'institutional', label: 'Institucional' },
  { value: 'government', label: 'Gobierno' },
];

export function DesignTemplatesPage() {
  const queryClient = useQueryClient();
  const [showEditor, setShowEditor] = useState(false);

  const templatesQuery = useQuery({
    queryKey: ['output-templates'],
    queryFn: () => listOutputTemplates(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOutputTemplate,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['output-templates'] }),
  });

  const templates = templatesQuery.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Formatos y Plantillas
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Crea y edita plantillas de diseño con Handlebars para personalizar el layout de tu CV.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowEditor(true)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          Nueva plantilla
        </button>
      </header>

      <FormatTabs />

      {showEditor && (
        <TemplateEditor
          onCreated={() => {
            setShowEditor(false);
            void queryClient.invalidateQueries({ queryKey: ['output-templates'] });
          }}
          onCancel={() => setShowEditor(false)}
        />
      )}

      {templatesQuery.isLoading && <p className="text-slate-500">Cargando...</p>}

      {!templatesQuery.isLoading && templates.length === 0 && !showEditor && (
        <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <p className="text-slate-600 dark:text-slate-300">No hay plantillas de diseño personalizadas.</p>
          <p className="text-sm text-slate-400 mt-1">Las plantillas integradas (Estándar y Minimalista) siempre están disponibles.</p>
        </div>
      )}

      {templates.length > 0 && (
        <div className="space-y-3">
          {templates.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              onDelete={() => {
                if (window.confirm(`¿Eliminar "${tpl.name}"?`)) deleteMutation.mutate(tpl.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// --- Template Card ---

function TemplateCard({ template, onDelete }: { template: OutputTemplate; onDelete: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{template.name}</h3>
            {template.isBuiltIn && (
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded">
                Integrada
              </span>
            )}
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
              {template.category}
            </span>
          </div>
          {template.description && (
            <p className="text-xs text-slate-500 mt-1">{template.description}</p>
          )}
          <p className="text-[10px] text-slate-400 mt-1">
            {template.source.length} caracteres · Creada {new Date(template.createdAt).toLocaleDateString()}
          </p>
        </div>
        {!template.isBuiltIn && (
          <button
            type="button"
            onClick={onDelete}
            className="text-xs text-red-600 dark:text-red-400 hover:underline shrink-0"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}

// --- Template Editor ---

function TemplateEditor({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('cv');
  const [source, setSource] = useState(STARTER_TEMPLATE);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: CreateOutputTemplatePayload) => createOutputTemplate(data),
    onSuccess: onCreated,
    onError: (err) => setError(err.message),
  });

  const previewMutation = useMutation({
    mutationFn: () => previewTemplate(source),
    onSuccess: (html) => setPreviewHtml(html),
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || source.length < 10) return;
    setError(null);
    createMutation.mutate({ name: name.trim(), description: description.trim() || undefined, category, source });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 space-y-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Nueva Plantilla de Diseño</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Source (Handlebars HTML) *
          </label>
          <button
            type="button"
            onClick={() => previewMutation.mutate()}
            disabled={previewMutation.isPending}
            className="text-xs text-blue-600 hover:underline"
          >
            {previewMutation.isPending ? 'Generando...' : 'Previsualizar'}
          </button>
        </div>
        <textarea
          value={source}
          onChange={(e) => { setSource(e.target.value); setPreviewHtml(null); }}
          rows={14}
          className="w-full px-3 py-2 text-xs font-mono border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-y"
          spellCheck={false}
        />
        <p className="text-[10px] text-slate-400 mt-1">
          Variables: {'{{personalInfo.fullName}}'}, {'{{personalInfo.summary}}'}, {'{{#each sections.experienciaAdministrativa}}'}, {'{{formatDate startDate}}'}, etc.
        </p>
      </div>

      {previewHtml && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-medium text-slate-500">Preview</div>
          <iframe
            srcDoc={previewHtml}
            title="Preview"
            className="w-full h-64 bg-white"
            sandbox=""
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={createMutation.isPending || !name.trim() || source.length < 10}
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50">
          {createMutation.isPending ? 'Creando...' : 'Crear plantilla'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
          Cancelar
        </button>
      </div>
    </form>
  );
}

const STARTER_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>{{personalInfo.fullName}}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #333; margin: 0; padding: 20px; }
    h1 { font-size: 20pt; margin-bottom: 4px; }
    .contact { font-size: 9pt; color: #666; margin-bottom: 16px; }
    .section { margin-bottom: 16px; }
    .section h2 { font-size: 12pt; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 8px; }
    .entry { margin-bottom: 8px; }
    .entry-title { font-weight: bold; }
    .entry-meta { font-size: 9pt; color: #666; }
  </style>
</head>
<body>
  <h1>{{personalInfo.fullName}}</h1>
  <div class="contact">
    {{personalInfo.email}} · {{personalInfo.phone}} · {{personalInfo.city}}
  </div>

  {{#if personalInfo.summary}}
  <div class="section">
    <h2>Perfil Profesional</h2>
    <p>{{personalInfo.summary}}</p>
  </div>
  {{/if}}

  {{#hasItems sections.experienciaAdministrativa}}
  <div class="section">
    <h2>Experiencia Laboral</h2>
    {{#each sections.experienciaAdministrativa}}
    <div class="entry">
      <div class="entry-title">{{position}}</div>
      <div class="entry-meta">{{institution}} · {{formatDate startDate}} - {{formatDate endDate}}</div>
      {{#if description}}<p>{{description}}</p>{{/if}}
    </div>
    {{/each}}
  </div>
  {{/hasItems}}

  {{#hasItems sections.formacionAcademica}}
  <div class="section">
    <h2>Formación Académica</h2>
    {{#each sections.formacionAcademica}}
    <div class="entry">
      <div class="entry-title">{{title}}</div>
      <div class="entry-meta">{{institution}} · {{formatDate endDate}}</div>
    </div>
    {{/each}}
  </div>
  {{/hasItems}}

  {{#hasItems sections.habilidades}}
  <div class="section">
    <h2>Habilidades</h2>
    <p>{{#each sections.habilidades}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}</p>
  </div>
  {{/hasItems}}
</body>
</html>`;
