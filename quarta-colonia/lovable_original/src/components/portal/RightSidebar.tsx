import { Phone } from "lucide-react";

const RightSidebar = () => {
  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-5">
      {/* Ad space 1 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Espaço Publicitário</p>
        <p className="text-sm font-bold text-gray-600">Anuncie Aqui</p>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-400">
          <Phone size={12} />
          <span>(55) 3263-0000</span>
        </div>
      </div>

      {/* Sponsors */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Patrocinadores</h3>
        <div className="space-y-2">
          {["Farmácia Saúde", "Auto Peças Silva"].map((name) => (
            <div key={name} className="bg-white border border-gray-100 rounded-lg p-3 text-center hover:shadow-sm transition-shadow cursor-pointer">
              <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold text-gray-500">
                {name.charAt(0)}
              </div>
              <p className="text-xs font-semibold text-gray-600">{name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Columns & Opinion */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Colunas & Opinião</h3>
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-vqc-navy rounded-full flex items-center justify-center text-white text-xs font-bold">
              RL
            </div>
            <div>
              <p className="text-xs font-bold">Dr. Roberto Lima</p>
              <p className="text-[10px] text-gray-400">Colunista</p>
            </div>
          </div>
          <p className="text-sm font-semibold leading-snug hover:text-blue-700 cursor-pointer transition-colors">
            "O futuro da agricultura familiar na região central"
          </p>
        </div>
      </div>

      {/* Ad space 2 */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Espaço Publicitário</p>
        <p className="text-sm font-bold text-gray-600">Anuncie Aqui</p>
      </div>
    </aside>
  );
};

export default RightSidebar;
