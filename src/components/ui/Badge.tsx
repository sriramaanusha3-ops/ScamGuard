import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/supabase';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot,
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-dark-700 text-dark-200 border-dark-600',
    success: 'bg-success-500/20 text-success-400 border-success-500/30',
    warning: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
    danger: 'bg-danger-500/20 text-danger-400 border-danger-500/30',
    info: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
    outline: 'bg-transparent border-dark-600 text-dark-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const dotColors = {
    default: 'bg-dark-400',
    success: 'bg-success-400',
    warning: 'bg-warning-400',
    danger: 'bg-danger-400',
    info: 'bg-primary-400',
    outline: 'bg-dark-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'pending' | 'running' | 'completed' | 'failed';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: { label: 'Pending', variant: 'outline' as const, dot: true },
    running: { label: 'Running', variant: 'info' as const, dot: true },
    completed: { label: 'Completed', variant: 'success' as const, dot: false },
    failed: { label: 'Failed', variant: 'danger' as const, dot: false },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} dot={config.dot} className={className}>
      {config.label}
    </Badge>
  );
}

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical';
  score?: number;
  className?: string;
}

export function RiskBadge({ level, score, className }: RiskBadgeProps) {
  const levelConfig = {
    low: { label: 'Low Risk', variant: 'success' as const },
    medium: { label: 'Medium Risk', variant: 'warning' as const },
    high: { label: 'High Risk', variant: 'danger' as const },
    critical: { label: 'Critical', variant: 'danger' as const },
  };

  const config = levelConfig[level];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
      {score !== undefined && ` (${score})`}
    </Badge>
  );
}

interface VerdictBadgeProps {
  verdict: 'safe' | 'suspicious' | 'dangerous' | 'unknown';
  className?: string;
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const verdictConfig = {
    safe: { label: 'Safe', variant: 'success' as const, dot: true },
    suspicious: { label: 'Suspicious', variant: 'warning' as const, dot: true },
    dangerous: { label: 'Dangerous', variant: 'danger' as const, dot: true },
    unknown: { label: 'Unknown', variant: 'outline' as const, dot: false },
  };

  const config = verdictConfig[verdict];

  return (
    <Badge variant={config.variant} dot={config.dot} size="lg" className={className}>
      {config.label}
    </Badge>
  );
}
