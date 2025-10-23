import { useMemo } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { AqiSeries, FormattedSeries, SeriesPointWithBands } from '@/hooks/useRealtimeSeries';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const stdDevConfig = {
  temperatureStdDev: {
    label: 'Desvio temperatura',
    color: 'hsl(var(--chart-1))',
  },
  humidityStdDev: {
    label: 'Desvio umidade',
    color: 'hsl(var(--chart-4))',
  },
  aqiStdDev: {
    label: 'Desvio AQI',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

const STD_DEV_UNITS: Record<keyof typeof stdDevConfig, string> = {
  temperatureStdDev: '°C',
  humidityStdDev: '%',
  aqiStdDev: 'AQI',
};

interface StdDevChartProps {
  temperature: FormattedSeries;
  humidity: FormattedSeries;
  aqi: AqiSeries;
  className?: string;
}

type AggregatedStdDev = {
  date: string;
  label: string;
  temperatureStdDev: number;
  humidityStdDev: number;
  aqiStdDev: number;
};

const formatDay = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });

function aggregateStdDev(points: SeriesPointWithBands[]): Map<string, number> {
  const aggregation = new Map<string, { sum: number; count: number }>();

  for (const point of points) {
    const date = new Date(point.timestamp);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const deviation = (point.upperBand - point.lowerBand) / 4;
    const current = aggregation.get(key) ?? { sum: 0, count: 0 };
    aggregation.set(key, { sum: current.sum + deviation, count: current.count + 1 });
  }

  const result = new Map<string, number>();
  aggregation.forEach((value, key) => {
    result.set(key, value.count > 0 ? value.sum / value.count : 0);
  });

  return result;
}

function buildStdDevDataset(
  temperature: FormattedSeries,
  humidity: FormattedSeries,
  aqi: AqiSeries,
): AggregatedStdDev[] {
  const temperatureByDay = aggregateStdDev(temperature.points);
  const humidityByDay = aggregateStdDev(humidity.points);
  const aqiByDay = aggregateStdDev(aqi.points);

  const allDays = Array.from(
    new Set<string>([
      ...temperatureByDay.keys(),
      ...humidityByDay.keys(),
      ...aqiByDay.keys(),
    ]),
  ).sort();

  return allDays.map((key) => {
    const [year, month, day] = key.split('-').map(Number);
    const date = new Date(year, (month ?? 1) - 1, day ?? 1);

    return {
      date: key,
      label: formatDay.format(date),
      temperatureStdDev: Number((temperatureByDay.get(key) ?? 0).toFixed(2)),
      humidityStdDev: Number((humidityByDay.get(key) ?? 0).toFixed(2)),
      aqiStdDev: Number((aqiByDay.get(key) ?? 0).toFixed(2)),
    };
  });
}

export const StdDevChart = ({ temperature, humidity, aqi, className }: StdDevChartProps) => {
  const data = useMemo(() => {
    const dataset = buildStdDevDataset(temperature, humidity, aqi);
    return dataset.slice(-7);
  }, [aqi, humidity, temperature]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Desvios diários</CardTitle>
        <CardDescription>Comparativo dos últimos 7 dias por indicador</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={stdDevConfig} className="h-[280px]">
          <BarChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 12 }} barGap={8}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) => `${value.toFixed(1)}`}
              width={40}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip
              cursor={{ fillOpacity: 0.12 }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => {
                    if (!item) return value as number;
                    const payload = item.payload as AggregatedStdDev;
                    const key = item.dataKey as keyof AggregatedStdDev;
                    const numeric = typeof payload[key] === 'number' ? (payload[key] as number) : Number(value);
                    const unit = STD_DEV_UNITS[item.dataKey as keyof typeof STD_DEV_UNITS] ?? '';
                    return (
                      <span className="font-medium text-foreground">{`${numeric.toFixed(2)} ${unit}`.trim()}</span>
                    );
                  }}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="temperatureStdDev"
              name={stdDevConfig.temperatureStdDev.label}
              fill={stdDevConfig.temperatureStdDev.color}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="humidityStdDev"
              name={stdDevConfig.humidityStdDev.label}
              fill={stdDevConfig.humidityStdDev.color}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="aqiStdDev"
              name={stdDevConfig.aqiStdDev.label}
              fill={stdDevConfig.aqiStdDev.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default StdDevChart;
