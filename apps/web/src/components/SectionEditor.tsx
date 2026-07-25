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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          + Add
        </button>
      </div>

      {entries.map((entry, index) => (
        <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
          {editingIndex === index ? (
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={draft[field.name] ?? ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={draft[field.name] ?? ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {entry[fields[0]?.name ?? ''] || 'Untitled'}
                {fields[1] && entry[fields[1].name] && (
                  <span className="text-gray-500 ml-2">— {entry[fields[1].name]}</span>
                )}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(index)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {editingIndex !== null && editingIndex >= entries.length && (
        <div className="p-3 bg-blue-50 rounded border border-blue-200 space-y-3">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={draft[field.name] ?? ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              ) : (
                <input
                  type="text"
                  value={draft[field.name] ?? ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
