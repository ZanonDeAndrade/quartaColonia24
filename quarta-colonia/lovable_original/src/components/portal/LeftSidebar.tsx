import {
  Home, Newspaper, Landmark, Trophy, Globe, TrendingUp, Palette, MessageSquare,
  Radio, Podcast,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { icon: Home, label: "Início", active: true },
  { icon: Newspaper, label: "Notícias Locais" },
  { icon: Landmark, label: "Política" },
  { icon: Trophy, label: "Esportes" },
  { icon: Globe, label: "Internacional" },
  { icon: TrendingUp, label: "Economia" },
  { icon: Palette, label: "Cultura" },
  { icon: MessageSquare, label: "Colunas & Opinião" },
];

const channels = [
  { icon: Radio, label: "Ao Vivo" },
  { icon: Podcast, label: "Podcast" },
];

interface LeftSidebarProps {
  open: boolean;
  onClose: () => void;
}

const LeftSidebar = ({ open, onClose }: LeftSidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "bg-vqc-navy text-gray-300 w-56 shrink-0 flex-col z-50 transition-transform duration-200",
          "fixed top-0 left-0 h-full lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="py-4 flex flex-col h-full overflow-y-auto">
          <div className="px-4 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Seções</span>
          </div>
          {sections.map((item) => (
            <a
              key={item.label}
              href="#"
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors",
                item.active && "bg-white/10 text-white font-medium border-l-2 border-red-500"
              )}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </a>
          ))}

          <div className="px-4 mt-6 mb-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Canais</span>
          </div>
          {channels.map((item) => (
            <a
              key={item.label}
              href="#"
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors"
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default LeftSidebar;
