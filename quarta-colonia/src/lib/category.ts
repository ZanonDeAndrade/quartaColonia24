type CategoryKey =
  | "LOCAL"
  | "POLITICA"
  | "ESPORTES"
  | "INTERNACIONAL"
  | "ECONOMIA"
  | "CULTURA"
  | "OPINIAO"
  | "GERAL";

const CATEGORY_MAP: Record<
  CategoryKey,
  {
    label: string;
    className: string;
  }
> = {
  LOCAL: { label: "LOCAL", className: "qc-badge-local" },
  POLITICA: { label: "POLITICA", className: "qc-badge-politica" },
  ESPORTES: { label: "ESPORTES", className: "qc-badge-esportes" },
  INTERNACIONAL: { label: "INTERNACIONAL", className: "qc-badge-internacional" },
  ECONOMIA: { label: "ECONOMIA", className: "qc-badge-economia" },
  CULTURA: { label: "CULTURA", className: "qc-badge-cultura" },
  OPINIAO: { label: "OPINIAO", className: "qc-badge-opiniao" },
  GERAL: { label: "GERAL", className: "qc-badge-geral" },
};

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeCategory(rawValue?: string | null): CategoryKey {
  const value = stripAccents((rawValue ?? "GERAL").trim().toUpperCase());

  if (value.includes("LOCAL")) return "LOCAL";
  if (value.includes("POLIT")) return "POLITICA";
  if (value.includes("ESPORTE")) return "ESPORTES";
  if (value.includes("INTERNACIONAL")) return "INTERNACIONAL";
  if (value.includes("ECONOMIA")) return "ECONOMIA";
  if (value.includes("CULTURA")) return "CULTURA";
  if (value.includes("OPINIAO") || value.includes("COLUNA")) return "OPINIAO";

  return "GERAL";
}

export function getCategoryBadgeClass(category?: string | null) {
  const key = normalizeCategory(category);
  return `qc-category-badge ${CATEGORY_MAP[key].className}`;
}

export function getCategoryLabel(category?: string | null) {
  const key = normalizeCategory(category);
  return CATEGORY_MAP[key].label;
}
