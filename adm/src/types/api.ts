export type NewsStatus = 'draft' | 'published';
export type UserRole = 'admin' | 'editor' | 'user';

export interface NewsImageVariant {
  path: string;
  url: string;
  width: number;
}

export interface NewsImageVariants {
  thumbnail: NewsImageVariant;
  card: NewsImageVariant;
  hero: NewsImageVariant;
}

export interface NewsItem {
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
  imageVariants?: NewsImageVariants | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsListResponse {
  items: NewsItem[];
  nextCursor: string | null;
}

export interface AuthUser {
  id: string;
  role: UserRole;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export type AuthMeResponse = AuthUser;

export interface SponsorItem {
  id: string;
  name: string;
  imageUrl: string;
  imagePath: string;
  link: string | null;
  active: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SponsorListResponse {
  items: SponsorItem[];
}

export interface ColumnItem {
  id: string;
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
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnListResponse {
  items: ColumnItem[];
}
