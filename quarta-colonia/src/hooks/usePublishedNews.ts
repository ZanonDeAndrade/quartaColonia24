import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { extractNewsList, normalizeNews } from "../lib/news-normalizer";
import type { ApiNewsItem, PortalNewsItem } from "../types/news";

interface UsePublishedNewsResult {
  data: PortalNewsItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePublishedNews(): UsePublishedNewsResult {
  const [data, setData] = useState<PortalNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet<
        {
          items?: ApiNewsItem[];
          data?: ApiNewsItem[];
          news?: ApiNewsItem[];
          results?: ApiNewsItem[];
        } | ApiNewsItem[]
      >("/api/news");

      const normalized = extractNewsList(response)
        .filter((item) => String(item.status ?? "published").toLowerCase() !== "draft")
        .map(normalizeNews);
      setData(normalized);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao carregar noticias.";
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNews();
  }, [fetchNews]);

  return { data, loading, error, refetch: fetchNews };
}
