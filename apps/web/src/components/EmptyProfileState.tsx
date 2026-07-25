import { Link } from 'react-router-dom';

interface EmptyProfileStateProps {
  title?: string;
  description?: string;
}

/**
 * Shown when a page needs a profile but none is selected yet.
 * Offers the two ways to get one instead of leaving a dead end.
 */
export function EmptyProfileState({
  title = 'Todavía no tienes un perfil',
  description = 'Sube un documento para que la IA lo construya por ti, o créalo a mano.',
}: EmptyProfileStateProps) {
  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center">
        <svg className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
      <p className="mt-2 text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/documento"
          className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
        >
          Subir un documento
        </Link>
        <Link
          to="/create"
          className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Crear perfil a mano
        </Link>
      </div>
    </div>
  );
}
