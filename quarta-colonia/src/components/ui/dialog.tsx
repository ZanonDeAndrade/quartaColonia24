import * as React from 'react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Dialog = ({ open, onOpenChange, title, description, children, footer }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-4 shadow-lg">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-5 flex justify-end gap-2">
          {footer}
          <button
            className="rounded-md border px-3 py-2 text-sm font-medium"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
