import { moreNews } from "@/data/newsData";

const MoreNews = () => {
  return (
    <section>
      <h2 className="text-lg font-bold mb-4 border-b-2 border-vqc-navy pb-2">Mais Notícias</h2>
      <div className="space-y-3">
        {moreNews.map((item) => (
          <a key={item.id} href="#" className="flex gap-3 group cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
            <img
              src={item.image}
              alt={item.title}
              className="w-20 h-14 object-cover rounded shrink-0"
              loading="lazy"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-semibold text-blue-700 uppercase">{item.category}</span>
              <h4 className="text-sm font-semibold leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                {item.title}
              </h4>
              <span className="text-[11px] text-gray-400">{item.timeAgo}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default MoreNews;
