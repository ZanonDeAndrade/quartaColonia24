import { Link } from "react-router-dom";
import type { PortalColumnItem } from "../../types/column";
import type { PortalSponsorItem } from "../../types/sponsor";

interface RightSidebarProps {
  opinion?: PortalColumnItem | null;
  sponsors: PortalSponsorItem[];
  sponsorsLoading: boolean;
}

export function RightSidebar({ opinion, sponsors, sponsorsLoading }: RightSidebarProps) {
  return (
    <aside className="qc-right-sidebar">
      <section className="qc-ad-rect">
        <span>ESPACO PUBLICITARIO</span>
        <strong>Anuncie Aqui</strong>
        <small>Contato: quartacolonia24horas@gmail.com</small>
      </section>

      <section aria-labelledby="qc-sidebar-sponsors-title">
        <p className="qc-sponsors-label" id="qc-sidebar-sponsors-title">
          PATROCINADORES
        </p>

        {sponsorsLoading ? (
          <>
            <div className="qc-sponsor-card qc-sponsor-card-skeleton" />
            <div className="qc-sponsor-card qc-sponsor-card-skeleton" />
          </>
        ) : null}

        {!sponsorsLoading && sponsors.length === 0 ? (
          <div className="qc-sponsor-card qc-sponsor-card-empty">Sem patrocinadores ativos</div>
        ) : null}

        {!sponsorsLoading
          ? sponsors.slice(0, 4).map((sponsor) =>
              sponsor.link ? (
                <a
                  className="qc-sponsor-card"
                  href={sponsor.link}
                  key={sponsor.id}
                  rel="noopener noreferrer"
                  target="_blank"
                  title={sponsor.name}
                >
                  {sponsor.imageUrl ? (
                    <img alt={`Logo ${sponsor.name}`} loading="lazy" src={sponsor.imageUrl} />
                  ) : (
                    <span>{sponsor.name}</span>
                  )}
                </a>
              ) : (
                <div className="qc-sponsor-card" key={sponsor.id}>
                  {sponsor.imageUrl ? (
                    <img alt={`Logo ${sponsor.name}`} loading="lazy" src={sponsor.imageUrl} />
                  ) : (
                    <span>{sponsor.name}</span>
                  )}
                </div>
              )
            )
          : null}
      </section>

      <section className="qc-opinion-card">
        <h3>Colunas & Opiniao</h3>
        <p>{opinion?.authorName || "Dr. Joao Oliveira"}</p>
        {opinion ? (
          <strong>
            <Link to={`/colunas/${opinion.slug}`}>{opinion.title}</Link>
          </strong>
        ) : (
          <strong>O futuro das pequenas cidades no Brasil</strong>
        )}
      </section>
    </aside>
  );
}
