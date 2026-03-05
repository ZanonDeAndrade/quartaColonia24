import { api } from './api-client';
import type { SponsorItem, SponsorListResponse } from '../types/api';

export interface SaveSponsorPayload {
  name: string;
  link?: string;
  active: boolean;
  order: number;
}

export const sponsorsService = {
  listAdmin(params?: { active?: boolean }) {
    const search = new URLSearchParams();
    if (typeof params?.active === 'boolean') {
      search.set('active', String(params.active));
    }
    const suffix = search.toString() ? `?${search.toString()}` : '';

    return api.get<SponsorListResponse>(`/api/admin/sponsors${suffix}`, { auth: true });
  },
  create(payload: SaveSponsorPayload) {
    return api.post<SponsorItem>('/api/admin/sponsors', payload, { auth: true });
  },
  update(id: string, payload: Partial<SaveSponsorPayload>) {
    return api.put<SponsorItem>(`/api/admin/sponsors/${id}`, payload, { auth: true });
  },
  remove(id: string) {
    return api.delete<{ success: true }>(`/api/admin/sponsors/${id}`, { auth: true });
  },
  uploadImage(id: string, formData: FormData) {
    return api.post<SponsorItem>(`/api/admin/sponsors/${id}/image`, formData, { auth: true });
  }
};
