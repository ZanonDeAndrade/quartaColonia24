import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', ...props }, ref) => {
  return (
    <select
      className={`w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring ${className}`.trim()}
      ref={ref}
      {...props}
    />
  );
});

Select.displayName = 'Select';
