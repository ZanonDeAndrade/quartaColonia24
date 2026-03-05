import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

interface ToastEntry {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "error" | "success";
}

interface ToastContextValue {
  toast: (input: Omit<ToastEntry, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<ToastEntry[]>([]);

  const toast = useCallback((input: Omit<ToastEntry, 'id'>) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { ...input, id }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 grid gap-2">
        {items.map((item) => (
          <div
            className={`pointer-events-auto min-w-72 rounded-lg border p-3 shadow-lg ${
              item.variant === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : item.variant === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-[#b8c5da] bg-white text-[#17345f]'
            }`}
            key={item.id}
          >
            <p className="text-sm font-semibold">{item.title}</p>
            {item.description ? <p className="text-xs opacity-90">{item.description}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
