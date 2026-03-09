import { Link } from "react-router-dom";
import { getCategoryBadgeClass, getCategoryLabel } from "../../lib/category";
import { formatRelativeTime } from "../../lib/date";
import type { PortalNewsItem } from "../../types/news";

interface HeroProps {
  news: PortalNewsItem | null;
  loading?: boolean;
}

export function Hero({ news, loading = false }: HeroProps) {
  const hasNews = Boolean(news);
  const cover = news?.imageVariants.hero ?? news?.imageVariants.card ?? news?.imageUrl ?? null;
  const title =
    news?.title ||
    (loading ? "Carregando noticias..." : "Nenhuma noticia publicada no momento");
  const excerpt =
    news?.excerpt ||
    (loading
      ? "Aguarde enquanto buscamos as ultimas noticias."
      : "As noticias publicadas no painel administrativo serao exibidas aqui.");
  const categoryClass = getCategoryBadgeClass(news?.category);
  const categoryLabel = getCategoryLabel(news?.category);
  const time = formatRelativeTime(news?.publishedAt);
  const author = news?.author || "Redacao";
  const cardClassName = cover ? "qc-hero-card" : "qc-hero-card qc-hero-card-empty";
  const cardStyle = cover ? { backgroundImage: `url(${cover})` } : undefined;

  return (
    <article className={cardClassName} style={cardStyle}>
      {cover ? <div className="qc-hero-overlay" /> : null}

      <div className="qc-hero-content">
        <div className="qc-hero-tags">
          {hasNews ? (
            <>
              <span className="qc-hero-hot">ULTIMA HORA</span>
              <span className={categoryClass}>{categoryLabel}</span>
            </>
          ) : (
            <span className="qc-hero-hot">{loading ? "ATUALIZANDO" : "SEM NOTICIAS"}</span>
          )}
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
            {loading ? "Carregando..." : "Sem noticias"}
          </button>
        )}
      </div>
    </article>
  );
}
