import { useEffect, useMemo, useState } from "react";
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
import { sanitizeHtml, stripHtml } from "../lib/html";

const SITE_NAME = "Quarta Colonia 24h";
const DEFAULT_DESCRIPTION = "Cobertura regional em tempo real com noticias da Quarta Colonia.";

const getOrCreateMetaTag = (attr: "name" | "property", key: string) => {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  const created = !element;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }

  return { element, created };
};

const getOrCreateCanonicalTag = () => {
  let element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const created = !element;

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  return { element, created };
};

const buildDescription = (excerpt: string, content: string) => {
  const source = excerpt.trim() || stripHtml(content);
  if (!source) return DEFAULT_DESCRIPTION;
  if (source.length <= 170) return source;
  return `${source.slice(0, 167).trimEnd()}...`;
};

export function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data, loading, error, refetch } = useNewsDetail(slug);
  const { data: feed, loading: feedLoading } = usePublishedNews();
  const { data: columns } = usePublishedColumns();
  const { data: sponsors, loading: sponsorsLoading, error: sponsorsError, refetch: refetchSponsors } = useSponsors();

  const relatedNews = useMemo(() => feed.filter((item) => item.slug !== slug).slice(0, 4), [feed, slug]);
  const opinionHighlight = useMemo(() => columns[0] ?? null, [columns]);
  const siteBaseUrl = useMemo(
    () => (import.meta.env.VITE_SITE_URL ?? window.location.origin).replace(/\/+$/, ""),
    [],
  );
  const newsUrl = useMemo(
    () => (slug ? `${siteBaseUrl}/noticia/${encodeURIComponent(slug)}` : siteBaseUrl),
    [siteBaseUrl, slug],
  );
  const seoDescription = useMemo(
    () => buildDescription(data?.excerpt ?? "", data?.content ?? ""),
    [data?.content, data?.excerpt],
  );
  const seoImage = useMemo(
    () => data?.imageVariants.hero ?? data?.imageUrl ?? "",
    [data?.imageUrl, data?.imageVariants.hero],
  );
  const safeContent = useMemo(() => sanitizeHtml(data?.content ?? ""), [data?.content]);

  const shareLinks = useMemo(() => {
    if (!data) return null;

    const encodedUrl = encodeURIComponent(newsUrl);
    const encodedTitle = encodeURIComponent(data.title);
    const encodedWhatsApp = encodeURIComponent(`${data.title} ${newsUrl}`);

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedWhatsApp}`,
    };
  }, [data, newsUrl]);

  const structuredData = useMemo(() => {
    if (!data) return null;

    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: data.title,
      image: seoImage ? [seoImage] : undefined,
      datePublished: data.createdAt ?? data.publishedAt ?? new Date().toISOString(),
      dateModified: data.updatedAt ?? data.publishedAt ?? data.createdAt ?? new Date().toISOString(),
      author: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      mainEntityOfPage: newsUrl,
      description: seoDescription,
    });
  }, [data, newsUrl, seoDescription, seoImage]);

  const urgentText = useMemo(() => {
    if (feed.length === 0) {
      return data?.title || "Atualizacoes em tempo real da Quarta Colonia";
    }
    return feed
      .slice(0, 2)
      .map((item) => item.title)
      .join(" | ");
  }, [feed, data?.title]);

  useEffect(() => {
    const previousTitle = document.title;
    const tracked: Array<{ element: HTMLElement; created: boolean; previousValue: string | null; attribute: "content" | "href" }> = [];

    const setMeta = (attr: "name" | "property", key: string, content: string) => {
      const { element, created } = getOrCreateMetaTag(attr, key);
      tracked.push({
        element,
        created,
        previousValue: element.getAttribute("content"),
        attribute: "content",
      });
      element.setAttribute("content", content);
    };

    const setCanonical = (href: string) => {
      const { element, created } = getOrCreateCanonicalTag();
      tracked.push({
        element,
        created,
        previousValue: element.getAttribute("href"),
        attribute: "href",
      });
      element.setAttribute("href", href);
    };

    if (data) {
      document.title = `${data.title} | ${SITE_NAME}`;
      setMeta("name", "description", seoDescription);
      setMeta("property", "og:title", data.title);
      setMeta("property", "og:description", seoDescription);
      setMeta("property", "og:image", seoImage);
      setMeta("property", "og:type", "article");
      setMeta("property", "og:url", newsUrl);
      setCanonical(newsUrl);
    } else {
      document.title = `Noticia | ${SITE_NAME}`;
      setMeta("name", "description", DEFAULT_DESCRIPTION);
      setMeta("property", "og:title", `Noticia | ${SITE_NAME}`);
      setMeta("property", "og:description", DEFAULT_DESCRIPTION);
      setMeta("property", "og:image", "");
      setMeta("property", "og:type", "article");
      setMeta("property", "og:url", newsUrl);
      setCanonical(newsUrl);
    }

    return () => {
      document.title = previousTitle;

      tracked.forEach(({ element, created, previousValue, attribute }) => {
        if (created) {
          element.remove();
          return;
        }

        if (previousValue === null) {
          element.removeAttribute(attribute);
          return;
        }

        element.setAttribute(attribute, previousValue);
      });
    };
  }, [data, newsUrl, seoDescription, seoImage]);

  return (
    <div className="qc-page">
      {structuredData ? (
        <script
          dangerouslySetInnerHTML={{ __html: structuredData }}
          type="application/ld+json"
        />
      ) : null}

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

                  {data.imageVariants.hero ?? data.imageUrl ? (
                    <img
                      alt={`Imagem principal da noticia ${data.title}`}
                      className="qc-article-cover object-cover"
                      loading="lazy"
                      src={data.imageVariants.hero ?? data.imageUrl ?? ""}
                    />
                  ) : null}

                  <p className="qc-article-excerpt">{data.excerpt}</p>
                  <div
                    className="qc-article-content"
                    dangerouslySetInnerHTML={{
                      __html: safeContent || "<p>Conteudo da noticia indisponivel no momento.</p>",
                    }}
                  />

                  {shareLinks ? (
                    <section className="qc-share-strip" aria-label="Compartilhar noticia">
                      <span>Compartilhe:</span>
                      <a href={shareLinks.facebook} rel="noopener noreferrer" target="_blank">
                        Facebook
                      </a>
                      <a href={shareLinks.twitter} rel="noopener noreferrer" target="_blank">
                        Twitter
                      </a>
                      <a href={shareLinks.whatsapp} rel="noopener noreferrer" target="_blank">
                        WhatsApp
                      </a>
                    </section>
                  ) : null}
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
