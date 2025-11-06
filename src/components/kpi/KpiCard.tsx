import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type TrendDirection = 'up' | 'down' | 'neutral';

export interface KpiTrend {
  label: string;
  direction: TrendDirection;
}

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  trend?: KpiTrend;
  icon?: ReactNode;
  isLoading?: boolean;
}

const trendIcon = (trend: TrendDirection) => {
  switch (trend) {
    case 'up':
      return <ArrowUpRight className="h-4 w-4" />;
    case 'down':
      return <ArrowDownRight className="h-4 w-4" />;
    default:
      return <Minus className="h-4 w-4" />;
  }
};

export const KpiCard = ({ label, value, trend, icon, isLoading = false }: KpiCardProps) => {
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

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon ? <span className="text-foreground">{icon}</span> : null}
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold leading-tight text-foreground">{value}</div>
        {trend ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground">
              {trendIcon(trend.direction)}
              {trend.label}
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
