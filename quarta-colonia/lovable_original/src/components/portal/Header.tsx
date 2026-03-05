import { Menu, Search } from "lucide-react";
import { urgentTicker } from "@/data/newsData";

const diasSemana = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];
const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function getFormattedDate() {
  const d = new Date();
  return `${diasSemana[d.getDay()]}, ${d.getDate()} De ${meses[d.getMonth()]} De ${d.getFullYear()}`;
}

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  return (
    <header className="w-full">
      {/* Date bar */}
      <div className="bg-vqc-navy text-vqc-navy-foreground text-xs py-1.5 px-4 text-center tracking-wide">
        {getFormattedDate()}
      </div>

      {/* Logo area */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 flex items-center justify-between">
        <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 rounded-md lg:hidden">
          <Menu size={22} />
        </button>

        <div className="flex-1 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="bg-vqc-navy text-white font-black text-xl px-2.5 py-1 rounded">VQC</div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-vqc-navy leading-tight">
                VOZ DA QUARTA COLÔNIA
              </h1>
              <p className="text-[11px] text-gray-500 tracking-widest uppercase">Seu portal de notícias regional</p>
            </div>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 rounded-md">
          <Search size={20} />
        </button>
      </div>

      {/* Urgent ticker */}
      <div className="bg-vqc-navy flex items-center overflow-hidden">
        <span className="bg-red-600 text-white text-[11px] font-bold px-3 py-2 uppercase tracking-wider shrink-0">
          Urgente
        </span>
        <div className="overflow-hidden whitespace-nowrap flex-1 py-2">
          <p className="animate-marquee inline-block text-sm text-gray-200 pl-4">
            {urgentTicker}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
