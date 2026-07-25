import { useState } from 'react';
import type { CreateProfilePayload, PersonalInfo } from '../types/profile';

interface ProfileFormProps {
  onSubmit: (data: CreateProfilePayload) => void;
  isLoading: boolean;
  submitLabel: string;
  initialData?: PersonalInfo;
}

/**
 * Form for creating or editing the personal info of a profile.
 * Sections (education, experience, etc.) are managed via document upload,
 * not manually in this form. This keeps the form simple and encourages
 * document-backed entries.
 */
export function ProfileForm({ onSubmit, isLoading, submitLabel, initialData }: ProfileFormProps) {
  const [formData, setFormData] = useState<PersonalInfo>({
    fullName: initialData?.fullName ?? '',
    profesiones: initialData?.profesiones ?? [],
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    city: initialData?.city ?? '',
    country: initialData?.country ?? '',
    nacionalidad: initialData?.nacionalidad ?? '',
    sexo: initialData?.sexo ?? '',
    estadoCivil: initialData?.estadoCivil ?? '',
    summary: initialData?.summary ?? '',
    birthDate: initialData?.birthDate ?? '',
    identityDocument: initialData?.identityDocument ?? '',
    libretaMilitar: initialData?.libretaMilitar ?? '',
    links: initialData?.links ?? [],
  });

  const [profesionInput, setProfesionInput] = useState('');

  const update = (key: keyof PersonalInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addProfesion = () => {
    if (profesionInput.trim() === '') return;
    setFormData((prev) => ({
      ...prev,
      profesiones: [...prev.profesiones, profesionInput.trim()],
    }));
    setProfesionInput('');
  };

  const removeProfesion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      profesiones: prev.profesiones.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ personalInfo: formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Información Personal</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nombre completo *" value={formData.fullName} onChange={(v) => update('fullName', v)} required />
          <Input label="Cédula de identidad" value={formData.identityDocument ?? ''} onChange={(v) => update('identityDocument', v)} />
          <Input label="Correo electrónico" value={formData.email ?? ''} onChange={(v) => update('email', v)} type="email" />
          <Input label="Teléfono" value={formData.phone ?? ''} onChange={(v) => update('phone', v)} />
          <Input label="Ciudad" value={formData.city ?? ''} onChange={(v) => update('city', v)} />
          <Input label="País" value={formData.country ?? ''} onChange={(v) => update('country', v)} />
          <Input label="Nacionalidad" value={formData.nacionalidad ?? ''} onChange={(v) => update('nacionalidad', v)} />
          <Input label="Sexo" value={formData.sexo ?? ''} onChange={(v) => update('sexo', v)} />
          <Input label="Estado civil" value={formData.estadoCivil ?? ''} onChange={(v) => update('estadoCivil', v)} />
          <Input label="Fecha de nacimiento" value={formData.birthDate ?? ''} onChange={(v) => update('birthDate', v)} />
          <Input label="Libreta servicio militar" value={formData.libretaMilitar ?? ''} onChange={(v) => update('libretaMilitar', v)} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Resumen profesional</label>
          <textarea
            value={formData.summary ?? ''}
            onChange={(e) => update('summary', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Profesiones */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Profesiones</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.profesiones.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded">
                {p}
                <button type="button" onClick={() => removeProfesion(i)} className="text-blue-500 hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={profesionInput}
              onChange={(e) => setProfesionInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addProfesion(); } }}
              placeholder="Ej: Ing. Sistemas Informático"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="button" onClick={addProfesion}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Agregar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Para agregar experiencia, educación, certificaciones y demás secciones, sube tu hoja de vida
          o los documentos individuales desde <strong>Agregar Documento</strong>. La IA extraerá la
          información y la clasificará automáticamente.
        </p>
      </div>

      <button type="submit" disabled={isLoading || !formData.fullName.trim()}
        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {isLoading ? 'Guardando...' : submitLabel}
      </button>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
