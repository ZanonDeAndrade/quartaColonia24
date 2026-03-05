import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import { extractColumnsList, normalizeColumn } from '../lib/column-normalizer';
import type { ApiColumnItem, PortalColumnItem } from '../types/column';

interface UsePublishedColumnsResult {
  data: PortalColumnItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePublishedColumns(): UsePublishedColumnsResult {
  const [data, setData] = useState<PortalColumnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColumns = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet<
        {
          items?: ApiColumnItem[];
          data?: ApiColumnItem[];
          columns?: ApiColumnItem[];
          results?: ApiColumnItem[];
        } | ApiColumnItem[]
      >('/api/columns');

      const normalized = extractColumnsList(response)
        .map(normalizeColumn)
        .filter((item) => item.published)
        .sort((a, b) => (new Date(b.publishedAt ?? 0).getTime() || 0) - (new Date(a.publishedAt ?? 0).getTime() || 0));

      setData(normalized);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar colunas.';
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchColumns();
  }, [fetchColumns]);

  return { data, loading, error, refetch: fetchColumns };
}
