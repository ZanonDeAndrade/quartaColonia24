import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { normalizeNews } from "../lib/news-normalizer";
import type { ApiNewsItem, PortalNewsItem } from "../types/news";

interface ApiNewsDetailEnvelope {
  item?: ApiNewsItem;
  data?: ApiNewsItem;
}

interface ApiNewsListEnvelope {
  items?: ApiNewsItem[];
  nextCursor?: string | null;
}

interface UseNewsDetailResult {
  data: PortalNewsItem | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const isRouteOr404Error = (error: unknown) =>
  error instanceof Error &&
  (error.message.includes("Route not found") || error.message.includes("HTTP 404"));

async function findBySlugFromList(slug: string) {
  const pageSize = 50;
  let cursor: string | null | undefined;

  for (let page = 0; page < 20; page += 1) {
    const query = cursor
      ? `?pageSize=${pageSize}&cursor=${encodeURIComponent(cursor)}`
      : `?pageSize=${pageSize}`;
    const response = await apiGet<ApiNewsListEnvelope>(`/api/news${query}`);
    const items = Array.isArray(response?.items) ? response.items : [];
    const found = items.find((item) => item.slug === slug);

    if (found) {
      return found;
    }

    if (!response.nextCursor) {
      break;
    }

    cursor = response.nextCursor;
  }

  return null;
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
      let response: ApiNewsItem | ApiNewsDetailEnvelope;

      try {
        response = await apiGet<ApiNewsItem | ApiNewsDetailEnvelope>(`/api/news/slug/${slug}`);
      } catch (primaryError) {
        if (!isRouteOr404Error(primaryError)) {
          throw primaryError;
        }

        try {
          response = await apiGet<ApiNewsItem | ApiNewsDetailEnvelope>(`/api/news/${slug}`);
        } catch (legacyError) {
          if (!isRouteOr404Error(legacyError)) {
            throw legacyError;
          }

          const itemFromList = await findBySlugFromList(slug);
          if (!itemFromList) {
            throw new Error("Noticia nao encontrada.");
          }

          response = itemFromList;
        }
      }

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
