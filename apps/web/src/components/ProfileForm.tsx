import { useState } from 'react';
import type { CreateProfilePayload } from '../types/profile';
import { SectionEditor, type FieldConfig } from './SectionEditor';

interface ProfileFormProps {
  initialData?: CreateProfilePayload;
  onSubmit: (data: CreateProfilePayload) => void;
  isLoading: boolean;
  submitLabel?: string;
}

const workExperienceFields: FieldConfig[] = [
  { name: 'position', label: 'Cargo', required: true, placeholder: 'Ingeniero de Software' },
  { name: 'institution', label: 'Empresa', required: true, placeholder: 'ACME Corp' },
  { name: 'startDate', label: 'Fecha de inicio', placeholder: 'AAAA-MM' },
  { name: 'endDate', label: 'Fecha de fin', placeholder: 'AAAA-MM o actualidad' },
  { name: 'location', label: 'Ubicación', placeholder: 'Ciudad de México, MX' },
  { name: 'description', label: 'Descripción', type: 'textarea', placeholder: 'Describe tus responsabilidades y logros...' },
];

const educationFields: FieldConfig[] = [
  { name: 'title', label: 'Título', required: true, placeholder: 'Lic. en Ingeniería de Sistemas' },
  { name: 'institution', label: 'Institución', required: true, placeholder: 'Universidad Nacional' },
  { name: 'field', label: 'Campo de estudio', placeholder: 'Ingeniería de Sistemas' },
  { name: 'startDate', label: 'Fecha de inicio', placeholder: 'AAAA-MM' },
  { name: 'endDate', label: 'Fecha de fin', placeholder: 'AAAA-MM o actualidad' },
  { name: 'description', label: 'Descripción', type: 'textarea' },
];

const skillFields: FieldConfig[] = [
  { name: 'name', label: 'Habilidad', required: true, placeholder: 'TypeScript' },
  { name: 'category', label: 'Categoría', placeholder: 'Programación' },
  { name: 'level', label: 'Nivel', placeholder: 'básico | intermedio | avanzado | experto' },
];

const certificationFields: FieldConfig[] = [
  { name: 'name', label: 'Nombre', required: true, placeholder: 'AWS Solutions Architect' },
  { name: 'issuer', label: 'Emisor', required: true, placeholder: 'Amazon Web Services' },
  { name: 'issueDate', label: 'Fecha de emisión', placeholder: 'AAAA-MM' },
  { name: 'expirationDate', label: 'Fecha de vencimiento', placeholder: 'AAAA-MM' },
];

const languageFields: FieldConfig[] = [
  { name: 'name', label: 'Idioma', required: true, placeholder: 'Inglés' },
  { name: 'level', label: 'Nivel', required: true, placeholder: 'básico | intermedio | avanzado | nativo' },
  { name: 'certification', label: 'Certificación', placeholder: 'TOEFL, IELTS, etc.' },
];

function createEmptyPayload(): CreateProfilePayload {
  return {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      city: '',
      country: '',
      summary: '',
      links: [],
    },
    sections: {
      workExperience: [],
      education: [],
      skills: [],
      certifications: [],
      languages: [],
      courses: [],
      projects: [],
      publications: [],
      awards: [],
      affiliations: [],
      volunteering: [],
      references: [],
    },
  };
}

export function ProfileForm({ initialData, onSubmit, isLoading, submitLabel }: ProfileFormProps) {
  const [formData, setFormData] = useState<CreateProfilePayload>(
    initialData ?? createEmptyPayload(),
  );

  const handlePersonalInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información Personal */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Información Personal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.personalInfo.fullName}
              onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
              placeholder="Juan Pérez García"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={formData.personalInfo.email ?? ''}
              onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
              placeholder="juan@ejemplo.com"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.personalInfo.phone ?? ''}
              onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
              placeholder="+52 555 123 4567"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              value={formData.personalInfo.city ?? ''}
              onChange={(e) => handlePersonalInfoChange('city', e.target.value)}
              placeholder="Ciudad de México"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              País
            </label>
            <input
              type="text"
              value={formData.personalInfo.country ?? ''}
              onChange={(e) => handlePersonalInfoChange('country', e.target.value)}
              placeholder="México"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Resumen profesional
            </label>
            <textarea
              value={formData.personalInfo.summary ?? ''}
              onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
              placeholder="Describe brevemente tu experiencia y objetivos profesionales..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Experiencia Laboral */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <SectionEditor
          title="Experiencia Laboral"
          fields={workExperienceFields}
          entries={formData.sections.workExperience as unknown as Record<string, string>[]}
          onChange={(entries) =>
            setFormData((prev) => ({
              ...prev,
              sections: {
                ...prev.sections,
                workExperience: entries as unknown as CreateProfilePayload['sections']['workExperience'],
              },
            }))
          }
          createEmpty={() =>
            ({
              position: '',
              institution: '',
              startDate: '',
              endDate: '',
              description: '',
              location: '',
            }) as unknown as Record<string, string>
          }
        />
      </section>

      {/* Educación */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <SectionEditor
          title="Educación"
          fields={educationFields}
          entries={formData.sections.education as unknown as Record<string, string>[]}
          onChange={(entries) =>
            setFormData((prev) => ({
              ...prev,
              sections: {
                ...prev.sections,
                education: entries as unknown as CreateProfilePayload['sections']['education'],
              },
            }))
          }
          createEmpty={() =>
            ({
              title: '',
              institution: '',
              field: '',
              startDate: '',
              endDate: '',
              description: '',
            }) as unknown as Record<string, string>
          }
        />
      </section>

      {/* Habilidades */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <SectionEditor
          title="Habilidades"
          fields={skillFields}
          entries={formData.sections.skills as unknown as Record<string, string>[]}
          onChange={(entries) =>
            setFormData((prev) => ({
              ...prev,
              sections: {
                ...prev.sections,
                skills: entries as unknown as CreateProfilePayload['sections']['skills'],
              },
            }))
          }
          createEmpty={() =>
            ({
              name: '',
              category: '',
              level: '',
            }) as unknown as Record<string, string>
          }
        />
      </section>

      {/* Certificaciones */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <SectionEditor
          title="Certificaciones"
          fields={certificationFields}
          entries={formData.sections.certifications as unknown as Record<string, string>[]}
          onChange={(entries) =>
            setFormData((prev) => ({
              ...prev,
              sections: {
                ...prev.sections,
                certifications: entries as unknown as CreateProfilePayload['sections']['certifications'],
              },
            }))
          }
          createEmpty={() =>
            ({
              name: '',
              issuer: '',
              issueDate: '',
              expirationDate: '',
            }) as unknown as Record<string, string>
          }
        />
      </section>

      {/* Idiomas */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <SectionEditor
          title="Idiomas"
          fields={languageFields}
          entries={formData.sections.languages as unknown as Record<string, string>[]}
          onChange={(entries) =>
            setFormData((prev) => ({
              ...prev,
              sections: {
                ...prev.sections,
                languages: entries as unknown as CreateProfilePayload['sections']['languages'],
              },
            }))
          }
          createEmpty={() =>
            ({
              name: '',
              level: '',
              certification: '',
            }) as unknown as Record<string, string>
          }
        />
      </section>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isLoading ? 'Guardando...' : (submitLabel ?? 'Guardar Perfil')}
        </button>
      </div>
    </form>
  );
}
