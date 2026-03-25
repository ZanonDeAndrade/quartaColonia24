import { api } from './api-client';
import { getApiBaseUrl } from './api-base-url';
import { tokenStorage } from './token-storage';
import type { NewsItem, NewsListResponse, NewsStatus } from '../types/api';

export interface SaveNewsPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category?: string;
  tags?: string[];
  status?: NewsStatus;
}

export const newsService = {
  listAdmin(params?: {
    pageSize?: number;
    cursor?: string;
    status?: NewsStatus;
    category?: string;
    search?: string;
  }) {
    const search = new URLSearchParams();
    if (params?.pageSize) search.set('pageSize', String(params.pageSize));
    if (params?.cursor) search.set('cursor', params.cursor);
    if (params?.status) search.set('status', params.status);
    if (params?.category) search.set('category', params.category);
    if (params?.search) search.set('search', params.search);
    const suffix = search.toString() ? `?${search.toString()}` : '';

    return api.get<NewsListResponse>(`/api/admin/news${suffix}`, { auth: true });
  },
  getById(id: string) {
    return api.get<NewsItem>(`/api/admin/news/${id}`, { auth: true });
  },
  create(payload: SaveNewsPayload) {
    return api.post<NewsItem>('/api/admin/news', payload, { auth: true });
  },
  update(id: string, payload: Partial<SaveNewsPayload>) {
    return api.put<NewsItem>(`/api/admin/news/${id}`, payload, { auth: true });
  },
  publish(id: string, published: boolean) {
    return api.patch<NewsItem>(`/api/admin/news/${id}/publish`, { published }, { auth: true });
  },
  async remove(id: string) {
    const accessToken = tokenStorage.getAccessToken();
    const response = await fetch(`${getApiBaseUrl()}/api/admin/news/${id}`, {
      method: 'DELETE',
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`
          }
        : undefined
    });

    const text = await response.text();
    let body: { message?: string } | null = null;
    if (text) {
      try {
        body = JSON.parse(text) as { message?: string };
      } catch {
        body = null;
      }
    }

    if (!response.ok) {
      throw new Error(body?.message || `HTTP ${response.status}`);
    }

    return { success: true as const };
  }
};
