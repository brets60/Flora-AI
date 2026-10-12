import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }[size];

  const variantClasses = {
    primary: 'bg-forest-700 text-white hover:bg-forest-800 active:bg-forest-900 shadow-sm border border-transparent focus:ring-2 focus:ring-forest-500/30',
    secondary: 'bg-leaf-400 text-forest-950 hover:bg-leaf-500 active:bg-leaf-600 font-semibold shadow-sm focus:ring-2 focus:ring-leaf-400/30',
    outline: 'border border-botanical-border dark:border-botanical-darkBorder bg-botanical-card dark:bg-botanical-darkCard text-botanical-text dark:text-botanical-darkText hover:bg-forest-50 dark:hover:bg-forest-950/40 hover:border-forest-300 dark:hover:border-forest-700',
    ghost: 'text-botanical-muted dark:text-botanical-darkMuted hover:text-forest-700 dark:hover:text-leaf-300 hover:bg-forest-50/50 dark:hover:bg-forest-950/30',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-2 focus:ring-rose-500/30',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};
