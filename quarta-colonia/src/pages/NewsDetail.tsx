import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Footer } from "../components/portal/Footer";
import { Header } from "../components/portal/Header";
import { LeftSidebar } from "../components/portal/LeftSidebar";
import { MoreNews } from "../components/portal/MoreNews";
import { RightSidebar } from "../components/portal/RightSidebar";
import { SponsorsSection } from "../components/portal/SponsorsSection";
import { usePublishedColumns } from "../hooks/usePublishedColumns";
import { useNewsDetail } from "../hooks/useNewsDetail";
import { usePublishedNews } from "../hooks/usePublishedNews";
import { useSponsors } from "../hooks/useSponsors";
import { getCategoryBadgeClass, getCategoryLabel } from "../lib/category";
import { formatMetaDate } from "../lib/date";

export function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data, loading, error, refetch } = useNewsDetail(slug);
  const { data: feed, loading: feedLoading } = usePublishedNews();
  const { data: columns } = usePublishedColumns();
  const { data: sponsors, loading: sponsorsLoading, error: sponsorsError, refetch: refetchSponsors } = useSponsors();

  const relatedNews = useMemo(() => feed.filter((item) => item.slug !== slug).slice(0, 4), [feed, slug]);
  const opinionHighlight = useMemo(() => columns[0] ?? null, [columns]);

  const urgentText = useMemo(() => {
    if (feed.length === 0) {
      return data?.title || "Atualizacoes em tempo real da Quarta Colonia";
    }
    return feed
      .slice(0, 2)
      .map((item) => item.title)
      .join(" | ");
  }, [feed, data?.title]);

  return (
    <div className="qc-page">
      <Header onToggleMenu={() => setMobileMenuOpen((previous) => !previous)} urgentText={urgentText} />

      {mobileMenuOpen ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="h-full w-[236px]" onClick={(event) => event.stopPropagation()}>
            <LeftSidebar />
          </div>
        </div>
      ) : null}

      <main className="qc-layout">
        <div className="qc-desktop-sidebar hidden lg:block">
          <div className="qc-sidebar-sticky">
            <LeftSidebar />
          </div>
        </div>

        <div className="qc-main-area">
          <div className="qc-content-grid">
            <section className="qc-main-column">
              <Link className="qc-back-link" to="/">
                Voltar para home
              </Link>

              {loading ? <section className="qc-loading-box">Carregando noticia do backend...</section> : null}

              {!loading && error ? (
                <section className="qc-error-box">
                  <div>
                    <p>{error}</p>
                    <button
                      className="mt-3 rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => void refetch()}
                      type="button"
                    >
                      Tentar novamente
                    </button>
                  </div>
                </section>
              ) : null}

              {!loading && data ? (
                <article className="qc-article-card">
                  <span className={getCategoryBadgeClass(data.category)}>{getCategoryLabel(data.category)}</span>
                  <h1 className="qc-article-title">{data.title}</h1>
                  <div className="qc-article-meta">
                    <span>{data.author}</span>
                    <span>|</span>
                    <span>{formatMetaDate(data.publishedAt)}</span>
                  </div>

                  {data.imageUrl ? (
                    <img
                      alt={`Imagem principal da noticia ${data.title}`}
                      className="qc-article-cover object-cover"
                      loading="lazy"
                      src={data.imageUrl}
                    />
                  ) : null}

                  <p className="qc-article-excerpt">{data.excerpt}</p>
                  <div className="qc-article-content">{data.content || "Conteudo da noticia indisponivel no momento."}</div>
                </article>
              ) : null}

              <section className="qc-ad-wide">
                <span>ESPACO PUBLICITARIO</span>
                <strong>Anuncie Aqui</strong>
                <small>Contato: quartacolonia24horas@gmail.com</small>
              </section>

              <MoreNews items={relatedNews} loading={feedLoading} />

              <SponsorsSection
                error={sponsorsError}
                loading={sponsorsLoading}
                onRetry={() => void refetchSponsors()}
                sponsors={sponsors}
              />
            </section>

            <div className="qc-right-column">
              <RightSidebar opinion={opinionHighlight} sponsors={sponsors} sponsorsLoading={sponsorsLoading} />
            </div>
          </div>

          <Footer />
        </div>
      </main>
    </div>
  );
}
