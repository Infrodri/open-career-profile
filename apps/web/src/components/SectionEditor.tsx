import { useState } from 'react';

export interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'textarea';
  placeholder?: string;
  required?: boolean;
}

interface SectionEditorProps<T extends Record<string, string>> {
  title: string;
  fields: FieldConfig[];
  entries: T[];
  onChange: (entries: T[]) => void;
  createEmpty: () => T;
}

export function SectionEditor<T extends Record<string, string>>({
  title,
  fields,
  entries,
  onChange,
  createEmpty,
}: SectionEditorProps<T>) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<T>(createEmpty());

  const handleAdd = () => {
    setEditingIndex(entries.length);
    setDraft(createEmpty());
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setDraft({ ...entries[index] } as T);
  };

  const handleSave = () => {
    if (editingIndex === null) return;
    const updated = [...entries];
    if (editingIndex >= entries.length) {
      updated.push(draft);
    } else {
      updated[editingIndex] = draft;
    }
    onChange(updated);
    setEditingIndex(null);
    setDraft(createEmpty());
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setDraft(createEmpty());
  };

  const handleRemove = (index: number) => {
    const updated = entries.filter((_, i) => i !== index);
    onChange(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setDraft((prev) => ({ ...prev, [fieldName]: value }));
  };

  const renderForm = () => (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              value={draft[field.name] ?? ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={draft[field.name] ?? ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-1.5 text-sm border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          + Agregar
        </button>
      </div>

      {entries.map((entry, index) => (
        <div
          key={index}
          className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
        >
          {editingIndex === index ? (
            renderForm()
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-800 dark:text-slate-200">
                {entry[fields[0]?.name ?? ''] || 'Sin título'}
                {fields[1] && entry[fields[1].name] && (
                  <span className="text-slate-500 dark:text-slate-400 ml-2">
                    — {entry[fields[1].name]}
                  </span>
                )}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {editingIndex !== null && editingIndex >= entries.length && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          {renderForm()}
        </div>
      )}
    </div>
  );
}
