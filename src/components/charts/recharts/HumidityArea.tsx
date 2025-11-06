import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { HumiditySeriesPoint } from '@/lib/metrics';
import { fmtData, fmtPerc } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid hsl(var(--border))',
  backgroundColor: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
};

type ChartPoint = HumiditySeriesPoint & {
  percentOverLimit: number;
};

interface HumidityAreaProps {
  data: HumiditySeriesPoint[];
  isLoading?: boolean;
  onAdjustFilters?: () => void;
}

export function HumidityArea({ data, isLoading = false, onAdjustFilters }: HumidityAreaProps) {
  const chartData = useMemo<ChartPoint[]>(() => {
    const sorted = [...data].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    return sorted
      .map((point) => ({
        ...point,
        percentOverLimit: point.percentOverLimit ?? 0,
      }))
      .filter((point) => point.average !== null || point.percentOverLimit > 0);
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
          <CardTitle className="text-lg font-semibold">Umidade e violações</CardTitle>
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
    <Card className="border-border/60" aria-label="Gráfico de umidade média e violações">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Umidade média</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 12, right: 16, top: 12, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => fmtData(value as Date)}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value: number) => fmtPerc(value)}
              width={56}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(value) => fmtData(value as Date)}
              formatter={(value: number | string, name) => {
                if (name === 'percentOverLimit') {
                  return [fmtPerc(value as number), '% acima do limite'];
                }

                return [
                  typeof value === 'number' ? fmtPerc(value) : value,
                  'Umidade média (%)',
                ];
              }}
            />
            <Legend verticalAlign="bottom" height={24} />
            <Area
              type="monotone"
              dataKey="average"
              name="Umidade média (%)"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              fill="hsl(var(--chart-4))"
              fillOpacity={0.18}
            />
            <Area
              type="monotone"
              dataKey="percentOverLimit"
              name="% acima do limite"
              stroke="hsl(var(--chart-5))"
              strokeWidth={2}
              fill="hsl(var(--chart-5))"
              fillOpacity={0.12}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
