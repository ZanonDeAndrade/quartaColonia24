import { Link } from "react-router-dom";
import { getCategoryBadgeClass, getCategoryLabel } from "../../lib/category";
import { formatRelativeTime } from "../../lib/date";
import type { PortalNewsItem } from "../../types/news";
import { IconClock, IconImage } from "./icons";

interface MoreNewsProps {
  items: PortalNewsItem[];
  loading?: boolean;
}

export function MoreNews({ items, loading = false }: MoreNewsProps) {
  const list = items.length > 0 ? items : new Array(1).fill(null);

  return (
    <section className="qc-more-news">
      <h2 className="qc-more-title">Mais Noticias</h2>

      <div className="qc-more-list">
        {list.map((item, index) => {
          const previewImage = item ? item.imageVariants.thumbnail ?? item.imageVariants.card ?? item.imageUrl : null;

          return (
            <article key={item?.id ?? `more-${index}`} className="qc-more-item">
              <div className="qc-mini-thumb">
                {previewImage ? (
                  <img
                    className="h-full w-full object-cover"
                    src={previewImage}
                    alt={`Miniatura da noticia ${item?.title ?? "sem titulo"}`}
                    loading="lazy"
                  />
                ) : (
                  <IconImage className="qc-placeholder-icon" />
                )}
              </div>

              <div className="qc-more-copy">
                <span className={getCategoryBadgeClass(item?.category)}>{getCategoryLabel(item?.category)}</span>
                <h3>
                  {item ? (
                    <Link to={`/noticia/${item.slug}`}>{item.title}</Link>
                  ) : loading ? (
                    "Carregando noticias..."
                  ) : (
                    "Cadastre mais noticias no painel administrativo"
                  )}
                </h3>
                <p>
                  <IconClock className="qc-clock-icon" />
                  {item ? formatRelativeTime(item.publishedAt) : "agora"}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
