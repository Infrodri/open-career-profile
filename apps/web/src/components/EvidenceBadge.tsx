import { documentFileUrl } from '../api/document.api';
import type { Evidence } from '../types/profile';

interface EvidenceBadgeProps {
  /** Evidence links pointing at this specific entry. */
  links: Evidence[];
}

/**
 * Paperclip marker shown next to a profile entry that has supporting documents.
 * Renders nothing when the entry has no evidence, since evidence is optional.
 */
export function EvidenceBadge({ links }: EvidenceBadgeProps) {
  if (links.length === 0) return null;

  const label =
    links.length === 1
      ? 'Ver el documento que respalda esta información'
      : `Ver los ${links.length} documentos que respaldan esta información`;

  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {links.map((evidence, index) => (
        <a
          key={evidence.id}
          href={documentFileUrl(evidence.documentId)}
          target="_blank"
          rel="noopener noreferrer"
          title={evidence.note ?? label}
          aria-label={label}
          className="inline-flex items-center gap-0.5 text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
              clipRule="evenodd"
            />
          </svg>
          {links.length > 1 && <span className="text-[10px] font-semibold">{index + 1}</span>}
        </a>
      ))}
    </span>
  );
}
