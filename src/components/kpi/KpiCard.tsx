import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

import type { DashboardKpi } from '@/lib/metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const trendIcon = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return <ArrowUpRight className="h-4 w-4" />;
    case 'down':
      return <ArrowDownRight className="h-4 w-4" />;
    default:
      return <Minus className="h-4 w-4" />;
  }
};

const resolveTrend = (kpi: DashboardKpi) => {
  if (kpi.change === null) {
    return 'neutral' as const;
  }

  if (Math.abs(kpi.change) < 0.01) {
    return 'neutral' as const;
  }

  const isPositive = kpi.change > 0;
  if (isPositive) {
    return kpi.invertTrend ? ('down' as const) : ('up' as const);
  }

  return kpi.invertTrend ? ('up' as const) : ('down' as const);
};

const formatNumber = (value: number, decimals: number) =>
  new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);

export interface KpiCardProps {
  metric: DashboardKpi;
  isLoading?: boolean;
}

export const KpiCard = ({ metric, isLoading = false }: KpiCardProps) => {
  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  const valueLabel =
    metric.value === null
      ? '--'
      : `${formatNumber(metric.value, metric.decimals)}${metric.unit ? ` ${metric.unit}` : ''}`;

  const changeLabel =
    metric.change === null
      ? 'Sem variação'
      : `${metric.change > 0 ? '+' : ''}${formatNumber(metric.change, 1)}%`;

  const trend = resolveTrend(metric);

  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
        <div className="text-2xl font-bold leading-tight">{valueLabel}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground">
            {trendIcon(trend)}
            {changeLabel}
          </span>
          <span className="text-xs text-muted-foreground">vs período anterior</span>
        </div>
      </CardContent>
    </Card>
  );
};
