import { useMemo } from 'react';
import type { Evidence, ProfessionalProfile, SectionType } from '../types/profile';
import { EvidenceBadge } from './EvidenceBadge';

interface ProfileViewProps {
  profile: ProfessionalProfile;
  /** Evidence links for this profile. Optional: the view works without them. */
  evidence?: Evidence[];
}

export function ProfileView({ profile, evidence = [] }: ProfileViewProps) {
  const { personalInfo, sections } = profile;

  /** Evidence indexed by "sectionType:entryId" for O(1) lookup per entry. */
  const evidenceByEntry = useMemo(() => {
    const map = new Map<string, Evidence[]>();
    for (const link of evidence) {
      const key = `${link.sectionType}:${link.entryId}`;
      const list = map.get(key) ?? [];
      list.push(link);
      map.set(key, list);
    }
    return map;
  }, [evidence]);

  const linksFor = (sectionType: SectionType, entryId: string): Evidence[] =>
    evidenceByEntry.get(`${sectionType}:${entryId}`) ?? [];

  const backedCount = evidence.length;

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
        {backedCount > 0 && (
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                clipRule="evenodd"
              />
            </svg>
            El clip indica que la información tiene un documento que la respalda
          </p>
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
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {exp.position}
                  <EvidenceBadge links={linksFor('workExperience', exp.id)} />
                </h4>
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
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {edu.title}
                  <EvidenceBadge links={linksFor('education', edu.id)} />
                </h4>
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
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-sm rounded-full"
              >
                {skill.name}
                {skill.level && (
                  <span className="text-blue-600 dark:text-blue-400 text-xs">({skill.level})</span>
                )}
                <EvidenceBadge links={linksFor('skills', skill.id)} />
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
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-sm rounded-full"
              >
                {lang.name} — {lang.level}
                <EvidenceBadge links={linksFor('languages', lang.id)} />
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
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  {cert.name}
                  <EvidenceBadge links={linksFor('certifications', cert.id)} />
                </h4>
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
