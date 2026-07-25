import type { ProfessionalProfile } from '../types/profile';

interface ProfileViewProps {
  profile: ProfessionalProfile;
}

export function ProfileView({ profile }: ProfileViewProps) {
  const { personalInfo, sections } = profile;

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">{personalInfo.fullName}</h2>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {(personalInfo.city || personalInfo.country) && (
            <span>
              {[personalInfo.city, personalInfo.country].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
        {personalInfo.summary && (
          <p className="mt-4 text-gray-700 leading-relaxed">{personalInfo.summary}</p>
        )}
        {personalInfo.links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            {personalInfo.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </section>

      {/* Work Experience */}
      {sections.workExperience.length > 0 && (
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Work Experience</h3>
          <div className="space-y-4">
            {sections.workExperience.map((exp) => (
              <div key={exp.id} className="border-l-4 border-blue-600 pl-4">
                <h4 className="font-semibold text-gray-800">{exp.position}</h4>
                <p className="text-sm text-gray-600">
                  {exp.institution}
                  {exp.location && ` — ${exp.location}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {exp.startDate} — {exp.endDate ?? 'Present'}
                </p>
                {exp.description && (
                  <p className="mt-2 text-sm text-gray-700">{exp.description}</p>
                )}
                {exp.achievements.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
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

      {/* Education */}
      {sections.education.length > 0 && (
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Education</h3>
          <div className="space-y-4">
            {sections.education.map((edu) => (
              <div key={edu.id} className="border-l-4 border-green-600 pl-4">
                <h4 className="font-semibold text-gray-800">{edu.title}</h4>
                <p className="text-sm text-gray-600">
                  {edu.institution}
                  {edu.field && ` — ${edu.field}`}
                </p>
                {(edu.startDate || edu.endDate) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {edu.startDate ?? ''} — {edu.endDate ?? 'Present'}
                  </p>
                )}
                {edu.description && (
                  <p className="mt-2 text-sm text-gray-700">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {sections.skills.length > 0 && (
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {sections.skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {skill.name}
                {skill.level && (
                  <span className="ml-1 text-blue-600 text-xs">({skill.level})</span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {sections.languages.length > 0 && (
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Languages</h3>
          <div className="flex flex-wrap gap-3">
            {sections.languages.map((lang) => (
              <span
                key={lang.id}
                className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
              >
                {lang.name} — {lang.level}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {sections.certifications.length > 0 && (
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Certifications</h3>
          <div className="space-y-3">
            {sections.certifications.map((cert) => (
              <div key={cert.id} className="border-l-4 border-amber-500 pl-4">
                <h4 className="font-semibold text-gray-800">{cert.name}</h4>
                <p className="text-sm text-gray-600">{cert.issuer}</p>
                {cert.issueDate && (
                  <p className="text-xs text-gray-500">Issued: {cert.issueDate}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
