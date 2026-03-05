import { api } from './api-client';
import type { ColumnItem, ColumnListResponse } from '../types/api';

export interface SaveColumnPayload {
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorImageUrl?: string;
  published?: boolean;
}

export const columnsService = {
  listAdmin(params?: { published?: boolean; search?: string }) {
    const search = new URLSearchParams();
    if (typeof params?.published === 'boolean') {
      search.set('published', String(params.published));
    }
    if (params?.search) {
      search.set('search', params.search);
    }
    const suffix = search.toString() ? `?${search.toString()}` : '';

    return api.get<ColumnListResponse>(`/api/admin/columns${suffix}`, { auth: true });
  },
  getById(id: string) {
    return api.get<ColumnItem>(`/api/admin/columns/${id}`, { auth: true });
  },
  create(payload: SaveColumnPayload) {
    return api.post<ColumnItem>('/api/admin/columns', payload, { auth: true });
  },
  update(id: string, payload: Partial<SaveColumnPayload>) {
    return api.put<ColumnItem>(`/api/admin/columns/${id}`, payload, { auth: true });
  },
  publish(id: string, published: boolean) {
    return api.patch<ColumnItem>(`/api/admin/columns/${id}/publish`, { published }, { auth: true });
  },
  remove(id: string) {
    return api.delete<{ success: true }>(`/api/admin/columns/${id}`, { auth: true });
  }
};
