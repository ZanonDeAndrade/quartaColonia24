import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import type { ApiSponsorItem, PortalSponsorItem } from '../types/sponsor';

interface UseSponsorsResult {
  data: PortalSponsorItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const normalizeSponsor = (input: ApiSponsorItem, index: number): PortalSponsorItem => ({
  id: String(input.id ?? `sponsor-${index}`),
  name: String(input.name ?? 'Patrocinador'),
  imageUrl: String(input.imageUrl ?? ''),
  imagePath: String(input.imagePath ?? ''),
  link: typeof input.link === 'string' && input.link.trim() ? input.link.trim() : null,
  active: Boolean(input.active),
  order: Number.isFinite(input.order) ? Number(input.order) : index
});

export function useSponsors(): UseSponsorsResult {
  const [data, setData] = useState<PortalSponsorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet<{ items?: ApiSponsorItem[] } | ApiSponsorItem[]>('/api/sponsors');
      const rawItems = Array.isArray(response) ? response : response.items ?? [];
      const normalized = rawItems
        .map(normalizeSponsor)
        .filter((item) => item.active)
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      setData(normalized);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar patrocinadores.';
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSponsors();
  }, [fetchSponsors]);

  return { data, loading, error, refetch: fetchSponsors };
}
