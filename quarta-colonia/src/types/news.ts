export interface ApiNewsItem {
  id?: string | number;
  _id?: string;
  uuid?: string;
  title?: string | null;
  headline?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  summary?: string | null;
  content?: string | null;
  body?: string | null;
  category?: string | null;
  section?: string | null;
  tags?: string[] | null;
  status?: "draft" | "published" | string;
  imagePath?: string | null;
  imageUrl?: string | null;
  coverUrl?: string | null;
  coverImage?: string | null;
  image?: string | null;
  thumbnail?: string | null;
  author?: string | null;
  authorName?: string | null;
  publishedAt?: string | null;
  publishDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PortalNewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string | null;
  publishedAt: string | null;
  author: string;
}
