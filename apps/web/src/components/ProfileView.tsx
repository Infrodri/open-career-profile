import type { ProfessionalProfile } from '../types/profile';

interface ProfileViewProps {
  profile: ProfessionalProfile;
}

export function ProfileView({ profile }: ProfileViewProps) {
  const { personalInfo, sections } = profile;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-6 py-8">
      {/* Información Personal */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {personalInfo.fullName}
        </h2>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {(personalInfo.city || personalInfo.country) && (
            <span>{[personalInfo.city, personalInfo.country].filter(Boolean).join(', ')}</span>
          )}
        </div>
        {personalInfo.summary && (
          <p className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed">
            {personalInfo.summary}
          </p>
        )}
        {personalInfo.links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {personalInfo.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Experiencia Laboral */}
      {sections.workExperience.length > 0 && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            Experiencia Laboral
          </h3>
          <div className="space-y-4">
            {sections.workExperience.map((exp) => (
              <div key={exp.id} className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{exp.position}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {exp.institution}
                  {exp.location && ` — ${exp.location}`}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {exp.startDate} — {exp.endDate ?? 'Actualidad'}
                </p>
                {exp.description && (
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{exp.description}</p>
                )}
                {exp.achievements.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-sm text-slate-700 dark:text-slate-300">
                    {exp.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Educación */}
      {sections.education.length > 0 && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Educación</h3>
          <div className="space-y-4">
            {sections.education.map((edu) => (
              <div key={edu.id} className="border-l-4 border-green-600 pl-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{edu.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {edu.institution}
                  {edu.field && ` — ${edu.field}`}
                </p>
                {(edu.startDate || edu.endDate) && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {edu.startDate ?? ''} — {edu.endDate ?? 'Actualidad'}
                  </p>
                )}
                {edu.description && (
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Habilidades */}
      {sections.skills.length > 0 && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Habilidades</h3>
          <div className="flex flex-wrap gap-2">
            {sections.skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-sm rounded-full"
              >
                {skill.name}
                {skill.level && (
                  <span className="ml-1 text-blue-600 dark:text-blue-400 text-xs">({skill.level})</span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Idiomas */}
      {sections.languages.length > 0 && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Idiomas</h3>
          <div className="flex flex-wrap gap-3">
            {sections.languages.map((lang) => (
              <span
                key={lang.id}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-sm rounded-full"
              >
                {lang.name} — {lang.level}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Certificaciones */}
      {sections.certifications.length > 0 && (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Certificaciones</h3>
          <div className="space-y-3">
            {sections.certifications.map((cert) => (
              <div key={cert.id} className="border-l-4 border-amber-500 pl-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{cert.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{cert.issuer}</p>
                {cert.issueDate && (
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Emitido: {cert.issueDate}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
