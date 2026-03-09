import { AppError } from '../../common/errors.js';
import { slugify } from '../../common/slug.js';
import type { INewsRepository, IStorageService } from '../../contracts/repositories.js';
import type { NewsEntity, NewsImageVariants, NewsStatus } from '../../types/domain.js';
import { customAlphabet } from 'nanoid';
import LRUCache from 'lru-cache';

const slugSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 4);
const PUBLIC_NEWS_CACHE_TTL_MS = 60_000;

interface CreateNewsInput {
  title: string;
  slug?: string;
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
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  status?: NewsStatus;
  imagePath?: string | null;
  imageUrl?: string | null;
  imageVariants?: NewsImageVariants | null;
}

export class NewsService {
  private readonly publicNewsCache = new LRUCache<string, Awaited<ReturnType<INewsRepository['listPublished']>>>({
    max: 100,
    maxAge: PUBLIC_NEWS_CACHE_TTL_MS
  });

  constructor(
    private readonly newsRepository: INewsRepository,
    private readonly storageService: IStorageService
  ) {}

  async listPublished(input: { pageSize: number; cursor?: string }) {
    const cacheKey = this.buildPublicListCacheKey(input);
    const cached = this.publicNewsCache.get(cacheKey);
    if (cached) return cached;

    const fresh = await this.newsRepository.listPublished(input);
    this.publicNewsCache.set(cacheKey, fresh);
    return fresh;
  }

  async listPublishedForSitemap() {
    return this.newsRepository.listPublishedForSitemap();
  }

  async getPublishedById(id: string) {
    const news = await this.newsRepository.getById(id);
    if (!news || news.status !== 'published') {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    return news;
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
    const slug = await this.generateUniqueSlug(input.slug ?? input.title);
    const publishNow = input.status === 'published';
    const created = await this.newsRepository.create({
      title: input.title,
      slug,
      excerpt: input.excerpt ?? '',
      content: input.content,
      category: input.category ?? '',
      tags: input.tags ?? [],
      status: input.status ?? 'draft',
      imagePath: input.imagePath ?? null,
      imageUrl: input.imageUrl ?? null,
      imageVariants: null,
      publishedAt: publishNow ? new Date() : null
    });

    this.invalidatePublicNewsCache();
    return created;
  }

  async update(id: string, input: UpdateNewsInput) {
    const current = await this.newsRepository.getById(id);
    if (!current) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    const nextSlug =
      typeof input.slug === 'string' ? await this.generateUniqueSlug(input.slug, id) : current.slug;
    const nextStatus = input.status ?? current.status;
    const shouldHavePublishedAt = nextStatus === 'published';
    const nextImagePath = input.imagePath ?? current.imagePath;
    const nextImageVariants = input.imageVariants === undefined ? current.imageVariants : input.imageVariants;

    if (current.imagePath && current.imagePath !== nextImagePath) {
      await this.deleteNewsImageAssets(current);
    }

    const updated = await this.newsRepository.update(id, {
      title: input.title,
      slug: nextSlug,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      tags: input.tags,
      status: nextStatus,
      imagePath: input.imagePath,
      imageUrl: input.imageUrl,
      imageVariants: nextImageVariants,
      publishedAt: shouldHavePublishedAt ? current.publishedAt ?? new Date() : null
    });

    this.invalidatePublicNewsCache();
    return updated;
  }

  async setPublished(id: string, published: boolean) {
    const current = await this.newsRepository.getById(id);
    if (!current) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    const updated = await this.newsRepository.update(id, {
      status: published ? 'published' : 'draft',
      publishedAt: published ? current.publishedAt ?? new Date() : null
    });

    this.invalidatePublicNewsCache();
    return updated;
  }

  async delete(id: string) {
    const current = await this.newsRepository.getById(id);
    if (!current) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    await this.deleteNewsImageAssets(current);
    await this.newsRepository.delete(id);
    this.invalidatePublicNewsCache();
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
      previousImagePath: current.imagePath,
      previousImagePaths: this.collectNewsImagePaths(current)
    });

    const updated = await this.newsRepository.update(input.id, {
      imagePath: uploaded.imagePath,
      imageUrl: uploaded.imageUrl,
      imageVariants: uploaded.imageVariants ?? null
    });

    this.invalidatePublicNewsCache();
    return updated;
  }

  private async generateUniqueSlug(source: string, currentId?: string): Promise<string> {
    const baseSlug = slugify(source);
    if (!baseSlug) {
      throw new AppError('Invalid title for slug generation', 422, 'INVALID_SLUG_SOURCE');
    }

    let slug = baseSlug;

    while (true) {
      const existing = await this.newsRepository.getBySlug(slug);
      if (!existing || existing.id === currentId) {
        return slug;
      }

      slug = `${baseSlug}-${slugSuffix()}`;
    }
  }

  private buildPublicListCacheKey(input: { pageSize: number; cursor?: string }) {
    return `${input.pageSize}:${input.cursor ?? ''}`;
  }

  private invalidatePublicNewsCache() {
    this.publicNewsCache.reset();
  }

  private collectNewsImagePaths(news: Pick<NewsEntity, 'imagePath' | 'imageVariants'>) {
    const paths = new Set<string>();

    if (news.imagePath) paths.add(news.imagePath);
    if (news.imageVariants) {
      paths.add(news.imageVariants.thumbnail.path);
      paths.add(news.imageVariants.card.path);
      paths.add(news.imageVariants.hero.path);
    }

    return [...paths];
  }

  private async deleteNewsImageAssets(news: Pick<NewsEntity, 'imagePath' | 'imageVariants'>) {
    const paths = this.collectNewsImagePaths(news);
    await Promise.all(paths.map((path) => this.storageService.deleteIfExists(path)));
  }
}
