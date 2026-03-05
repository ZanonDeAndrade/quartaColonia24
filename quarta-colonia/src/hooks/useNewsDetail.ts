import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { normalizeNews } from "../lib/news-normalizer";
import type { ApiNewsItem, PortalNewsItem } from "../types/news";

interface ApiNewsDetailEnvelope {
  item?: ApiNewsItem;
  data?: ApiNewsItem;
}

interface UseNewsDetailResult {
  data: PortalNewsItem | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNewsDetail(slug?: string): UseNewsDetailResult {
  const [data, setData] = useState<PortalNewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      setError("Noticia invalida.");
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiGet<ApiNewsItem | ApiNewsDetailEnvelope>(`/api/news/${slug}`);
      const envelope = response as ApiNewsDetailEnvelope;
      const payload = envelope.item ?? envelope.data ?? (response as ApiNewsItem);
      setData(payload ? normalizeNews(payload) : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel carregar esta noticia.";
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
