import type {
  ColumnEntity,
  NewsEntity,
  NewsStatus,
  PaginationResult,
  RefreshTokenEntity,
  SponsorEntity
} from '../types/domain.js';

export interface ListPublicNewsInput {
  pageSize: number;
  cursor?: string;
}

export interface ListAdminNewsInput {
  pageSize: number;
  cursor?: string;
  status?: NewsStatus;
  category?: string;
  search?: string;
}

export interface CreateNewsInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: NewsStatus;
  imagePath: string | null;
  imageUrl: string | null;
  publishedAt: Date | null;
}

export interface UpdateNewsInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  status?: NewsStatus;
  imagePath?: string | null;
  imageUrl?: string | null;
  publishedAt?: Date | null;
}

export interface INewsRepository {
  listPublished(input: ListPublicNewsInput): Promise<PaginationResult<NewsEntity>>;
  getPublishedBySlug(slug: string): Promise<NewsEntity | null>;
  listAdmin(input: ListAdminNewsInput): Promise<PaginationResult<NewsEntity>>;
  getById(id: string): Promise<NewsEntity | null>;
  getBySlug(slug: string): Promise<NewsEntity | null>;
  create(input: CreateNewsInput): Promise<NewsEntity>;
  update(id: string, input: UpdateNewsInput): Promise<NewsEntity>;
  delete(id: string): Promise<void>;
}

export interface ListAdminColumnsInput {
  published?: boolean;
  search?: string;
}

export interface CreateColumnInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorSlug: string;
  authorImageUrl: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  published: boolean;
  publishedAt: Date | null;
}

export interface UpdateColumnInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  authorName?: string;
  authorSlug?: string;
  authorImageUrl?: string | null;
  imagePath?: string | null;
  imageUrl?: string | null;
  published?: boolean;
  publishedAt?: Date | null;
}

export interface IColumnRepository {
  listPublished(): Promise<ColumnEntity[]>;
  getPublishedBySlug(slug: string): Promise<ColumnEntity | null>;
  listAdmin(input?: ListAdminColumnsInput): Promise<ColumnEntity[]>;
  getById(id: string): Promise<ColumnEntity | null>;
  getBySlug(slug: string): Promise<ColumnEntity | null>;
  create(input: CreateColumnInput): Promise<ColumnEntity>;
  update(id: string, input: UpdateColumnInput): Promise<ColumnEntity>;
  delete(id: string): Promise<void>;
}

export interface ListSponsorsInput {
  active?: boolean;
}

export interface CreateSponsorInput {
  name: string;
  imageUrl: string;
  imagePath: string;
  link: string | null;
  active: boolean;
  order: number;
}

export interface UpdateSponsorInput {
  name?: string;
  imageUrl?: string;
  imagePath?: string;
  link?: string | null;
  active?: boolean;
  order?: number;
}

export interface ISponsorRepository {
  list(input?: ListSponsorsInput): Promise<SponsorEntity[]>;
  getById(id: string): Promise<SponsorEntity | null>;
  create(input: CreateSponsorInput): Promise<SponsorEntity>;
  update(id: string, input: UpdateSponsorInput): Promise<SponsorEntity>;
  delete(id: string): Promise<void>;
}

export interface IRefreshTokenRepository {
  save(token: RefreshTokenEntity): Promise<void>;
  getByHash(tokenHash: string): Promise<RefreshTokenEntity | null>;
  deleteByHash(tokenHash: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

export interface UploadResult {
  imagePath: string;
  imageUrl: string;
}

export interface IStorageService {
  uploadNewsImage(input: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    previousImagePath?: string | null;
  }): Promise<UploadResult>;
  uploadSponsorImage(input: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    previousImagePath?: string | null;
  }): Promise<UploadResult>;
  uploadColumnImage(input: {
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    previousImagePath?: string | null;
  }): Promise<UploadResult>;
  deleteIfExists(path: string | null | undefined): Promise<void>;
}
