import { AirQualityOverTime } from '@/components/charts/simple/AirQualityOverTime';
import { EnvironmentScoreOverTime } from '@/components/charts/simple/EnvironmentScoreOverTime';
import { HumidityOverTime } from '@/components/charts/simple/HumidityOverTime';
import { TemperatureOverTime } from '@/components/charts/simple/TemperatureOverTime';
import type { AirQualitySeriesPoint, HumiditySeriesPoint, TemperatureSeriesPoint } from '@/lib/metrics';
import type { EnvironmentScoreSeriesPoint } from './DashboardChartsShadcn';

interface DashboardChartsLegacyProps {
  temperatureSeries: TemperatureSeriesPoint[];
  humiditySeries: HumiditySeriesPoint[];
  airQualitySeries: AirQualitySeriesPoint[];
  environmentScoreSeries: EnvironmentScoreSeriesPoint[];
}

export function DashboardChartsLegacy({
  temperatureSeries,
  humiditySeries,
  airQualitySeries,
  environmentScoreSeries,
}: DashboardChartsLegacyProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 xl:gap-10">
      <TemperatureOverTime data={temperatureSeries} height={300} />
      <HumidityOverTime data={humiditySeries} height={300} />
      <AirQualityOverTime data={airQualitySeries} height={300} />
      <EnvironmentScoreOverTime data={environmentScoreSeries} />
    </div>
  );
}
