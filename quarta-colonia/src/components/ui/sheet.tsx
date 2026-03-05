import { PropsWithChildren } from 'react';

interface SheetProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
}

export const Sheet = ({ open, onOpenChange, title, children }: PropsWithChildren<SheetProps>) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        aria-label="Fechar menu"
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        type="button"
      />
      <aside className="absolute left-0 top-0 h-full w-[84%] max-w-[320px] bg-[#091f3f] p-4 text-white shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
          <button
            aria-label="Fechar"
            className="rounded-md border border-white/40 px-2 py-1 text-xs"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Fechar
          </button>
        </div>
        <div className="h-[calc(100%-3rem)] overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
};
