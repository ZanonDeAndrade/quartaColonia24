import type { FastifyBaseLogger } from 'fastify';
import { customAlphabet } from 'nanoid';
import LRUCache from 'lru-cache';
import { AppError } from '../../common/errors.js';
import { removeUndefined } from '../../common/remove-undefined.js';
import { slugify } from '../../common/slug.js';
import type { INewsRepository, IStorageService, UploadResult } from '../../contracts/repositories.js';
import type { NewsEntity, NewsImageVariants, NewsStatus } from '../../types/domain.js';

const slugSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 4);
const PUBLIC_NEWS_CACHE_TTL_MS = 60_000;

interface CreateNewsInput {
  title: string;
  slug?: string;
  excerpt?: string;
  summary?: string;
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
  summary?: string;
  content?: string;
  category?: string;
  tags?: string[];
  status?: NewsStatus;
  imagePath?: string | null;
  imageUrl?: string | null;
  imageVariants?: NewsImageVariants | null;
}

interface NewsOperationContext {
  logger?: FastifyBaseLogger;
  requestId?: string;
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
    const news = await this.newsRepository.findById(id);
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

  async findBySlug(slug: string) {
    return this.newsRepository.findBySlug(slug);
  }

  async listAdmin(input: { pageSize: number; cursor?: string; status?: NewsStatus; category?: string; search?: string }) {
    return this.newsRepository.listAdmin(input);
  }

  async getAdminById(id: string) {
    const news = await this.newsRepository.findById(id);
    if (!news) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    return news;
  }

  async create(input: CreateNewsInput, context: NewsOperationContext = {}) {
    const excerpt = input.excerpt ?? input.summary ?? '';
    const slugSource = input.slug?.trim() || input.title;
    this.logInfo(context, 'news.create.validatedPayload', { payload: input });

    const slug = await this.generateUniqueSlug(slugSource);
    this.logInfo(context, 'news.create.generatedSlug', { slug, slugSource });

    const publishNow = input.status === 'published';
    const createPayload = removeUndefined({
      title: input.title,
      slug,
      excerpt,
      content: input.content,
      category: input.category ?? '',
      tags: input.tags ?? [],
      status: input.status ?? 'draft',
      imagePath: input.imagePath ?? null,
      imageUrl: input.imageUrl ?? null,
      imageVariants: null,
      publishedAt: publishNow ? new Date() : null
    });

    this.logInfo(context, 'news.create.sanitizedFirestorePayload', { payload: createPayload });

    try {
      const created = await this.newsRepository.create(createPayload);
      this.invalidatePublicNewsCache();
      return created;
    } catch (error) {
      const createdImagePath = typeof createPayload.imagePath === 'string' ? createPayload.imagePath : null;
      if (createdImagePath) {
        await this.safeDeletePaths([createdImagePath], context, 'news.create.rollbackImage');
      }

      this.logError(context, 'news.create.failed', {
        payload: createPayload,
        error: this.serializeError(error)
      });
      throw error;
    }
  }

  async update(id: string, input: UpdateNewsInput, context: NewsOperationContext = {}) {
    const current = await this.newsRepository.findById(id);
    if (!current) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    this.logInfo(context, 'news.update.validatedPayload', {
      id,
      payload: input
    });

    const nextSlug = await this.resolveNextSlug(input, current.slug, id);
    this.logInfo(context, 'news.update.generatedSlug', { id, slug: nextSlug });

    const nextStatus = input.status ?? current.status;
    const shouldHavePublishedAt = nextStatus === 'published';
    const nextImagePath = input.imagePath === undefined ? current.imagePath : input.imagePath;
    const nextImageUrl = input.imageUrl === undefined ? current.imageUrl : input.imageUrl;
    const nextImageVariants =
      input.imageVariants === undefined
        ? nextImagePath
          ? current.imageVariants
          : null
        : input.imageVariants;

    const updatePayload = removeUndefined({
      title: input.title,
      slug: nextSlug,
      excerpt: input.excerpt ?? input.summary,
      content: input.content,
      category: input.category,
      tags: input.tags,
      status: nextStatus,
      imagePath: nextImagePath,
      imageUrl: nextImageUrl,
      imageVariants: nextImageVariants,
      publishedAt: shouldHavePublishedAt ? current.publishedAt ?? new Date() : null
    });

    this.logInfo(context, 'news.update.sanitizedFirestorePayload', {
      id,
      payload: updatePayload
    });

    const currentPaths = this.collectNewsImagePaths(current);
    const nextPaths = this.collectImagePathsFromPayload(nextImagePath, nextImageVariants);
    const newlyIntroducedPaths = nextPaths.filter((path) => !currentPaths.includes(path));

    try {
      const updated = await this.newsRepository.update(id, updatePayload);
      this.invalidatePublicNewsCache();

      if (newlyIntroducedPaths.length > 0) {
        const oldPaths = currentPaths.filter((path) => !nextPaths.includes(path));
        await this.safeDeletePaths(oldPaths, context, 'news.update.deletePreviousImage');
      }

      return updated;
    } catch (error) {
      if (newlyIntroducedPaths.length > 0) {
        await this.safeDeletePaths(newlyIntroducedPaths, context, 'news.update.rollbackNewImage');
      }

      this.logError(context, 'news.update.failed', {
        id,
        payload: updatePayload,
        error: this.serializeError(error)
      });
      throw error;
    }
  }

  async setPublished(id: string, published: boolean, context: NewsOperationContext = {}) {
    const current = await this.newsRepository.findById(id);
    if (!current) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    const payload = removeUndefined({
      status: (published ? 'published' : 'draft') as NewsStatus,
      publishedAt: published ? current.publishedAt ?? new Date() : null
    });

    this.logInfo(context, 'news.publish.sanitizedFirestorePayload', { id, payload });

    try {
      const updated = await this.newsRepository.update(id, payload);
      this.invalidatePublicNewsCache();
      return updated;
    } catch (error) {
      this.logError(context, 'news.publish.failed', {
        id,
        payload,
        error: this.serializeError(error)
      });
      throw error;
    }
  }

  async delete(id: string, context: NewsOperationContext = {}) {
    const current = await this.newsRepository.findById(id);
    if (!current) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    await this.newsRepository.delete(id);
    await this.safeDeletePaths(this.collectNewsImagePaths(current), context, 'news.delete.cleanupImage');
    this.invalidatePublicNewsCache();
  }

  async uploadImage(
    input: { id: string; fileName: string; mimeType: string; buffer: Buffer },
    context: NewsOperationContext = {}
  ) {
    const current = await this.newsRepository.findById(input.id);
    if (!current) {
      throw new AppError('News not found', 404, 'NEWS_NOT_FOUND');
    }

    const currentPaths = this.collectNewsImagePaths(current);
    const uploaded = await this.storageService.uploadNewsImage({
      fileName: input.fileName,
      mimeType: input.mimeType,
      buffer: input.buffer
    });
    const uploadedPaths = this.collectPathsFromUpload(uploaded);

    const updatePayload = removeUndefined({
      imagePath: uploaded.imagePath,
      imageUrl: uploaded.imageUrl,
      imageVariants: uploaded.imageVariants ?? null
    });

    this.logInfo(context, 'news.uploadImage.sanitizedFirestorePayload', {
      id: input.id,
      payload: updatePayload
    });

    try {
      const updated = await this.newsRepository.update(input.id, updatePayload);
      this.invalidatePublicNewsCache();

      const previousPathsToDelete = currentPaths.filter((path) => !uploadedPaths.includes(path));
      await this.safeDeletePaths(previousPathsToDelete, context, 'news.uploadImage.deletePrevious');
      return updated;
    } catch (error) {
      await this.safeDeletePaths(uploadedPaths, context, 'news.uploadImage.rollbackNew');
      this.logError(context, 'news.uploadImage.failed', {
        id: input.id,
        payload: updatePayload,
        error: this.serializeError(error)
      });
      throw error;
    }
  }

  private async resolveNextSlug(input: UpdateNewsInput, currentSlug: string, currentId: string) {
    const slugSource = input.slug?.trim() || input.title?.trim();
    if (!slugSource) {
      return currentSlug;
    }

    return this.generateUniqueSlug(slugSource, currentId);
  }

  private async generateUniqueSlug(source: string, currentId?: string): Promise<string> {
    const baseSlug = slugify(source);
    if (!baseSlug) {
      throw new AppError('Invalid title for slug generation', 422, 'INVALID_SLUG_SOURCE');
    }

    let slug = baseSlug;

    while (true) {
      const existing = await this.newsRepository.findBySlug(slug);
      if (!existing || existing.id === currentId) {
        return slug;
      }

      slug = `${baseSlug}-${slugSuffix()}`;
    }
  }

  private collectNewsImagePaths(news: Pick<NewsEntity, 'imagePath' | 'imageVariants'>) {
    return this.collectImagePathsFromPayload(news.imagePath, news.imageVariants);
  }

  private collectImagePathsFromPayload(imagePath: string | null | undefined, imageVariants: NewsImageVariants | null | undefined) {
    const paths = new Set<string>();
    if (imagePath) paths.add(imagePath);
    if (imageVariants) {
      paths.add(imageVariants.thumbnail.path);
      paths.add(imageVariants.card.path);
      paths.add(imageVariants.hero.path);
    }

    return [...paths];
  }

  private collectPathsFromUpload(uploaded: UploadResult) {
    return this.collectImagePathsFromPayload(uploaded.imagePath, uploaded.imageVariants ?? null);
  }

  private buildPublicListCacheKey(input: { pageSize: number; cursor?: string }) {
    return `${input.pageSize}:${input.cursor ?? ''}`;
  }

  private invalidatePublicNewsCache() {
    this.publicNewsCache.reset();
  }

  private async safeDeletePaths(paths: string[], context: NewsOperationContext, event: string) {
    const uniquePaths = [...new Set(paths.filter(Boolean))];
    if (uniquePaths.length === 0) return;

    await Promise.all(
      uniquePaths.map(async (path) => {
        try {
          await this.storageService.deleteIfExists(path);
        } catch (error) {
          this.logError(context, `${event}.failed`, {
            path,
            error: this.serializeError(error)
          });
        }
      })
    );
  }

  private logInfo(context: NewsOperationContext, event: string, details: Record<string, unknown>) {
    context.logger?.info(
      {
        event,
        requestId: context.requestId,
        ...details
      },
      event
    );
  }

  private logError(context: NewsOperationContext, event: string, details: Record<string, unknown>) {
    context.logger?.error(
      {
        event,
        requestId: context.requestId,
        ...details
      },
      event
    );
  }

  private serializeError(error: unknown) {
    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack
      };
    }

    return {
      message: String(error)
    };
  }
}
