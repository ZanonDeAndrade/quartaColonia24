export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
  categoryColor: string;
  author: string;
  timeAgo: string;
  image: string;
}

export const heroNews: NewsItem = {
  id: 0,
  title: "Prefeitura anuncia novo plano de revitalização do centro histórico da cidade",
  summary: "O projeto inclui restauração de fachadas, melhoria da iluminação pública e criação de espaços de convivência para moradores e turistas da região.",
  category: "Local",
  categoryColor: "bg-gray-700",
  author: "Maria Silva",
  timeAgo: "há 2 horas",
  image: "",
};

export const gridNews: NewsItem[] = [
  {
    id: 1,
    title: "Time local vence campeonato regional de futsal",
    summary: "Equipe conquistou o título após vitória emocionante nos pênaltis contra o rival da cidade vizinha.",
    category: "Esportes",
    categoryColor: "bg-emerald-600",
    author: "João Santos",
    timeAgo: "há 3 horas",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    title: "Câmara aprova novo orçamento municipal para 2026",
    summary: "Vereadores votaram por unanimidade o plano que prioriza saúde e educação no município.",
    category: "Política",
    categoryColor: "bg-blue-600",
    author: "Ana Oliveira",
    timeAgo: "há 5 horas",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    title: "Tensões crescem na fronteira entre países vizinhos",
    summary: "Líderes mundiais pedem diálogo após incidentes diplomáticos na região fronteiriça.",
    category: "Internacional",
    categoryColor: "bg-purple-600",
    author: "Carlos Mendes",
    timeAgo: "há 6 horas",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=400&h=250&fit=crop",
  },
  {
    id: 4,
    title: "O futuro da agricultura familiar na região central",
    summary: "Colunista analisa os desafios e oportunidades para pequenos produtores rurais.",
    category: "Opinião",
    categoryColor: "bg-orange-500",
    author: "Dr. Roberto Lima",
    timeAgo: "há 8 horas",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop",
  },
  {
    id: 5,
    title: "Festival de cultura italiana reúne milhares de visitantes",
    summary: "Evento celebrou tradições gastronômicas e musicais da colonização italiana na região.",
    category: "Cultura",
    categoryColor: "bg-pink-600",
    author: "Lucia Ferreira",
    timeAgo: "há 1 dia",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=250&fit=crop",
  },
  {
    id: 6,
    title: "Obras na RS-287 devem ser concluídas até março",
    summary: "DAER confirma cronograma e promete melhorias significativas no trecho entre Restinga Sêca e Agudo.",
    category: "Local",
    categoryColor: "bg-gray-700",
    author: "Pedro Costa",
    timeAgo: "há 1 dia",
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=250&fit=crop",
  },
];

export const moreNews = [
  { id: 7, title: "Preço do arroz tem alta de 12% no mercado regional", category: "Economia", timeAgo: "há 2 dias", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100&h=70&fit=crop" },
  { id: 8, title: "Escola municipal recebe prêmio nacional de inovação", category: "Educação", timeAgo: "há 2 dias", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=70&fit=crop" },
  { id: 9, title: "Temporal causa alagamentos em bairros da zona sul", category: "Local", timeAgo: "há 3 dias", image: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=100&h=70&fit=crop" },
  { id: 10, title: "Vacinação contra gripe começa na próxima semana", category: "Saúde", timeAgo: "há 3 dias", image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=100&h=70&fit=crop" },
];

export const urgentTicker = "Defesa Civil emite alerta de temporais para a região central do RS nas próximas 48 horas — Rodovia RS-287 tem trecho interditado por queda de barreira";
