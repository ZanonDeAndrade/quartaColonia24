import { api } from './api-client';
import type { ColumnItem, NewsItem, SponsorItem } from '../types/api';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface UploadNewsImageResult {
  imagePath: string;
  imageUrl: string;
}

export interface UploadSponsorImageResult {
  imagePath: string;
  imageUrl: string;
}

export interface UploadColumnImageResult {
  imagePath: string;
  imageUrl: string;
}

const getFileExtension = (file: File) => {
  const typeExtension = file.type.split('/')[1]?.trim().toLowerCase();
  if (typeExtension) {
    return typeExtension === 'jpeg' ? 'jpg' : typeExtension;
  }

  const nameExtension = file.name.split('.').pop()?.trim().toLowerCase();
  return nameExtension || 'bin';
};

export const validateNewsImageFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione apenas arquivos de imagem.');
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('A imagem deve ter no maximo 5 MB.');
  }
};

export const validateSponsorImageFile = validateNewsImageFile;
export const validateColumnImageFile = validateNewsImageFile;

export const storageService = {
  async uploadNewsImage(newsId: string, file: File): Promise<UploadNewsImageResult> {
    validateNewsImageFile(file);
    const formData = new FormData();
    formData.append('image', file, `${crypto.randomUUID()}.${getFileExtension(file)}`);

    try {
      const news = await api.post<NewsItem>(`/api/admin/news/${newsId}/image`, formData, { auth: true });
      return {
        imagePath: news.imagePath ?? '',
        imageUrl: news.imageUrl ?? ''
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Falha ao enviar imagem para o backend.');
    }
  },

  async uploadSponsorImage(sponsorId: string, file: File): Promise<UploadSponsorImageResult> {
    validateSponsorImageFile(file);
    const formData = new FormData();
    formData.append('image', file, `${crypto.randomUUID()}.${getFileExtension(file)}`);

    try {
      const sponsor = await api.post<SponsorItem>(`/api/admin/sponsors/${sponsorId}/image`, formData, { auth: true });
      return {
        imagePath: sponsor.imagePath ?? '',
        imageUrl: sponsor.imageUrl ?? ''
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Falha ao enviar imagem para o backend.');
    }
  },

  async uploadColumnImage(columnId: string, file: File): Promise<UploadColumnImageResult> {
    validateColumnImageFile(file);
    const formData = new FormData();
    formData.append('image', file, `${crypto.randomUUID()}.${getFileExtension(file)}`);

    try {
      const column = await api.post<ColumnItem>(`/api/admin/columns/${columnId}/image`, formData, { auth: true });
      return {
        imagePath: column.imagePath ?? '',
        imageUrl: column.imageUrl ?? ''
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Falha ao enviar imagem para o backend.');
    }
  }
};
