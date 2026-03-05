export interface ApiColumnItem {
  id?: string | number;
  _id?: string;
  uuid?: string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  authorName?: string | null;
  authorSlug?: string | null;
  authorImageUrl?: string | null;
  imageUrl?: string | null;
  imagePath?: string | null;
  published?: boolean;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PortalColumnItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  authorSlug: string;
  authorImageUrl: string | null;
  imageUrl: string | null;
  published: boolean;
  publishedAt: string | null;
}
