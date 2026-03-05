import type { FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../../common/errors.js';
import { toISOStringOrNull } from '../../common/time.js';
import type { ColumnEntity } from '../../types/domain.js';
import { ColumnsService } from './columns.service.js';
import {
  adminColumnsListQuerySchema,
  createColumnBodySchema,
  publishColumnBodySchema,
  updateColumnBodySchema
} from './columns.schema.js';

const serializeColumn = (column: ColumnEntity) => ({
  id: column.id,
  title: column.title,
  slug: column.slug,
  excerpt: column.excerpt,
  content: column.content,
  authorName: column.authorName,
  authorSlug: column.authorSlug,
  authorImageUrl: column.authorImageUrl,
  imageUrl: column.imageUrl,
  imagePath: column.imagePath,
  published: column.published,
  publishedAt: toISOStringOrNull(column.publishedAt),
  createdAt: column.createdAt.toISOString(),
  updatedAt: column.updatedAt.toISOString()
});

export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  async listPublished() {
    const items = await this.columnsService.listPublished();
    return { items: items.map(serializeColumn) };
  }

  async getPublishedBySlug(request: FastifyRequest<{ Params: { slug: string } }>) {
    const column = await this.columnsService.getPublishedBySlug(request.params.slug);
    return serializeColumn(column);
  }

  async listAdmin(request: FastifyRequest) {
    try {
      const query = adminColumnsListQuerySchema.parse(request.query);
      const items = await this.columnsService.listAdmin(query);
      return { items: items.map(serializeColumn) };
    } catch (error) {
      this.rethrow(error);
    }
  }

  async getAdminById(request: FastifyRequest<{ Params: { id: string } }>) {
    const column = await this.columnsService.getAdminById(request.params.id);
    return serializeColumn(column);
  }

  async create(request: FastifyRequest) {
    try {
      const body = createColumnBodySchema.parse(request.body);
      const column = await this.columnsService.create(body);
      return serializeColumn(column);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async update(request: FastifyRequest<{ Params: { id: string } }>) {
    try {
      const body = updateColumnBodySchema.parse(request.body);
      const column = await this.columnsService.update(request.params.id, body);
      return serializeColumn(column);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async publish(request: FastifyRequest<{ Params: { id: string } }>) {
    try {
      const body = publishColumnBodySchema.parse(request.body);
      const column = await this.columnsService.setPublished(request.params.id, body.published);
      return serializeColumn(column);
    } catch (error) {
      this.rethrow(error);
    }
  }

  async delete(request: FastifyRequest<{ Params: { id: string } }>) {
    await this.columnsService.delete(request.params.id);
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

    const updated = await this.columnsService.uploadImage({
      id: request.params.id,
      fileName: file.filename,
      mimeType: file.mimetype,
      buffer
    });

    return serializeColumn(updated);
  }

  private rethrow(error: unknown): never {
    if (error instanceof ZodError) {
      throw new AppError('Validation error', 422, 'VALIDATION_ERROR', error.flatten());
    }
    throw error;
  }
}
