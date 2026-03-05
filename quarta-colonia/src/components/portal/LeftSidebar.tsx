import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  IconGlobe,
  IconHome,
  IconLandmark,
  IconMessageSquare,
  IconNewspaper,
  IconPalette,
  IconTrendingUp,
  IconTrophy,
  type IconProps,
} from "./icons";

type CategoryFilter = "LOCAL" | "POLITICA" | "ESPORTES" | "INTERNACIONAL" | "ECONOMIA" | "CULTURA";

type MenuItem = {
  label: string;
  href: string;
  icon: (props: IconProps) => ReactNode;
  filterKey?: CategoryFilter;
  isColumns?: boolean;
};

const sections: MenuItem[] = [
  { label: "Inicio", href: "/", icon: IconHome },
  { label: "Noticias Locais", href: "/?secao=LOCAL", filterKey: "LOCAL", icon: IconNewspaper },
  { label: "Politica", href: "/?secao=POLITICA", filterKey: "POLITICA", icon: IconLandmark },
  { label: "Esportes", href: "/?secao=ESPORTES", filterKey: "ESPORTES", icon: IconTrophy },
  { label: "Internacional", href: "/?secao=INTERNACIONAL", filterKey: "INTERNACIONAL", icon: IconGlobe },
  { label: "Economia", href: "/?secao=ECONOMIA", filterKey: "ECONOMIA", icon: IconTrendingUp },
  { label: "Cultura", href: "/?secao=CULTURA", filterKey: "CULTURA", icon: IconPalette },
  { label: "Colunas & Opiniao", href: "/colunas", isColumns: true, icon: IconMessageSquare },
];

export function LeftSidebar() {
  const location = useLocation();
  const selectedSection = new URLSearchParams(location.search).get("secao")?.toUpperCase() ?? "";
  const isHome = location.pathname === "/";
  const isColumns = location.pathname.startsWith("/colunas");

  return (
    <aside className="qc-left-sidebar">
      <div className="qc-left-scroll">
        <p className="qc-left-title">SECOES</p>
        {sections.map((section) => {
          const isActive =
            (section.filterKey && isHome && selectedSection === section.filterKey) ||
            (section.isColumns && isColumns) ||
            (!section.filterKey && !section.isColumns && isHome && !selectedSection);

          return (
            <Link key={section.label} to={section.href} className={`qc-left-link ${isActive ? "is-active" : ""}`}>
              <section.icon className="qc-nav-icon" />
              <span>{section.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="qc-left-footer">(c) 2025 Jornal da Regiao</div>
    </aside>
  );
}
