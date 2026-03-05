export type UserRole = 'admin' | 'editor' | 'user';
export type NewsStatus = 'draft' | 'published';

export interface NewsEntity {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface SponsorEntity {
  id: string;
  name: string;
  imageUrl: string;
  imagePath: string;
  link: string | null;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColumnEntity {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorSlug: string;
  authorImageUrl: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenEntity {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

export interface PaginationResult<T> {
  items: T[];
  nextCursor: string | null;
}
