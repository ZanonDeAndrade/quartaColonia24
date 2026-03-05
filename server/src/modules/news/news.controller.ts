import type { FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../../common/errors.js';
import { toISOStringOrNull } from '../../common/time.js';
import type { NewsEntity } from '../../types/domain.js';
import { NewsService } from './news.service.js';
import {
  adminNewsListQuerySchema,
  createNewsBodySchema,
  publishNewsBodySchema,
  publicNewsListQuerySchema,
  updateNewsBodySchema
} from './news.schemas.js';

const serializeNews = (news: NewsEntity) => ({
  id: news.id,
  title: news.title,
  slug: news.slug,
  excerpt: news.excerpt,
  content: news.content,
  category: news.category,
  tags: news.tags,
  status: news.status,
  imagePath: news.imagePath,
  imageUrl: news.imageUrl,
  publishedAt: toISOStringOrNull(news.publishedAt),
  createdAt: news.createdAt.toISOString(),
  updatedAt: news.updatedAt.toISOString()
});

export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  async listPublished(request: FastifyRequest) {
    try {
      const query = publicNewsListQuerySchema.parse(request.query);
      const result = await this.newsService.listPublished(query);
      return {
        items: result.items.map(serializeNews),
        nextCursor: result.nextCursor
      };
    } catch (error) {
      this.rethrow(error);
    }
  }

  async getPublishedBySlug(request: FastifyRequest<{ Params: { slug: string } }>) {
    const { slug } = request.params;
    const news = await this.newsService.getPublishedBySlug(slug);
    return serializeNews(news);
  }

  async listAdmin(request: FastifyRequest) {
    try {
      const query = adminNewsListQuerySchema.parse(request.query);
      const result = await this.newsService.listAdmin(query);
      return {
        items: result.items.map(serializeNews),
        nextCursor: result.nextCursor
      };
    } catch (error) {
      this.rethrow(error);
    }
  }

  async getAdminById(request: FastifyRequest<{ Params: { id: string } }>) {
    const news = await this.newsService.getAdminById(request.params.id);
    return serializeNews(news);
  }

  async create(request: FastifyRequest) {
    try {
      const body = createNewsBodySchema.parse(request.body);
      const news = await this.newsService.create(body);
      return serializeNews(news);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>) {
    try {
      const body = updateNewsBodySchema.parse(request.body);
      const news = await this.newsService.update(request.params.id, body);
      return serializeNews(news);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async publish(request: FastifyRequest<{ Params: { id: string } }>) {
    try {
      const body = publishNewsBodySchema.parse(request.body);
      const news = await this.newsService.setPublished(request.params.id, body.published);
      return serializeNews(news);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>) {
    await this.newsService.delete(request.params.id);
    return { success: true };
  }

  async uploadImage(
    request: FastifyRequest<{ Params: { id: string } }>,
    acceptedMimeTypes: string[],
    maxBytes: number
  ) {
    const file = await request.file();
    if (!file) {
      throw new AppError('Missing file field "image"', 422, 'IMAGE_FILE_REQUIRED');
    }

    if (!acceptedMimeTypes.includes(file.mimetype)) {
      throw new AppError('Unsupported image format', 422, 'INVALID_IMAGE_TYPE');
    }

    const buffer = await file.toBuffer();
    if (buffer.byteLength > maxBytes) {
      throw new AppError('Image exceeds maximum file size', 413, 'IMAGE_TOO_LARGE');
    }

    const updated = await this.newsService.uploadImage({
      id: request.params.id,
      fileName: file.filename,
      mimeType: file.mimetype,
      buffer
    });

    return serializeNews(updated);
  }

  private rethrow(error: unknown): never {
    if (error instanceof ZodError) {
      throw new AppError('Validation error', 422, 'VALIDATION_ERROR', error.flatten());
    }
    throw error;
  }
}
