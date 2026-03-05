const weekdayMap = [
  "Domingo",
  "Segunda-Feira",
  "Terca-Feira",
  "Quarta-Feira",
  "Quinta-Feira",
  "Sexta-Feira",
  "Sabado",
];

const monthMap = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function formatHeaderDate(date = new Date()) {
  const weekday = weekdayMap[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = monthMap[date.getMonth()];
  const year = date.getFullYear();
  return `${weekday}, ${day} De ${month} De ${year}`;
}

export function formatMetaDate(value?: string | null) {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatRelativeTime(value?: string | null) {
  if (!value) return "ha 0 dias";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ha 0 dias";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
  return `ha ${diffDays} dias`;
}
