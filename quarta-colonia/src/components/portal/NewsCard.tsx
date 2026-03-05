import { Link } from "react-router-dom";
import { getCategoryBadgeClass, getCategoryLabel } from "../../lib/category";
import { formatRelativeTime } from "../../lib/date";
import type { PortalNewsItem } from "../../types/news";
import { IconClock, IconImage } from "./icons";

interface NewsCardProps {
  item?: PortalNewsItem;
  loading?: boolean;
}

export function NewsCard({ item, loading = false }: NewsCardProps) {
  if (!item) {
    return (
      <article className="qc-news-card">
        <div className="qc-news-image">
          <div className="qc-image-placeholder">
            <IconImage className="qc-placeholder-icon" />
          </div>
        </div>
        <div className="qc-news-body">
          <span className="qc-category-badge qc-badge-geral">GERAL</span>
          <h3 className="qc-card-title">{loading ? "Carregando noticia..." : "Sem conteudo disponivel"}</h3>
          <p className="qc-card-excerpt">
            {loading
              ? "Buscando noticias cadastradas no backend."
              : "Cadastre materias no painel administrativo para exibir aqui."}
          </p>
          <div className="qc-card-meta">
            <span>Redacao</span>
            <span className="qc-meta-clock">
              <IconClock className="qc-clock-icon" />
              agora
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="qc-news-card">
      <div className="qc-news-image">
        {item.imageUrl ? (
          <img className="h-full w-full object-cover" src={item.imageUrl} alt={`Imagem da noticia ${item.title}`} loading="lazy" />
        ) : (
          <div className="qc-image-placeholder">
            <IconImage className="qc-placeholder-icon" />
          </div>
        )}
      </div>

      <div className="qc-news-body">
        <span className={getCategoryBadgeClass(item.category)}>{getCategoryLabel(item.category)}</span>

        <h3 className="qc-card-title">
          <Link to={`/noticia/${item.slug}`}>{item.title}</Link>
        </h3>

        <p className="qc-card-excerpt">{item.excerpt}</p>

        <div className="qc-card-meta">
          <span>{item.author || "Redacao"}</span>
          <span className="qc-meta-clock">
            <IconClock className="qc-clock-icon" />
            {formatRelativeTime(item.publishedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}
