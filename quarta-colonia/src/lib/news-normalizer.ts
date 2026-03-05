import type { ApiNewsItem, PortalNewsItem } from "../types/news";

type ApiNewsEnvelope = {
  items?: ApiNewsItem[];
  data?: ApiNewsItem[];
  news?: ApiNewsItem[];
  results?: ApiNewsItem[];
};

export function extractNewsList(response: ApiNewsEnvelope | ApiNewsItem[]) {
  if (Array.isArray(response)) {
    return response;
  }
  return response.items ?? response.data ?? response.news ?? response.results ?? [];
}

export function normalizeNews(item: ApiNewsItem): PortalNewsItem {
  const title = stringValue(item.title) || stringValue(item.headline) || "Sem titulo";
  const excerpt =
    stringValue(item.excerpt) ||
    stringValue(item.summary) ||
    "Materia cadastrada no painel administrativo, pronta para publicacao.";
  const content = stringValue(item.content) || stringValue(item.body) || excerpt;
  const category = stringValue(item.category) || stringValue(item.section) || "GERAL";
  const author = stringValue(item.author) || stringValue(item.authorName) || "Redacao";
  const imageUrl =
    stringValue(item.imageUrl) ||
    stringValue(item.coverUrl) ||
    stringValue(item.coverImage) ||
    stringValue(item.image) ||
    stringValue(item.thumbnail) ||
    null;

  const slug = stringValue(item.slug) || slugify(title);
  const idValue = item.id ?? item._id ?? item.uuid ?? slug;
  const id = String(idValue);

  const rawPublishedAt =
    stringValue(item.publishedAt) || stringValue(item.publishDate) || stringValue(item.createdAt) || null;
  const publishedAt = rawPublishedAt && isValidDate(rawPublishedAt) ? rawPublishedAt : null;

  return {
    id,
    slug,
    title,
    excerpt,
    content,
    category,
    imageUrl,
    publishedAt,
    author,
  };
}

function stringValue(value?: string | null) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isValidDate(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}
