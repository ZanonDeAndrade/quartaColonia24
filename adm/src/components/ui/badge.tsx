import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning';
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-muted text-foreground',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700'
};

export const Badge = ({ className = '', variant = 'default', ...props }: BadgeProps) => {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  );
};
