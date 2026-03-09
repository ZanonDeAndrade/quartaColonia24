import { randomUUID } from 'node:crypto';
import type {
  CreateColumnInput,
  CreateSponsorInput,
  CreateNewsInput,
  IColumnRepository,
  INewsRepository,
  IRefreshTokenRepository,
  ISponsorRepository,
  ListAdminColumnsInput,
  ListAdminNewsInput,
  ListPublicNewsInput,
  ListSponsorsInput,
  UpdateColumnInput,
  UpdateSponsorInput,
  UpdateNewsInput
} from '../contracts/repositories.js';
import type { ColumnEntity, NewsEntity, PaginationResult, RefreshTokenEntity, SponsorEntity } from '../types/domain.js';

export class InMemoryNewsRepository implements INewsRepository {
  private readonly items = new Map<string, NewsEntity>();

  async listPublished(input: ListPublicNewsInput): Promise<PaginationResult<NewsEntity>> {
    const ordered = [...this.items.values()]
      .filter((item) => item.status === 'published')
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));

    const startIndex = input.cursor ? ordered.findIndex((item) => item.id === input.cursor) + 1 : 0;
    const items = ordered.slice(Math.max(startIndex, 0), Math.max(startIndex, 0) + input.pageSize);
    const nextCursor = items.length === input.pageSize ? items[items.length - 1].id : null;
    return { items, nextCursor };
  }

  async getPublishedBySlug(slug: string): Promise<NewsEntity | null> {
    return [...this.items.values()].find((item) => item.slug === slug && item.status === 'published') ?? null;
  }

  async listPublishedForSitemap(): Promise<Array<Pick<NewsEntity, 'slug' | 'updatedAt' | 'publishedAt'>>> {
    return [...this.items.values()]
      .filter((item) => item.status === 'published')
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0))
      .map((item) => ({
        slug: item.slug,
        updatedAt: item.updatedAt,
        publishedAt: item.publishedAt
      }));
  }

  async listAdmin(input: ListAdminNewsInput): Promise<PaginationResult<NewsEntity>> {
    let items = [...this.items.values()].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    if (input.status) items = items.filter((item) => item.status === input.status);
    if (input.category) items = items.filter((item) => item.category === input.category);
    if (input.search) {
      const term = input.search.toLowerCase();
      items = items.filter((item) =>
        [item.title, item.excerpt, item.content, item.slug, item.category].join(' ').toLowerCase().includes(term)
      );
    }

    const startIndex = input.cursor ? items.findIndex((item) => item.id === input.cursor) + 1 : 0;
    const paged = items.slice(Math.max(startIndex, 0), Math.max(startIndex, 0) + input.pageSize);
    const nextCursor = paged.length === input.pageSize ? paged[paged.length - 1].id : null;
    return { items: paged, nextCursor };
  }

  async getById(id: string): Promise<NewsEntity | null> {
    return this.items.get(id) ?? null;
  }

  async getBySlug(slug: string): Promise<NewsEntity | null> {
    return [...this.items.values()].find((item) => item.slug === slug) ?? null;
  }

  async create(input: CreateNewsInput): Promise<NewsEntity> {
    const now = new Date();
    const id = randomUUID();
    const entity: NewsEntity = {
      id,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      tags: input.tags,
      status: input.status,
      imagePath: input.imagePath,
      imageUrl: input.imageUrl,
      imageVariants: input.imageVariants,
      publishedAt: input.publishedAt,
      createdAt: now,
      updatedAt: now
    };

    this.items.set(id, entity);
    return entity;
  }

  async update(id: string, input: UpdateNewsInput): Promise<NewsEntity> {
    const current = this.items.get(id);
    if (!current) {
      throw new Error('News not found');
    }

    const updated: NewsEntity = {
      ...current,
      ...input,
      updatedAt: new Date()
    };
    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}

export class InMemoryRefreshTokenRepository implements IRefreshTokenRepository {
  private readonly tokens = new Map<string, RefreshTokenEntity>();

  async save(token: RefreshTokenEntity): Promise<void> {
    this.tokens.set(token.tokenHash, token);
  }

  async getByHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    return this.tokens.get(tokenHash) ?? null;
  }

  async deleteByHash(tokenHash: string): Promise<void> {
    this.tokens.delete(tokenHash);
  }

  async deleteByUserId(userId: string): Promise<void> {
    for (const [hash, token] of this.tokens.entries()) {
      if (token.userId === userId) {
        this.tokens.delete(hash);
      }
    }
  }
}

export class InMemorySponsorsRepository implements ISponsorRepository {
  private readonly items = new Map<string, SponsorEntity>();

  async list(input?: ListSponsorsInput): Promise<SponsorEntity[]> {
    let items = [...this.items.values()];

    if (typeof input?.active === 'boolean') {
      items = items.filter((item) => item.active === input.active);
    }

    items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    return items;
  }

  async getById(id: string): Promise<SponsorEntity | null> {
    return this.items.get(id) ?? null;
  }

  async create(input: CreateSponsorInput): Promise<SponsorEntity> {
    const id = randomUUID();
    const now = new Date();
    const entity: SponsorEntity = {
      id,
      name: input.name,
      imageUrl: input.imageUrl,
      imagePath: input.imagePath,
      link: input.link,
      active: input.active,
      order: input.order,
      createdAt: now,
      updatedAt: now
    };

    this.items.set(id, entity);
    return entity;
  }

  async update(id: string, input: UpdateSponsorInput): Promise<SponsorEntity> {
    const current = this.items.get(id);
    if (!current) {
      throw new Error('Sponsor not found');
    }

    const updated: SponsorEntity = {
      ...current,
      ...input,
      updatedAt: new Date()
    };

    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}

export class InMemoryColumnsRepository implements IColumnRepository {
  private readonly items = new Map<string, ColumnEntity>();

  async listPublished(): Promise<ColumnEntity[]> {
    return [...this.items.values()]
      .filter((item) => item.published)
      .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  }

  async getPublishedBySlug(slug: string): Promise<ColumnEntity | null> {
    return [...this.items.values()].find((item) => item.slug === slug && item.published) ?? null;
  }

  async listAdmin(input?: ListAdminColumnsInput): Promise<ColumnEntity[]> {
    let items = [...this.items.values()];

    if (typeof input?.published === 'boolean') {
      items = items.filter((item) => item.published === input.published);
    }

    if (input?.search) {
      const term = input.search.toLowerCase();
      items = items.filter((item) =>
        [item.title, item.excerpt, item.content, item.authorName, item.slug].join(' ').toLowerCase().includes(term)
      );
    }

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getById(id: string): Promise<ColumnEntity | null> {
    return this.items.get(id) ?? null;
  }

  async getBySlug(slug: string): Promise<ColumnEntity | null> {
    return [...this.items.values()].find((item) => item.slug === slug) ?? null;
  }

  async create(input: CreateColumnInput): Promise<ColumnEntity> {
    const id = randomUUID();
    const now = new Date();
    const entity: ColumnEntity = {
      id,
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      authorName: input.authorName,
      authorSlug: input.authorSlug,
      authorImageUrl: input.authorImageUrl,
      imagePath: input.imagePath,
      imageUrl: input.imageUrl,
      published: input.published,
      publishedAt: input.publishedAt,
      createdAt: now,
      updatedAt: now
    };

    this.items.set(id, entity);
    return entity;
  }

  async update(id: string, input: UpdateColumnInput): Promise<ColumnEntity> {
    const current = this.items.get(id);
    if (!current) {
      throw new Error('Column not found');
    }

    const updated: ColumnEntity = {
      ...current,
      ...input,
      updatedAt: new Date()
    };

    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}
