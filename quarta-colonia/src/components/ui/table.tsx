import * as React from 'react';

export const Table = ({ className = '', ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-auto">
    <table className={`w-full border-collapse text-sm ${className}`.trim()} {...props} />
  </div>
);

export const TableHeader = ({ className = '', ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={`bg-muted/60 ${className}`.trim()} {...props} />
);

export const TableBody = ({ className = '', ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={className} {...props} />
);

export const TableRow = ({ className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`border-t ${className}`.trim()} {...props} />
);

export const TableHead = ({ className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`px-3 py-2 text-left font-medium ${className}`.trim()} {...props} />
);

export const TableCell = ({ className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-3 py-2 ${className}`.trim()} {...props} />
);
