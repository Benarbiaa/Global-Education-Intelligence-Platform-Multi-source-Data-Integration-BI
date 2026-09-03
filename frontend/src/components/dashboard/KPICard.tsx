import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: ReactNode;
  variant?: 'expenditure' | 'enrollment' | 'research' | 'tertiary' | 'default';
  isLoading?: boolean;
  className?: string;
}

const variantStyles = {
  expenditure: 'border-l-4 border-l-kpi-expenditure',
  enrollment: 'border-l-4 border-l-kpi-enrollment',
  research: 'border-l-4 border-l-kpi-research',
  tertiary: 'border-l-4 border-l-kpi-tertiary',
  default: '',
};

const variantIconBg = {
  expenditure: 'bg-kpi-expenditure/10 text-kpi-expenditure',
  enrollment: 'bg-kpi-enrollment/10 text-kpi-enrollment',
  research: 'bg-kpi-research/10 text-kpi-research',
  tertiary: 'bg-kpi-tertiary/10 text-kpi-tertiary',
  default: 'bg-primary/10 text-primary',
};

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  variant = 'default',
  isLoading = false,
  className,
}: KPICardProps) {
  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <TrendingUp className="h-4 w-4" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (trend === undefined) return '';
    if (trend > 0) return 'text-green-600 dark:text-green-400';
    if (trend < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className={cn('kpi-card p-6 animate-pulse', variantStyles[variant], className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-9 w-32 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
          <div className="h-12 w-12 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'kpi-card p-6 animate-slide-up',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="kpi-label">{title}</p>
          <p className="kpi-value">{value}</p>
          <div className="flex items-center gap-2 mt-2">
            {trend !== undefined && (
              <span className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
                {getTrendIcon()}
                {Math.abs(trend).toFixed(1)}%
              </span>
            )}
            {(subtitle || trendLabel) && (
              <span className="text-sm text-muted-foreground">
                {subtitle || trendLabel}
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={cn('p-3 rounded-lg', variantIconBg[variant])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
