import type { AirQualitySeriesPoint, HumiditySeriesPoint, TemperatureSeriesPoint } from '@/lib/metrics';

import { cn } from '@/components/ui/utils';
import { AirQualityTrendChart } from '@/components/charts/shadcn/AirQualityTrendChart';
import { EnvironmentScoreTrendChart } from '@/components/charts/shadcn/EnvironmentScoreTrendChart';
import { HumidityTrendChart } from '@/components/charts/shadcn/HumidityTrendChart';
import { TemperatureTrendChart } from '@/components/charts/shadcn/TemperatureTrendChart';

export type EnvironmentScoreSeriesPoint = {
  timestamp: Date | string;
  environmentScore?: number | null;
};

interface DashboardChartsShadcnProps {
  temperatureSeries: TemperatureSeriesPoint[];
  humiditySeries: HumiditySeriesPoint[];
  airQualitySeries: AirQualitySeriesPoint[];
  environmentScoreSeries: EnvironmentScoreSeriesPoint[];
  showSkeletons?: boolean;
  showEmptyState?: boolean;
  className?: string;
}

export function DashboardChartsShadcn({
  temperatureSeries,
  humiditySeries,
  airQualitySeries,
  environmentScoreSeries,
  showSkeletons = false,
  showEmptyState = false,
  className,
}: DashboardChartsShadcnProps) {
  return (
    <div className={cn('grid gap-8 lg:grid-cols-2 xl:gap-10', className)}>
      <TemperatureTrendChart data={temperatureSeries} isLoading={showSkeletons} isEmpty={showEmptyState} />
      <HumidityTrendChart data={humiditySeries} isLoading={showSkeletons} isEmpty={showEmptyState} />
      <AirQualityTrendChart data={airQualitySeries} isLoading={showSkeletons} isEmpty={showEmptyState} />
      <EnvironmentScoreTrendChart data={environmentScoreSeries} isLoading={showSkeletons} isEmpty={showEmptyState} />
    </div>
  );
}
