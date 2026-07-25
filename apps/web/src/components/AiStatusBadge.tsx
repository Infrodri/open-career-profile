import { useQuery } from '@tanstack/react-query';
import { unwrap } from '../api/http';

interface AiStatus {
  connected: boolean;
  model: string;
  error: string | null;
}

async function fetchAiStatus(): Promise<AiStatus> {
  const response = await fetch('/api/ai/status');
  return unwrap<AiStatus>(response);
}

/**
 * Small badge that shows whether the AI provider is connected.
 * Placed in the sidebar so the user always knows if AI analysis will work.
 */
export function AiStatusBadge() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['ai-status'],
    queryFn: fetchAiStatus,
    refetchInterval: 60_000, // Re-check every minute
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse" />
        Verificando IA...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="w-2 h-2 rounded-full bg-slate-400" />
        IA: sin conexión
      </div>
    );
  }

  if (data.connected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-green-700 dark:text-green-400">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        IA conectada
        <span className="text-slate-400 dark:text-slate-500 truncate max-w-[120px]" title={data.model}>
          ({data.model.split('/').pop()})
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400" title={data.error ?? undefined}>
      <div className="w-2 h-2 rounded-full bg-red-500" />
      IA desconectada
    </div>
  );
}
