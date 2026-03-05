import * as React from 'react';

type ButtonVariant = 'default' | 'outline' | 'destructive';
type ButtonSize = 'default' | 'sm';

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:opacity-90',
  outline: 'border bg-background hover:bg-muted',
  destructive: 'bg-red-600 text-white hover:bg-red-700'
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs'
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center rounded-md font-medium transition ${variantClasses[variant]} ${sizeClasses[size]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
        ref={ref}
        type={type}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
