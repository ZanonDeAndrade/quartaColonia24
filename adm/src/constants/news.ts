import type { NewsStatus } from "../types/api";

export const NEWS_STATUS_OPTIONS: ReadonlyArray<{ value: NewsStatus; label: string }> = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
];

export const NEWS_STATUS_LABEL: Record<NewsStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
};

export const NEWS_CATEGORIES: ReadonlyArray<string> = [
  "Geral",
  "Politica",
  "Economia",
  "Cultura",
  "Esportes",
  "Educacao",
  "Saude",
  "Seguranca",
  "Eventos",
  "Tempo",
  "Opiniao",
];

export const OTHER_CATEGORY_VALUE = "__other__";
