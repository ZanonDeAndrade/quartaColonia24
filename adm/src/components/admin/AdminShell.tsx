import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const BRAND_LOGO_URL =
  "https://firebasestorage.googleapis.com/v0/b/quartacolonia-f49a8.firebasestorage.app/o/Logo%20Qc.png?alt=media&token=795d6fbe-3a0e-4bef-a280-ed93014f8fc8";

interface AdminShellProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  topActions?: ReactNode;
  children: ReactNode;
}

export function AdminShell({ title, subtitle, actions, topActions, children }: AdminShellProps) {
  return (
    <div className="adm-page">
      <header className="adm-topbar">
        <div className="adm-topbar-inner">
          <Link to="/news" className="adm-brand">
            <span className="adm-brand-mark">
              <img alt="Logo Voz da Quarta Colonia" className="adm-brand-logo" src={BRAND_LOGO_URL} />
            </span>
            <span className="adm-brand-copy">
              <strong>Painel ADM</strong>
              <small>Voz da Quarta Colonia</small>
            </span>
          </Link>

          <div className="adm-actions">{topActions}</div>
        </div>
      </header>

      <main className="adm-wrap">
        <div className="adm-header">
          <div>
            <h1 className="adm-title">{title}</h1>
            <p className="adm-subtitle">{subtitle}</p>
          </div>
          <div className="adm-actions">{actions}</div>
        </div>
        {children}
      </main>
    </div>
  );
}
