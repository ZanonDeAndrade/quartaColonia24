import { heroNews } from "@/data/newsData";
import heroImage from "@/assets/hero-city.jpg";

const HeroSection = () => {
  return (
    <section className="relative w-full h-[350px] md:h-[420px] rounded-lg overflow-hidden group cursor-pointer">
      <img
        src={heroImage}
        alt="Cidade da Quarta Colônia"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
        <div className="flex gap-2 mb-3">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            Última Hora
          </span>
          <span className="bg-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            {heroNews.category}
          </span>
        </div>
        <h2 className="text-white text-xl md:text-2xl font-bold leading-tight mb-2">
          {heroNews.title}
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-2">
          {heroNews.summary}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-medium text-gray-300">{heroNews.author}</span>
          <span>•</span>
          <span>{heroNews.timeAgo}</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
