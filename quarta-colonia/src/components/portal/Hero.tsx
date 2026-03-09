import { Link } from "react-router-dom";
import { getCategoryBadgeClass, getCategoryLabel } from "../../lib/category";
import { formatRelativeTime } from "../../lib/date";
import type { PortalNewsItem } from "../../types/news";
import { IconImage } from "./icons";

interface HeroProps {
  news: PortalNewsItem | null;
  loading?: boolean;
}

export function Hero({ news, loading = false }: HeroProps) {
  const hasNews = Boolean(news);
  const cover = news?.imageVariants.hero ?? news?.imageUrl ?? null;
  const title = news?.title || (loading ? "Carregando noticias..." : "Nenhuma noticia publicada no momento");
  const excerpt =
    news?.excerpt ||
    (loading
      ? "Aguarde enquanto buscamos as ultimas noticias."
      : "As noticias publicadas no painel administrativo serao exibidas aqui.");
  const categoryClass = getCategoryBadgeClass(news?.category);
  const categoryLabel = getCategoryLabel(news?.category);
  const time = formatRelativeTime(news?.publishedAt);
  const author = news?.author || "Redacao";

  return (
    <article className="overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--primary-foreground))] shadow-sm">
      <div className="h-[420px] w-full bg-[hsl(var(--portal-surface-muted))]">
        {cover ? (
          <img
            alt={`Imagem destaque da noticia ${title}`}
            className="h-full w-full object-cover"
            loading="lazy"
            src={cover}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--portal-placeholder)]">
            <IconImage className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="space-y-3 p-5 md:p-6">
        <div className="flex items-center gap-2">
          {hasNews ? (
            <span className={categoryClass}>{categoryLabel}</span>
          ) : (
            <span className="qc-category-badge qc-badge-geral">{loading ? "ATUALIZANDO" : "SEM NOTICIAS"}</span>
          )}
        </div>

        <h1 className="font-serif text-3xl leading-tight text-[hsl(var(--portal-text))] md:text-5xl">{title}</h1>
        <p className="text-sm leading-relaxed text-[hsl(var(--portal-text-muted))] md:text-base">{excerpt}</p>

        <div className="flex items-center gap-2 text-sm text-[hsl(var(--portal-text-muted))]">
          <span>{author}</span>
          <span aria-hidden="true">•</span>
          <span>{time}</span>
        </div>

        {hasNews ? (
          <Link
            to={`/noticia/${news?.slug}`}
            className="inline-flex rounded-md bg-[hsl(var(--portal-navy))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90"
          >
            Ler noticia
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed rounded-md bg-[hsl(var(--portal-navy))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] opacity-70"
          >
            {loading ? "Carregando..." : "Sem noticias"}
          </button>
        )}
      </div>
    </article>
  );
}
