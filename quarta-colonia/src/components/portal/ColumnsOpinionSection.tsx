import { Link } from 'react-router-dom';
import { formatMetaDate } from '../../lib/date';
import type { PortalColumnItem } from '../../types/column';

interface ColumnsOpinionSectionProps {
  columns: PortalColumnItem[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function ColumnsOpinionSection({ columns, loading, error, onRetry }: ColumnsOpinionSectionProps) {
  const featured = columns[0] ?? null;
  const secondary = columns.slice(1, 3);

  return (
    <section className="qc-columns-home">
      <div className="qc-columns-home-head">
        <h2>Colunas & Opinião</h2>
        <Link to="/colunas">Ver todas</Link>
      </div>

      {loading ? (
        <div className="qc-columns-home-grid" aria-busy="true" aria-live="polite">
          <div className="qc-columns-skeleton qc-columns-skeleton-lg" />
          <div className="qc-columns-skeleton" />
          <div className="qc-columns-skeleton" />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="qc-support-feedback">
          <p>Nao foi possivel carregar as colunas.</p>
          {onRetry ? (
            <button className="qc-sponsor-retry-btn" onClick={onRetry} type="button">
              Tentar novamente
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && !featured ? <p className="qc-support-empty">Nenhuma coluna publicada no momento.</p> : null}

      {!loading && !error && featured ? (
        <div className="qc-columns-home-grid">
          <article className="qc-columns-featured">
            <p>{featured.authorName}</p>
            <h3>
              <Link to={`/colunas/${featured.slug}`}>{featured.title}</Link>
            </h3>
            <span>{formatMetaDate(featured.publishedAt)}</span>
          </article>

          {secondary.map((column) => (
            <article className="qc-columns-secondary" key={column.id}>
              <p>{column.authorName}</p>
              <h4>
                <Link to={`/colunas/${column.slug}`}>{column.title}</Link>
              </h4>
              <span>{formatMetaDate(column.publishedAt)}</span>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
