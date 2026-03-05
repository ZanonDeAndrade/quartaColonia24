import { gridNews } from "@/data/newsData";

const NewsGrid = () => {
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {gridNews.map((item) => (
          <article key={item.id} className="group cursor-pointer bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative h-44 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <span className={`absolute top-3 left-3 ${item.categoryColor} text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase`}>
                {item.category}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-sm leading-snug mb-1.5 group-hover:text-blue-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-2">{item.summary}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span className="font-medium text-gray-600">{item.author}</span>
                <span>•</span>
                <span>{item.timeAgo}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default NewsGrid;
