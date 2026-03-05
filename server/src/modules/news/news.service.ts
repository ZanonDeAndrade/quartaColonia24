import { AppError } from '../../common/errors.js';
import { slugify } from '../../common/slug.js';
import type { INewsRepository, IStorageService } from '../../contracts/repositories.js';
import type { NewsStatus } from '../../types/domain.js';

interface CreateNewsInput {
  title: string;
  excerpt?: string;
  content: string;
  category?: string;
  tags?: string[];
  status?: NewsStatus;
  imagePath?: string | null;
  imageUrl?: string | null;
}

interface UpdateNewsInput {
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  status?: NewsStatus;
  imagePath?: string | null;
  imageUrl?: string | null;
}

export class NewsService {
  constructor(
    private readonly newsRepository: INewsRepository,
    private readonly storageService: IStorageService
  ) {}

  async listPublished(input: { pageSize: number; cursor?: string }) {
    return this.newsRepository.listPublished(input);
  }

  async getPublishedBySlug(slug: string) {
    const news = await this.newsRepository.getPublishedBySlug(slug);
    if (!news) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    return news;
  }

  async listAdmin(input: { pageSize: number; cursor?: string; status?: NewsStatus; category?: string; search?: string }) {
    return this.newsRepository.listAdmin(input);
  }

  async getAdminById(id: string) {
    const news = await this.newsRepository.getById(id);
    if (!news) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    return news;
  }

  async create(input: CreateNewsInput) {
    const slug = await this.generateUniqueSlug(input.title);
    const publishNow = input.status === 'published';

    return this.newsRepository.create({
      title: input.title,
      slug,
      excerpt: input.excerpt ?? '',
      content: input.content,
      category: input.category ?? '',
      tags: input.tags ?? [],
      status: input.status ?? 'draft',
      imagePath: input.imagePath ?? null,
      imageUrl: input.imageUrl ?? null,
      publishedAt: publishNow ? new Date() : null
    });
  }

  async update(id: string, input: UpdateNewsInput) {
    const current = await this.newsRepository.getById(id);
    if (!current) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    const nextSlug = input.title ? await this.generateUniqueSlug(input.title, id) : current.slug;
    const nextStatus = input.status ?? current.status;
    const shouldHavePublishedAt = nextStatus === 'published';
    const nextImagePath = input.imagePath ?? current.imagePath;

    if (current.imagePath && current.imagePath !== nextImagePath) {
      await this.storageService.deleteIfExists(current.imagePath);
    }

    return this.newsRepository.update(id, {
      title: input.title,
      slug: nextSlug,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      tags: input.tags,
      status: nextStatus,
      imagePath: input.imagePath,
      imageUrl: input.imageUrl,
      publishedAt: shouldHavePublishedAt ? current.publishedAt ?? new Date() : null
    });
  }

  async setPublished(id: string, published: boolean) {
    const current = await this.newsRepository.getById(id);
    if (!current) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    return this.newsRepository.update(id, {
      status: published ? 'published' : 'draft',
      publishedAt: published ? current.publishedAt ?? new Date() : null
    });
  }

  async delete(id: string) {
    const current = await this.newsRepository.getById(id);
    if (!current) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    await this.storageService.deleteIfExists(current.imagePath);
    await this.newsRepository.delete(id);
  }

  async uploadImage(input: { id: string; fileName: string; mimeType: string; buffer: Buffer }) {
    const current = await this.newsRepository.getById(input.id);
    if (!current) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    const uploaded = await this.storageService.uploadNewsImage({
      fileName: input.fileName,
      mimeType: input.mimeType,
      buffer: input.buffer,
      previousImagePath: current.imagePath
    });

    return this.newsRepository.update(input.id, {
      imagePath: uploaded.imagePath,
      imageUrl: uploaded.imageUrl
    });
  }

  private async generateUniqueSlug(title: string, currentId?: string): Promise<string> {
    const baseSlug = slugify(title);
    if (!baseSlug) {
      throw new AppError('Invalid title for slug generation', 422, 'INVALID_SLUG_SOURCE');
    }

    let slug = baseSlug;
    let index = 2;

    while (true) {
      const existing = await this.newsRepository.getBySlug(slug);
      if (!existing || existing.id === currentId) {
        return slug;
      }

      slug = `${baseSlug}-${index}`;
      index += 1;
    }
  }
}
