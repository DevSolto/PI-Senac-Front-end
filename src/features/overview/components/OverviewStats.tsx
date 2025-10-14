import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/components/ui/utils';
import type { KeyMetric, QuickStat } from '@/shared/types';

interface OverviewStatsProps {
  keyMetrics: KeyMetric[];
  quickStats: QuickStat[];
}

export const OverviewStats = ({ keyMetrics, quickStats }: OverviewStatsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map(({ title, value, icon: Icon, iconClassName, trend, progress, description, descriptionClassName, badges }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className={cn('h-4 w-4', iconClassName)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              {progress !== undefined ? <Progress value={progress} className="mt-2" /> : null}
              {trend ? (
                <p className={cn('text-xs text-muted-foreground mt-2 flex items-center', trend.className)}>
                  {trend.icon ? <trend.icon className="w-3 h-3 mr-1" /> : null}
                  {trend.label}
                </p>
              ) : null}
              {description ? (
                <p className={cn('text-xs text-muted-foreground mt-2', descriptionClassName)}>{description}</p>
              ) : null}
              {badges ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {badges.map((badge) => (
                    <Badge key={badge.label} variant={badge.variant} className={badge.className}>
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map(({ icon: Icon, iconClassName, value, label }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Icon className={cn('h-8 w-8', iconClassName)} />
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
