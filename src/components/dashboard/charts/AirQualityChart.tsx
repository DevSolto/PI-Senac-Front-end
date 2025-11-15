import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

import { ChartCard } from './ChartCard';

import type { AirQualitySeriesPoint } from '@/lib/metrics';
import { fmtData } from '@/lib/formatters';

interface AirQualityChartProps {
  data: AirQualitySeriesPoint[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

type ChartRow = {
  t: number;
  aqi: number | null;
};

const chartConfig = {
  aqi: {
    label: 'Qualidade do ar (média)',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

const HEIGHT = 320;

function fmtAQI(value: number) {
  if (value === null || Number.isNaN(value)) {
    return '--';
  }

  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value);
}

export function AirQualityChart({ data, isLoading, isEmpty }: AirQualityChartProps) {
  const rows = useMemo<ChartRow[]>(() => {
    const normalized = data.map((point) => {
      const timestamp = point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp);
      const t = timestamp.getTime();
      const aqi = typeof point.average === 'number' ? point.average : null;

      return { t, aqi };
    });

    normalized.sort((a, b) => a.t - b.t);
    return normalized.filter((row) => row.aqi !== null);
  }, [data]);

  const shouldShowEmpty = isEmpty || rows.length === 0;

  return (
    <ChartCard
      title="Qualidade do ar média"
      description="Indicador agregado de AQI para os silos monitorados em cada período."
      isLoading={isLoading}
      isEmpty={shouldShowEmpty}
      height={HEIGHT}
    >
      <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ left: 12, right: 12, top: 8, bottom: 8 }} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="t"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => fmtData(new Date(value as number))}
              minTickGap={24}
            />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={(value) => fmtAQI(value)} width={56} />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              labelFormatter={(value) => fmtData(new Date(value as number))}
              formatter={(value: number | string) => (typeof value === 'number' ? fmtAQI(value) : value)}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="aqi" strokeWidth={2} dot connectNulls className="stroke-[--color-aqi]" />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
}
