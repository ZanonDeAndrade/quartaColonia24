import { AppError } from '../../common/errors.js';
import { slugify } from '../../common/slug.js';
import type { IColumnRepository, IStorageService } from '../../contracts/repositories.js';

interface CreateColumnInput {
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorImageUrl?: string;
  published?: boolean;
}

interface UpdateColumnInput {
  title?: string;
  excerpt?: string;
  content?: string;
  authorName?: string;
  authorImageUrl?: string;
  published?: boolean;
  imagePath?: string | null;
  imageUrl?: string | null;
}

const sanitizeHtmlContent = (value: string): string =>
  value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');

export class ColumnsService {
  constructor(
    private readonly columnsRepository: IColumnRepository,
    private readonly storageService: IStorageService
  ) {}

  async listPublished() {
    return this.columnsRepository.listPublished();
  }

  async getPublishedBySlug(slug: string) {
    const column = await this.columnsRepository.getPublishedBySlug(slug);
    if (!column) {
      throw new AppError('Column not found', 404, 'COLUMN_NOT_FOUND');
    }

    return column;
  }

  async listAdmin(input?: { published?: boolean; search?: string }) {
    return this.columnsRepository.listAdmin(input);
  }

  async getAdminById(id: string) {
    const column = await this.columnsRepository.getById(id);
    if (!column) {
      throw new AppError('Column not found', 404, 'COLUMN_NOT_FOUND');
    }

    return column;
  }

  async create(input: CreateColumnInput) {
    const slug = await this.generateUniqueSlug(input.title);
    const authorSlug = this.generateAuthorSlug(input.authorName);
    const shouldPublish = input.published === true;

    return this.columnsRepository.create({
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: sanitizeHtmlContent(input.content),
      authorName: input.authorName,
      authorSlug,
      authorImageUrl: input.authorImageUrl?.trim() || null,
      imagePath: null,
      imageUrl: null,
      published: shouldPublish,
      publishedAt: shouldPublish ? new Date() : null
    });
  }

  async update(id: string, input: UpdateColumnInput) {
    const current = await this.columnsRepository.getById(id);
    if (!current) {
      throw new AppError('Column not found', 404, 'COLUMN_NOT_FOUND');
    }

    const nextSlug = input.title ? await this.generateUniqueSlug(input.title, id) : current.slug;
    const nextAuthorName = input.authorName ?? current.authorName;
    const nextAuthorSlug = this.generateAuthorSlug(nextAuthorName);
    const nextImagePath = input.imagePath ?? current.imagePath;

    if (current.imagePath && current.imagePath !== nextImagePath) {
      await this.storageService.deleteIfExists(current.imagePath);
    }

    const nextPublished = typeof input.published === 'boolean' ? input.published : current.published;
    const nextPublishedAt =
      typeof input.published === 'boolean'
        ? input.published
          ? current.publishedAt ?? new Date()
          : null
        : current.publishedAt;

    return this.columnsRepository.update(id, {
      title: input.title,
      slug: nextSlug,
      excerpt: input.excerpt,
      content: input.content ? sanitizeHtmlContent(input.content) : undefined,
      authorName: input.authorName,
      authorSlug: nextAuthorSlug,
      authorImageUrl:
        typeof input.authorImageUrl === 'string' ? input.authorImageUrl.trim() || null : input.authorImageUrl,
      imagePath: input.imagePath,
      imageUrl: input.imageUrl,
      published: nextPublished,
      publishedAt: nextPublishedAt
    });
  }

  async setPublished(id: string, published: boolean) {
    const current = await this.columnsRepository.getById(id);
    if (!current) {
      throw new AppError('Column not found', 404, 'COLUMN_NOT_FOUND');
    }

    return this.columnsRepository.update(id, {
      published,
      publishedAt: published ? new Date() : null
    });
  }

  async delete(id: string) {
    const current = await this.columnsRepository.getById(id);
    if (!current) {
      throw new AppError('Column not found', 404, 'COLUMN_NOT_FOUND');
    }

    await this.storageService.deleteIfExists(current.imagePath);
    await this.columnsRepository.delete(id);
  }

  async uploadImage(input: { id: string; fileName: string; mimeType: string; buffer: Buffer }) {
    const current = await this.columnsRepository.getById(input.id);
    if (!current) {
      throw new AppError('Column not found', 404, 'COLUMN_NOT_FOUND');
    }

    const uploaded = await this.storageService.uploadColumnImage({
      fileName: input.fileName,
      mimeType: input.mimeType,
      buffer: input.buffer,
      previousImagePath: current.imagePath
    });

    return this.columnsRepository.update(input.id, {
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
      const existing = await this.columnsRepository.getBySlug(slug);
      if (!existing || existing.id === currentId) {
        return slug;
      }

      slug = `${baseSlug}-${index}`;
      index += 1;
    }
  }

  private generateAuthorSlug(authorName: string): string {
    const authorSlug = slugify(authorName);
    if (!authorSlug) {
      throw new AppError('Invalid author name for slug generation', 422, 'INVALID_AUTHOR_SLUG_SOURCE');
    }
    return authorSlug;
  }
}
