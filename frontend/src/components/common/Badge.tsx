import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'healthy' | 'needs_attention' | 'recovering' | 'diseased' | 'pending' | 'completed' | 'overdue' | 'snoozed' | 'forest' | 'leaf' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'forest',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const variantClasses = {
    healthy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    needs_attention: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    recovering: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
    diseased: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    completed: 'bg-forest-100 text-forest-800 dark:bg-forest-900/60 dark:text-leaf-300 border border-forest-200 dark:border-forest-800',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse',
    snoozed: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    forest: 'bg-forest-50 text-forest-800 dark:bg-forest-900/60 dark:text-forest-200 border border-forest-200 dark:border-forest-800',
    leaf: 'bg-leaf-100 text-leaf-800 dark:bg-leaf-950/60 dark:text-leaf-300 border border-leaf-200 dark:border-leaf-800',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};
