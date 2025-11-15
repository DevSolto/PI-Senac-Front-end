import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

import { ChartCard } from './ChartCard';

import type { HumiditySeriesPoint } from '@/lib/metrics';
import { fmtData } from '@/lib/formatters';

interface HumidityChartProps {
  data: HumiditySeriesPoint[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

type ChartRow = {
  t: number;
  avg: number | null;
  min: number | null;
  max: number | null;
};

function fmtHumidity(value: number) {
  if (value === null || Number.isNaN(value)) {
    return '--';
  }

  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value) + ' %';
}

const chartConfig = {
  avg: {
    label: 'Umidade média (%)',
    color: 'hsl(var(--chart-1))',
  },
  max: {
    label: 'Umidade máxima (%)',
    color: 'hsl(var(--chart-2))',
  },
  min: {
    label: 'Umidade mínima (%)',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

const HEIGHT = 320;

export function HumidityChart({ data, isLoading, isEmpty }: HumidityChartProps) {
  const rows = useMemo<ChartRow[]>(() => {
    const normalized = data.map((point) => {
      const timestamp = point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp);
      const t = timestamp.getTime();

      const avg = typeof point.average === 'number' ? point.average : null;
      const min = typeof point.min === 'number' ? point.min : avg;
      const max = typeof point.max === 'number' ? point.max : avg;

      return { t, avg, min, max };
    });

    normalized.sort((a, b) => a.t - b.t);
    return normalized.filter((row) => row.avg !== null || row.min !== null || row.max !== null);
  }, [data]);

  const shouldShowEmpty = isEmpty || rows.length === 0;

  return (
    <ChartCard
      title="Umidade relativa ao longo do tempo"
      description="Série de umidade média, mínima e máxima observada nas leituras do intervalo escolhido."
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
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tickFormatter={(value) => fmtHumidity(value)} width={56} />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              labelFormatter={(value) => fmtData(new Date(value as number))}
              formatter={(value: number | string) => (typeof value === 'number' ? fmtHumidity(value) : value)}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Line type="monotone" dataKey="avg" strokeWidth={2} dot connectNulls className="stroke-[--color-avg]" />
            <Line
              type="monotone"
              dataKey="max"
              strokeWidth={2}
              dot={false}
              connectNulls
              className="stroke-[--color-max]"
            />
            <Line
              type="monotone"
              dataKey="min"
              strokeWidth={2}
              dot={false}
              connectNulls
              className="stroke-[--color-min]"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ChartCard>
  );
}
