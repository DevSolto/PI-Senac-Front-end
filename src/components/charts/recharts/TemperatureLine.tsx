import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { TemperatureSeriesPoint } from '@/lib/metrics';
import { fmtData, fmtTemp } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid hsl(var(--border))',
  backgroundColor: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
};

type ChartPoint = TemperatureSeriesPoint & {
  bandLower: number;
  bandRange: number;
};

interface TemperatureLineProps {
  data: TemperatureSeriesPoint[];
  isLoading?: boolean;
  onAdjustFilters?: () => void;
}

export function TemperatureLine({ data, isLoading = false, onAdjustFilters }: TemperatureLineProps) {
  const chartData = useMemo<ChartPoint[]>(() => {
    const sorted = [...data].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    return sorted
      .map((point) => {
        const average = typeof point.average === 'number' ? point.average : null;
        const max = typeof point.max === 'number' ? point.max : average;
        const min = typeof point.min === 'number' ? point.min : average;
        const safeMax = typeof max === 'number' ? max : null;
        const safeMin = typeof min === 'number' ? min : null;

        return {
          ...point,
          average,
          max: safeMax,
          min: safeMin,
          bandLower: safeMin ?? 0,
          bandRange:
            safeMax !== null && safeMin !== null ? Math.max(safeMax - safeMin, 0) : 0,
        } satisfies ChartPoint;
      })
      .filter((point) => point.average !== null || point.max !== null || point.min !== null);
  }, [data]);

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Temperatura média</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[320px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
            <span>Sem dados para o período selecionado.</span>
            <Button variant="outline" size="sm" onClick={onAdjustFilters}>
              Ajustar filtros
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60" aria-label="Gráfico de temperatura média">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Temperatura média</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 12, right: 16, top: 12, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => fmtData(value as Date)}
              tickLine={false}
              axisLine={false}
              minTickGap={32}
            />
            <YAxis
              tickFormatter={(value: number) => fmtTemp(value)}
              width={64}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(value) => fmtData(value as Date)}
              formatter={(value: number | string, name) => [
                typeof value === 'number' ? fmtTemp(value) : value,
                name === 'average' ? 'Temperatura média (°C)' : name,
              ]}
            />
            <Legend verticalAlign="bottom" height={24} />
            <Area
              type="monotone"
              dataKey="bandLower"
              stackId="temperature-band"
              stroke="none"
              fill="transparent"
              isAnimationActive={false}
              name="Mínima (°C)"
              legendType="none"
              tooltipType="none"
            />
            <Area
              type="monotone"
              dataKey="bandRange"
              stackId="temperature-band"
              stroke="none"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.16}
              isAnimationActive={false}
              name="Faixa máx/mín"
              legendType="none"
              tooltipType="none"
            />
            <Line
              type="monotone"
              dataKey="average"
              name="Temperatura média (°C)"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="max"
              name="Máxima (°C)"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="min"
              name="Mínima (°C)"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
