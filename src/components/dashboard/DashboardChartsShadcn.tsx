import type { AirQualitySeriesPoint, HumiditySeriesPoint, TemperatureSeriesPoint } from '@/lib/metrics';

import { cn } from '@/components/ui/utils';
import { AirQualityChart } from '@/components/dashboard/charts/AirQualityChart';
import { EnvironmentScoreChart } from '@/components/dashboard/charts/EnvironmentScoreChart';
import { HumidityChart } from '@/components/dashboard/charts/HumidityChart';
import { TemperatureChart } from '@/components/dashboard/charts/TemperatureChart';

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
      <TemperatureChart data={temperatureSeries} isLoading={showSkeletons} isEmpty={showEmptyState} />
      <HumidityChart data={humiditySeries} isLoading={showSkeletons} isEmpty={showEmptyState} />
      <AirQualityChart data={airQualitySeries} isLoading={showSkeletons} isEmpty={showEmptyState} />
      <EnvironmentScoreChart data={environmentScoreSeries} isLoading={showSkeletons} isEmpty={showEmptyState} />
    </div>
  );
}
