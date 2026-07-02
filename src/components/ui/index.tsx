import { cn } from '../../lib/supabase';

export { Button } from './Button';
export { Card, CardHeader, CardContent, StatCard } from './Card';
export { Input, Textarea, Select } from './Input';
export { Badge, StatusBadge, RiskBadge, VerdictBadge } from './Badge';
export { Progress, CircularProgress, Skeleton } from './Progress';
export { Modal, Drawer, Tooltip } from './Modal';

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} relative`}>
      <div className="absolute inset-0 rounded-full border-2 border-dark-700"></div>
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin"></div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="p-4 rounded-full bg-dark-800 text-dark-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-dark-200">{title}</h3>
      {description && (
        <p className="text-sm text-dark-500 mt-1 max-w-md">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn('h-px bg-dark-700 w-full', className)} />
  );
}
