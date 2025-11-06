import { useEffect, useMemo } from 'react';
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

const tooltipStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid hsl(var(--border))',
  backgroundColor: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
};

const chartColors = {
  average: 'hsl(var(--chart-1, 217 91% 60%))',
  band: 'hsl(var(--chart-2, 271 81% 56%))',
  max: 'hsl(var(--chart-3, 0 72% 51%))',
  min: 'hsl(var(--chart-4, 142 76% 36%))',
} as const;

type ChartPoint = {
  // normalizamos para número (ms) para o eixo temporal
  timestampMs: number;
  average: number | null;
  max: number | null;
  min: number | null;
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
    // normalização: garantir Date -> number
    const normalized = data.map((p) => {
      const ts =
        p.timestamp instanceof Date
          ? p.timestamp
          : new Date((p as any).timestamp); // se vier ISO string

      const avg = typeof (p as any).average === 'number' ? (p as any).average : null;
      const mx = typeof (p as any).max === 'number' ? (p as any).max : avg;
      const mn = typeof (p as any).min === 'number' ? (p as any).min : avg;

      const safeMax = typeof mx === 'number' ? mx : null;
      const safeMin = typeof mn === 'number' ? mn : null;

      return {
        timestampMs: ts.getTime(),
        average: avg,
        max: safeMax,
        min: safeMin,
        bandLower: safeMin ?? 0,
        bandRange:
          safeMax !== null && safeMin !== null ? Math.max(safeMax - safeMin, 0) : 0,
      };
    });

    // ordenar por tempo
    normalized.sort((a, b) => a.timestampMs - b.timestampMs);

    // filtrar pontos completamente vazios
    return normalized.filter(
      (p) => p.average !== null || p.max !== null || p.min !== null,
    );
  }, [data]);

  useEffect(() => {
    console.log('[TemperatureLine] dados recebidos:', data);
  }, [data]);

  useEffect(() => {
    console.log('[TemperatureLine] dados do gráfico:', chartData);
  }, [chartData]);

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
              dataKey="timestampMs"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(ms) => fmtData(new Date(ms as number))}
              tickLine={false}
              axisLine={false}
              minTickGap={32}
            />
            <YAxis
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value: number) => fmtTemp(value)}
              width={64}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={(ms) => fmtData(new Date(ms as number))}
              formatter={(value: number | string, name) => [
                typeof value === 'number' ? fmtTemp(value) : value,
                name === 'average' ? 'Temperatura média (°C)' : name === 'max' ? 'Máxima (°C)' : name === 'min' ? 'Mínima (°C)' : name,
              ]}
            />
            <Legend verticalAlign="bottom" height={24} />

            {/* Banda Máx/Mín (stack) */}
            <Area
              type="monotone"
              dataKey="bandLower"
              stackId="temperature-band"
              stroke="none"
              fill="transparent"
              isAnimationActive={false}
              hide={true} /* esconder da legenda/tooltip */
            />
            <Area
              type="monotone"
              dataKey="bandRange"
              stackId="temperature-band"
              stroke="none"
              fill={chartColors.band}
              fillOpacity={0.16}
              isAnimationActive={false}
              name="Faixa máx/mín"
            />

            <Line
              type="monotone"
              dataKey="average"
              name="Temperatura média (°C)"
              stroke={chartColors.average}
              strokeWidth={2}
              dot
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="max"
              name="Máxima (°C)"
              stroke={chartColors.max}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="min"
              name="Mínima (°C)"
              stroke={chartColors.min}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
