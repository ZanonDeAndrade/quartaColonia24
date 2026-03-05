import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/portal/Footer';
import { Header } from '../components/portal/Header';
import { LeftSidebar } from '../components/portal/LeftSidebar';
import { RightSidebar } from '../components/portal/RightSidebar';
import { SponsorsSection } from '../components/portal/SponsorsSection';
import { usePublishedColumns } from '../hooks/usePublishedColumns';
import { usePublishedNews } from '../hooks/usePublishedNews';
import { useSponsors } from '../hooks/useSponsors';
import { formatMetaDate } from '../lib/date';

export function ColumnsListPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: columns, loading, error, refetch } = usePublishedColumns();
  const { data: sponsors, loading: sponsorsLoading, error: sponsorsError, refetch: refetchSponsors } = useSponsors();
  const { data: newsFeed } = usePublishedNews();

  const urgentText = useMemo(() => {
    if (newsFeed.length === 0) {
      return 'Acompanhe as colunas e opinioes mais recentes da Quarta Colonia';
    }
    return newsFeed
      .slice(0, 2)
      .map((item) => item.title)
      .join(' | ');
  }, [newsFeed]);

  const opinionHighlight = useMemo(() => columns[0] ?? null, [columns]);

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
              <div className="qc-columns-list-head">
                <h1>Colunas & Opiniao</h1>
                <p>Analises, opinioes e pontos de vista de colunistas da regiao.</p>
              </div>

              {loading ? (
                <div className="qc-columns-list-grid">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div className="qc-columns-skeleton qc-columns-list-card" key={index} />
                  ))}
                </div>
              ) : null}

              {!loading && error ? (
                <section className="qc-error-box">
                  <div>
                    <p>Nao foi possivel carregar as colunas: {error}</p>
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

              {!loading && !error ? (
                <div className="qc-columns-list-grid">
                  {columns.map((column) => (
                    <article className="qc-columns-list-card" key={column.id}>
                      <p>{column.authorName}</p>
                      <h2>
                        <Link to={`/colunas/${column.slug}`}>{column.title}</Link>
                      </h2>
                      <span>{formatMetaDate(column.publishedAt)}</span>
                      <p>{column.excerpt}</p>
                      <Link className="qc-columns-list-link" to={`/colunas/${column.slug}`}>
                        Ler coluna
                      </Link>
                    </article>
                  ))}
                </div>
              ) : null}

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
