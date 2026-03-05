import type { PortalNewsItem } from "../../types/news";
import { NewsCard } from "./NewsCard";

interface NewsGridProps {
  items: PortalNewsItem[];
  loading?: boolean;
}

export function NewsGrid({ items, loading = false }: NewsGridProps) {
  const list = items.length > 0 ? items : new Array(4).fill(null);

  return (
    <section className="qc-cards-grid">
      {list.map((item, index) => (
        <NewsCard key={item?.id ?? `placeholder-${index}`} item={item ?? undefined} loading={loading} />
      ))}
    </section>
  );
}
