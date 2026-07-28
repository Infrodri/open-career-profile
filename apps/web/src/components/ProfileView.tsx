import { useQueryClient } from '@tanstack/react-query';
import type {
  Evidence,
  ProfessionalProfile,
  SectionEntry,
  SectionKey,
} from '../types/profile';
import { SECTION_KEYS, SECTION_LABELS } from '../types/profile';
import { EntryActions } from './EntryActions';

interface ProfileViewProps {
  profile: ProfessionalProfile;
  evidence?: Evidence[];
}

/** Fields we don't render because they're metadata. */
// const HIDDEN_FIELDS = new Set(['id', 'verified', 'createdAt', 'updatedAt', 'profileId']);

/** Resolve the "headline" of an entry for display. */
function getEntryTitle(entry: SectionEntry): string {
  const title = entry['title'] ?? entry['name'] ?? entry['position'] ?? '';
  return typeof title === 'string' && title !== '' ? title : 'Sin título';
}

/** Resolve the subtitle (institution/issuer). */
function getEntrySubtitle(entry: SectionEntry): string {
  const sub = entry['institution'] ?? entry['issuer'] ?? '';
  return typeof sub === 'string' ? sub : '';
}

/** Format a date range. */
function getDateRange(entry: SectionEntry): string {
  const start = entry['startDate'] ?? entry['issueDate'] ?? '';
  const end = entry['endDate'] ?? '';
  if (!start && !end) return '';
  if (start && !end) return String(start);
  return `${start} — ${end || 'Presente'}`;
}

export function ProfileView({ profile, evidence = [] }: ProfileViewProps) {
  const { personalInfo, sections } = profile;

  // Index evidence by entryId for O(1) lookup
  const evidenceByEntry = new Map<string, Evidence[]>();
  for (const ev of evidence) {
    const list = evidenceByEntry.get(ev.entryId) ?? [];
    list.push(ev);
    evidenceByEntry.set(ev.entryId, list);
  }

  // Count verified and total
  const allEntries = SECTION_KEYS.flatMap((key) => sections[key] ?? []);
  const totalEntries = allEntries.length;
  const verifiedCount = allEntries.filter((e) => e.verified).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-6 py-8">
      {/* Personal Info */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-4">
          {/* Photo */}
          <ProfilePhoto
            photo={personalInfo.photo}
            profileId={profile.id}
            fullName={personalInfo.fullName}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {personalInfo.fullName}
            </h2>
        {personalInfo.profesiones.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {personalInfo.profesiones.map((p, i) => (
              <span key={i} className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                {p}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.identityDocument && <span>CI: {personalInfo.identityDocument}</span>}
          {personalInfo.nacionalidad && <span>{personalInfo.nacionalidad}</span>}
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
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                {link.label}
              </a>
            ))}
          </div>
        )}
        {totalEntries > 0 && (
          <div className="mt-4 flex items-center gap-3 text-xs">
            <span className="text-green-700 dark:text-green-400 flex items-center gap-1">
              <VerifiedIcon /> {verifiedCount} verificadas
            </span>
            <span className="text-slate-400">
              {totalEntries - verifiedCount} pendientes de verificar
            </span>
          </div>
        )}
          </div>
        </div>
      </section>

      {/* Render each section that has entries */}
      {SECTION_KEYS.map((sectionKey) => {
        const entries = sections[sectionKey] ?? [];
        if (entries.length === 0) return null;

        return (
          <section key={sectionKey}
            className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              {SECTION_LABELS[sectionKey]}{' '}
              <span className="text-sm font-normal text-slate-500">({entries.length})</span>
            </h3>
            <div className="space-y-3">
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  sectionKey={sectionKey}
                  profileId={profile.id}
                  evidence={evidenceByEntry.get(entry.id) ?? []}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// --- Sub-components ---

function EntryCard({
  entry,
  sectionKey,
  profileId,
  evidence,
}: {
  entry: SectionEntry;
  sectionKey: SectionKey;
  profileId: string;
  evidence: Evidence[];
}) {
  const title = getEntryTitle(entry);
  const subtitle = getEntrySubtitle(entry);
  const dateRange = getDateRange(entry);
  const detalle = entry['detalle'] ?? entry['description'] ?? '';
  const contenido = entry['contenido'];
  const proyectos = entry['proyectos'];

  const borderColor = entry.verified
    ? 'border-green-500'
    : 'border-slate-300 dark:border-slate-600';

  return (
    <div className={`border-l-4 ${borderColor} pl-4 py-2`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
            {title}
            {entry.verified ? <VerifiedIcon /> : <UnverifiedIcon />}
          </h4>
          {subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
          {dateRange && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{dateRange}</p>
          )}
        </div>
        {/* Actions: View, Edit, Verify */}
        <EntryActions
          profileId={profileId}
          sectionKey={sectionKey}
          entry={entry}
          evidence={evidence}
        />
      </div>

      {typeof detalle === 'string' && detalle !== '' && (
        <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-300">{detalle}</p>
      )}

      {Array.isArray(contenido) && contenido.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {contenido.map((item, i) => (
            <li key={i} className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
              {String(item)}
            </li>
          ))}
        </ul>
      )}

      {Array.isArray(proyectos) && proyectos.length > 0 && (
        <ul className="mt-2 list-disc list-inside text-sm text-slate-700 dark:text-slate-300">
          {proyectos.map((p, i) => (
            <li key={i}>{String(p)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function VerifiedIcon() {
  return (
    <svg className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-label="Verificado">
      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function UnverifiedIcon() {
  return (
    <svg className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-label="No verificado">
      <title>Pendiente de verificación — sube el documento original</title>
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

// EvidenceClips is no longer needed — VerifyEntryButton handles both states.

// =============================================================================
// Profile Photo Component
// =============================================================================

function ProfilePhoto({
  photo,
  profileId,
  fullName,
}: {
  photo?: string;
  profileId: string;
  fullName: string;
}) {
  const queryClient = useQueryClient();

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      try {
        const res = await fetch(`/api/profiles/${profileId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personalInfo: { photo: base64 } }),
        });
        if (res.ok) {
          void queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
      } catch {
        // silently fail
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="shrink-0">
      <label className="cursor-pointer block relative group" title="Cambiar foto de perfil">
        {photo ? (
          <img
            src={photo}
            alt={fullName}
            className="w-20 h-24 object-cover rounded-lg border-2 border-slate-200 dark:border-slate-600"
          />
        ) : (
          <div className="w-20 h-24 bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 5a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </label>
      <p className="text-[9px] text-slate-400 text-center mt-1">
        {photo ? 'Cambiar' : 'Subir foto'}
      </p>
    </div>
  );
}
