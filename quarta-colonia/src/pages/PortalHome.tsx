import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ColumnsOpinionSection } from "../components/portal/ColumnsOpinionSection";
import { usePublishedNews } from "../hooks/usePublishedNews";
import { usePublishedColumns } from "../hooks/usePublishedColumns";
import { AdBanner } from "../components/portal/AdBanner";
import { Footer } from "../components/portal/Footer";
import { Header } from "../components/portal/Header";
import { Hero } from "../components/portal/Hero";
import { LeftSidebar } from "../components/portal/LeftSidebar";
import { MoreNews } from "../components/portal/MoreNews";
import { NewsGrid } from "../components/portal/NewsGrid";
import { RightSidebar } from "../components/portal/RightSidebar";
import { SponsorsSection } from "../components/portal/SponsorsSection";
import { normalizeCategory } from "../lib/category";
import { useSponsors } from "../hooks/useSponsors";

export function PortalHome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data, loading, error, refetch } = usePublishedNews();
  const {
    data: columns,
    loading: columnsLoading,
    error: columnsError,
    refetch: refetchColumns
  } = usePublishedColumns();
  const { data: sponsors, loading: sponsorsLoading, error: sponsorsError, refetch: refetchSponsors } = useSponsors();
  const selectedSection = searchParams.get("secao")?.toUpperCase() ?? "";

  const filteredNews = useMemo(() => {
    if (!selectedSection) {
      return data;
    }

    return data.filter((item) => normalizeCategory(item.category) === selectedSection);
  }, [data, selectedSection]);

  const heroNews = filteredNews[0] ?? null;
  const gridNews = useMemo(() => filteredNews.slice(1, 5), [filteredNews]);
  const moreNews = useMemo(() => filteredNews.slice(5, 9), [filteredNews]);
  const opinionHighlight = useMemo(() => columns[0] ?? null, [columns]);

  const urgentText = useMemo(() => {
    if (filteredNews.length > 0) {
      return filteredNews
        .slice(0, 2)
        .map((item) => item.title)
        .join(" | ");
    }

    if (loading) {
      return "Carregando noticias...";
    }

    if (data.length === 0) {
      return "Sem noticias publicadas no momento.";
    }

    return data.slice(0, 2).map((item) => item.title).join(" | ");
  }, [data, filteredNews, loading]);

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
              {error ? (
                <section className="qc-error-box">
                  <div>
                    <p>Nao foi possivel carregar as noticias agora: {error}</p>
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

              {!loading && !error && selectedSection && filteredNews.length === 0 ? (
                <section className="qc-loading-box">
                  <div>
                    <p>Nenhuma noticia encontrada para esta secao.</p>
                    <button
                      className="mt-3 rounded bg-blue-800 px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => setSearchParams({})}
                      type="button"
                    >
                      Ver todas as noticias
                    </button>
                  </div>
                </section>
              ) : null}

              {!error ? <Hero loading={loading} news={heroNews} /> : null}
              <AdBanner />
              <NewsGrid items={gridNews} loading={loading} />

              <section className="qc-ad-wide">
                <span>ESPACO PUBLICITARIO</span>
                <strong>Anuncie Aqui</strong>
                <small>Contato: quartacolonia24horas@gmail.com</small>
              </section>

              <MoreNews items={moreNews} loading={loading} />
              <ColumnsOpinionSection
                columns={columns}
                error={columnsError}
                loading={columnsLoading}
                onRetry={() => void refetchColumns()}
              />

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
