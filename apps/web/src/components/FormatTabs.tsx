import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/plantillas', label: 'Reglas institucionales' },
  { path: '/diseno', label: 'Diseño visual' },
  { path: '/importar-formato', label: 'Importar formato' },
  { path: '/llenar-formulario', label: 'Llenar formulario' },
] as const;

/**
 * Shared tab navigation for the Formats & Templates section.
 * Shows which sub-page is active and allows navigation between them.
 */
export function FormatTabs() {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-wrap gap-1 mb-6 border-b border-slate-200 dark:border-slate-700">
      {TABS.map((tab) => {
        const active = pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
