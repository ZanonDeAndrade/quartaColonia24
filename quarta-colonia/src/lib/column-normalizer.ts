import type { ApiColumnItem, PortalColumnItem } from '../types/column';

type ApiColumnEnvelope = {
  items?: ApiColumnItem[];
  data?: ApiColumnItem[];
  columns?: ApiColumnItem[];
  results?: ApiColumnItem[];
};

export function extractColumnsList(response: ApiColumnEnvelope | ApiColumnItem[]) {
  if (Array.isArray(response)) {
    return response;
  }
  return response.items ?? response.data ?? response.columns ?? response.results ?? [];
}

export function normalizeColumn(item: ApiColumnItem): PortalColumnItem {
  const title = stringValue(item.title) || 'Sem titulo';
  const excerpt = stringValue(item.excerpt) || 'Coluna publicada no portal.';
  const content = stringValue(item.content) || excerpt;
  const authorName = stringValue(item.authorName) || 'Redacao';
  const authorSlug = stringValue(item.authorSlug) || slugify(authorName) || 'autor';
  const imageUrl = stringValue(item.imageUrl) || null;
  const slug = stringValue(item.slug) || slugify(title);
  const id = String(item.id ?? item._id ?? item.uuid ?? slug);

  const rawPublishedAt = stringValue(item.publishedAt) || stringValue(item.createdAt) || null;
  const publishedAt = rawPublishedAt && isValidDate(rawPublishedAt) ? rawPublishedAt : null;

  return {
    id,
    slug,
    title,
    excerpt,
    content,
    authorName,
    authorSlug,
    authorImageUrl: stringValue(item.authorImageUrl) || null,
    imageUrl,
    published: item.published !== false,
    publishedAt
  };
}

function stringValue(value?: string | null) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}
