import { useState } from 'react';
import type { CreateProfilePayload } from '../types/profile';
import { SectionEditor, type FieldConfig } from './SectionEditor';

interface ProfileFormProps {
  initialData?: CreateProfilePayload;
  onSubmit: (data: CreateProfilePayload) => void;
  isLoading: boolean;
  submitLabel: string;
}

const workExperienceFields: FieldConfig[] = [
  { name: 'position', label: 'Position', required: true, placeholder: 'Software Engineer' },
  { name: 'institution', label: 'Company', required: true, placeholder: 'ACME Corp' },
  { name: 'startDate', label: 'Start Date', placeholder: 'YYYY-MM' },
  { name: 'endDate', label: 'End Date', placeholder: 'YYYY-MM or present' },
  { name: 'location', label: 'Location', placeholder: 'New York, NY' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What you did...' },
];

const educationFields: FieldConfig[] = [
  { name: 'title', label: 'Degree', required: true, placeholder: 'B.Sc. Computer Science' },
  { name: 'institution', label: 'Institution', required: true, placeholder: 'MIT' },
  { name: 'field', label: 'Field of Study', placeholder: 'Computer Science' },
  { name: 'startDate', label: 'Start Date', placeholder: 'YYYY-MM' },
  { name: 'endDate', label: 'End Date', placeholder: 'YYYY-MM or present' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

const skillFields: FieldConfig[] = [
  { name: 'name', label: 'Skill', required: true, placeholder: 'TypeScript' },
  { name: 'category', label: 'Category', placeholder: 'Programming' },
  { name: 'level', label: 'Level', placeholder: 'basic | intermediate | advanced | expert' },
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
      {/* Personal Info */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.personalInfo.fullName}
              onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.personalInfo.email ?? ''}
              onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
              placeholder="john@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.personalInfo.phone ?? ''}
              onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
              placeholder="+1 555 0123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={formData.personalInfo.city ?? ''}
              onChange={(e) => handlePersonalInfoChange('city', e.target.value)}
              placeholder="New York"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={formData.personalInfo.country ?? ''}
              onChange={(e) => handlePersonalInfoChange('country', e.target.value)}
              placeholder="United States"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Summary
            </label>
            <textarea
              value={formData.personalInfo.summary ?? ''}
              onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
              placeholder="A brief summary of your professional background..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Work Experience */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <SectionEditor
          title="Work Experience"
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

      {/* Education */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <SectionEditor
          title="Education"
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

      {/* Skills */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <SectionEditor
          title="Skills"
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

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
