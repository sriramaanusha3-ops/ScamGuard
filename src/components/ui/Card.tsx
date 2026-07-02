import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { cn } from '../../lib/supabase';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'outline';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className,
  variant = 'default',
  hover = false,
  padding = 'md',
}: CardProps) {
  const variants = {
    default: 'bg-dark-800/80 border-dark-700/50',
    glass:
      'bg-dark-800/50 backdrop-blur-xl border-white/10',
    gradient:
      'bg-gradient-to-br from-dark-800/90 to-dark-900/90 border-dark-700/50',
    outline: 'bg-transparent border-dark-600',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={cn(
        'rounded-2xl border',
        variants[variant],
        paddings[padding],
        hover && 'transition-shadow hover:shadow-glow',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({
  title,
  subtitle,
  icon,
  action,
  className,
}: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-primary-500/10 text-primary-400">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-dark-50">{title}</h3>
          {subtitle && (
            <p className="text-sm text-dark-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('', className)}>{children}</div>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'primary',
}: StatCardProps) {
  const colors = {
    primary: 'from-primary-500/20 to-primary-500/5 border-primary-500/20',
    success: 'from-success-500/20 to-success-500/5 border-success-500/20',
    warning: 'from-warning-500/20 to-warning-500/5 border-warning-500/20',
    danger: 'from-danger-500/20 to-danger-500/5 border-danger-500/20',
  };

  const iconColors = {
    primary: 'text-primary-400',
    success: 'text-success-400',
    warning: 'text-warning-400',
    danger: 'text-danger-400',
  };

  const trendColors = {
    up: 'text-success-400',
    down: 'text-danger-400',
    neutral: 'text-dark-400',
  };

  return (
    <Card
      className={cn(
        'bg-gradient-to-br border',
        colors[color]
      )}
      hover
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-dark-400">{title}</p>
          <p className="text-3xl font-bold text-dark-50 mt-2">{value}</p>
          {(subtitle || trendValue) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && trendValue && (
                <span className={cn('text-sm font-medium', trendColors[trend])}>
                  {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
                </span>
              )}
              {subtitle && (
                <span className="text-sm text-dark-500">{subtitle}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-xl bg-dark-800/50', iconColors[color])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
