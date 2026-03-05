import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import { normalizeColumn } from '../lib/column-normalizer';
import type { ApiColumnItem, PortalColumnItem } from '../types/column';

interface ApiColumnDetailEnvelope {
  item?: ApiColumnItem;
  data?: ApiColumnItem;
}

interface UseColumnDetailResult {
  data: PortalColumnItem | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useColumnDetail(slug?: string): UseColumnDetailResult {
  const [data, setData] = useState<PortalColumnItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      setError('Coluna invalida.');
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiGet<ApiColumnItem | ApiColumnDetailEnvelope>(`/api/columns/${slug}`);
      const envelope = response as ApiColumnDetailEnvelope;
      const payload = envelope.item ?? envelope.data ?? (response as ApiColumnItem);
      setData(payload ? normalizeColumn(payload) : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nao foi possivel carregar esta coluna.';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  return { data, loading, error, refetch: fetchDetail };
}
