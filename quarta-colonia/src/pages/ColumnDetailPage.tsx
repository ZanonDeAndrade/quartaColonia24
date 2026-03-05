import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Footer } from '../components/portal/Footer';
import { Header } from '../components/portal/Header';
import { LeftSidebar } from '../components/portal/LeftSidebar';
import { MoreNews } from '../components/portal/MoreNews';
import { RightSidebar } from '../components/portal/RightSidebar';
import { SponsorsSection } from '../components/portal/SponsorsSection';
import { useColumnDetail } from '../hooks/useColumnDetail';
import { usePublishedColumns } from '../hooks/usePublishedColumns';
import { usePublishedNews } from '../hooks/usePublishedNews';
import { useSponsors } from '../hooks/useSponsors';
import { formatMetaDate } from '../lib/date';
import { sanitizeHtml } from '../lib/html';

const getOrCreateMetaTag = (attr: 'name' | 'property', key: string) => {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  return element;
};

export function ColumnDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data, loading, error, refetch } = useColumnDetail(slug);
  const { data: columns } = usePublishedColumns();
  const { data: feed, loading: feedLoading } = usePublishedNews();
  const { data: sponsors, loading: sponsorsLoading, error: sponsorsError, refetch: refetchSponsors } = useSponsors();

  const relatedNews = useMemo(() => feed.slice(0, 4), [feed]);
  const opinionHighlight = useMemo(() => columns[0] ?? null, [columns]);
  const safeContent = useMemo(() => sanitizeHtml(data?.content ?? ''), [data?.content]);

  const urgentText = useMemo(() => {
    if (feed.length === 0) {
      return data?.title || 'Colunas e opinioes da Quarta Colonia';
    }
    return feed
      .slice(0, 2)
      .map((item) => item.title)
      .join(' | ');
  }, [feed, data?.title]);

  useEffect(() => {
    const previousTitle = document.title;
    const descriptionTag = getOrCreateMetaTag('name', 'description');
    const previousDescription = descriptionTag.getAttribute('content') ?? '';
    const ogImageTag = getOrCreateMetaTag('property', 'og:image');
    const previousOgImage = ogImageTag.getAttribute('content') ?? '';

    if (data) {
      document.title = `${data.title} | Voz da Quarta Colonia`;
      descriptionTag.setAttribute('content', data.excerpt);
      ogImageTag.setAttribute('content', data.imageUrl ?? '');
    } else {
      document.title = 'Colunas | Voz da Quarta Colonia';
      descriptionTag.setAttribute('content', 'Colunas da Voz da Quarta Colonia.');
      ogImageTag.setAttribute('content', '');
    }

    return () => {
      document.title = previousTitle;
      descriptionTag.setAttribute('content', previousDescription);
      ogImageTag.setAttribute('content', previousOgImage);
    };
  }, [data]);

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
              <Link className="qc-back-link" to="/colunas">
                Voltar para colunas
              </Link>

              {loading ? <section className="qc-loading-box">Carregando coluna do backend...</section> : null}

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
                  <span className="qc-category-badge qc-badge-opiniao">OPINIAO</span>
                  <h1 className="qc-article-title">{data.title}</h1>
                  <div className="qc-article-meta">
                    <span>{data.authorName}</span>
                    <span>|</span>
                    <span>{formatMetaDate(data.publishedAt)}</span>
                  </div>

                  {data.imageUrl ? (
                    <img
                      alt={`Imagem principal da coluna ${data.title}`}
                      className="qc-article-cover object-cover"
                      loading="lazy"
                      src={data.imageUrl}
                    />
                  ) : null}

                  <p className="qc-article-excerpt">{data.excerpt}</p>
                  <div className="qc-column-content" dangerouslySetInnerHTML={{ __html: safeContent }} />
                </article>
              ) : null}

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
