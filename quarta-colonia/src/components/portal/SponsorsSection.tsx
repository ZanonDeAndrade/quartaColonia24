import type { PortalSponsorItem } from '../../types/sponsor';

interface SponsorsSectionProps {
  sponsors: PortalSponsorItem[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const SponsorCard = ({ sponsor }: { sponsor: PortalSponsorItem }) => {
  const content = sponsor.imageUrl ? (
    <img alt={`Logo ${sponsor.name}`} loading="lazy" src={sponsor.imageUrl} />
  ) : (
    <strong>{sponsor.name}</strong>
  );

  if (sponsor.link) {
    return (
      <a
        className="qc-sponsor-link"
        href={sponsor.link}
        rel="noopener noreferrer"
        target="_blank"
        title={sponsor.name}
      >
        {content}
      </a>
    );
  }

  return <div className="qc-sponsor-link">{content}</div>;
};

export function SponsorsSection({ sponsors, loading, error, onRetry }: SponsorsSectionProps) {
  return (
    <section className="qc-support-strip">
      <span>APOIO</span>

      {loading ? (
        <div className="qc-support-grid" aria-busy="true" aria-live="polite">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="qc-sponsor-skeleton" key={index} />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="qc-support-feedback">
          <p>Nao foi possivel carregar os patrocinadores.</p>
          {onRetry ? (
            <button className="qc-sponsor-retry-btn" onClick={onRetry} type="button">
              Tentar novamente
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && sponsors.length === 0 ? (
        <p className="qc-support-empty">Nenhum patrocinador ativo no momento.</p>
      ) : null}

      {!loading && !error && sponsors.length > 0 ? (
        <div className="qc-support-grid">
          {sponsors.map((sponsor) => (
            <SponsorCard key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
