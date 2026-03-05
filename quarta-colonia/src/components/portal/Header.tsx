import { formatHeaderDate } from "../../lib/date";
import { IconAlert, IconMenu, IconSearch } from "./icons";

const BRAND_LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/quartacolonia-f49a8.firebasestorage.app/o/Logo%20Qc.png?alt=media&token=795d6fbe-3a0e-4bef-a280-ed93014f8fc8";

interface HeaderProps {
  onToggleMenu: () => void;
  urgentText?: string;
}

export function Header({ onToggleMenu, urgentText }: HeaderProps) {
  return (
    <header className="qc-header">
      <div className="qc-date-bar">{formatHeaderDate()}</div>

      <div className="qc-top-header">
        <button type="button" onClick={onToggleMenu} className="qc-icon-button" aria-label="Abrir menu">
          <IconMenu className="qc-top-icon" />
        </button>

        <a href="/" className="qc-brand">
          <span className="qc-brand-mark">
            <img alt="Logo Quarta Colonia 24h" className="qc-brand-logo" src={BRAND_LOGO_URL} />
          </span>
          <span className="qc-brand-copy">
            <strong>
              <span className="qc-brand-title">QUARTA COLONIA</span>
              <span className="qc-brand-hour">24H</span>
            </strong>
            <small>Seu portal de noticias regional</small>
          </span>
        </a>

        <button type="button" className="qc-icon-button" aria-label="Buscar noticias">
          <IconSearch className="qc-top-icon" />
        </button>
      </div>

      <div className="qc-urgent-strip">
        <span className="qc-urgent-chip">
          <IconAlert className="qc-chip-icon" />
          URGENTE
        </span>

        <div className="qc-urgent-text-wrap">
          <div className="qc-urgent-text">
            {urgentText ??
              "Prefeitura anuncia nova praca no centro da cidade com investimento de R$ 2 milhoes"}
          </div>
        </div>
      </div>
    </header>
  );
}
