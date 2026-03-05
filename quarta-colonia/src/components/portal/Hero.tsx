import { Link } from "react-router-dom";
import { getCategoryBadgeClass, getCategoryLabel } from "../../lib/category";
import { formatRelativeTime } from "../../lib/date";
import type { PortalNewsItem } from "../../types/news";
import heroCity from "../../assets/hero-city.jpg";

interface HeroProps {
  news: PortalNewsItem | null;
  loading?: boolean;
}

export function Hero({ news, loading = false }: HeroProps) {
  const hasNews = Boolean(news);
  const cover = news?.imageUrl || heroCity;
  const title = news?.title || "Prefeitura anuncia nova praca no centro da cidade com investimento de R$ 2 milhoes";
  const excerpt =
    news?.excerpt ||
    "O projeto inclui area verde, playground e espaco para eventos culturais. Obras devem comecar no proximo mes.";
  const categoryClass = getCategoryBadgeClass(news?.category);
  const categoryLabel = getCategoryLabel(news?.category);
  const time = formatRelativeTime(news?.publishedAt);
  const author = news?.author || "Redacao";

  return (
    <article className="qc-hero-card" style={{ backgroundImage: `url(${cover})` }}>
      <div className="qc-hero-overlay" />

      <div className="qc-hero-content">
        <div className="qc-hero-tags">
          <span className="qc-hero-hot">ULTIMA HORA</span>
          <span className={categoryClass}>{categoryLabel}</span>
        </div>

        <h1 className="qc-hero-title">{title}</h1>
        <p className="qc-hero-excerpt">{excerpt}</p>
        <div className="qc-hero-meta">
          <span>{author}</span>
          <span>•</span>
          <span>{time}</span>
        </div>

        {hasNews ? (
          <Link to={`/noticia/${news?.slug}`} className="qc-hero-link">
            Ler noticia
          </Link>
        ) : (
          <button type="button" disabled className="qc-hero-link">
            {loading ? "Carregando..." : "Portal ativo"}
          </button>
        )}
      </div>
    </article>
  );
}
