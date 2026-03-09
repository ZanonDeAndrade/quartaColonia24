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
  const rawContent = stringValue(item.content) || stringValue(item.body);
  const rawExcerpt = stringValue(item.excerpt) || stringValue(item.summary);
  const excerpt = isLegacyPlaceholderExcerpt(rawExcerpt) ? buildExcerptFromContent(rawContent) : rawExcerpt;
  const content = rawContent || excerpt;
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

function buildExcerptFromContent(content: string) {
  if (!content) return "";

  const plain = content
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return "";
  if (plain.length <= 180) return plain;
  return `${plain.slice(0, 177).trimEnd()}...`;
}

function isLegacyPlaceholderExcerpt(value: string) {
  if (!value) return true;

  const normalizedValue = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.$/, "");

  return normalizedValue === "materia cadastrada no painel administrativo, pronta para publicacao";
}
