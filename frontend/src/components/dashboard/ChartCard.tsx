import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  searchTerm?: string;
  isLoading?: boolean;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  action,
  isLoading = false,
  className,
}: ChartCardProps) {
  if (isLoading) {
    return (
      <div className={cn('chart-container animate-pulse', className)}>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
          <div className="h-8 w-24 bg-muted rounded" />
        </div>
        <div className="h-64 bg-muted/50 rounded-lg" />
      </div>
    );
  }

  return (
    <div className={cn('chart-container animate-fade-in', className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="min-h-[256px]">{children}</div>
    </div>
  );
}
