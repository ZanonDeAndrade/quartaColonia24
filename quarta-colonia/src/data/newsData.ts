import * as legacy from './newsData.original';
export * from './newsData.original';


type ApiNewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  status?: string;
  imageUrl?: string | null;
  coverUrl?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ApiNewsResponse = {
  items?: ApiNewsItem[];
};

const API_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3005';

const toDateLabel = (value?: string | null) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const mapApiToLegacy = (item: ApiNewsItem, index: number) => ({
  id: item.id ?? String(index + 1),
  slug: item.slug ?? '',
  title: item.title ?? '',
  excerpt: item.excerpt ?? '',
  content: item.content ?? '',
  category: item.category ?? 'Geral',
  image: item.imageUrl ?? item.coverUrl ?? '',
  publishedAt: item.publishedAt ?? null,
  date: toDateLabel(item.publishedAt),
  tags: Array.isArray(item.tags) ? item.tags : [],
  status: item.status ?? 'published'
});

const getArrayExports = () =>
  Object.entries(legacy).filter(([, value]) => Array.isArray(value)) as Array<[string, any[]]>;

const pickNewsArray = (arrays: Array<[string, any[]]>): [string, any[]] | null => {
  const names = ['newsData', 'news', 'articles', 'posts', 'allNews', 'latestNews'];
  for (const name of names) {
    const found = arrays.find(([key]) => key.toLowerCase() === name.toLowerCase());
    if (found) return found;
  }
  return arrays[0] ?? null;
};

const updateCategoryArrays = (arrays: Array<[string, any[]]>, mappedItems: any[]) => {
  const categories = Array.from(
    new Set(
      mappedItems
        .map((item) => String(item.category || '').trim())
        .filter(Boolean)
    )
  );

  arrays.forEach(([key, arr]) => {
    if (!Array.isArray(arr)) return;
    const lowered = key.toLowerCase();
    if (!lowered.includes('categor')) return;
    arr.splice(0, arr.length, ...categories);
  });
};

const hydrateFromApi = async () => {
  try {
    const response = await fetch(`${API_URL}/api/news`);
    if (!response.ok) return;

    const payload = (await response.json()) as ApiNewsResponse;
    const items = Array.isArray(payload.items) ? payload.items : [];
    const mapped = items.map(mapApiToLegacy);

    const arrays = getArrayExports();
    const newsArrayEntry = pickNewsArray(arrays);
    if (!newsArrayEntry) return;

    const [, targetArray] = newsArrayEntry;
    targetArray.splice(0, targetArray.length, ...mapped);
    updateCategoryArrays(arrays, mapped);
  } catch {
    // Falha de rede/API não deve quebrar o layout original.
  }
};

void hydrateFromApi();
