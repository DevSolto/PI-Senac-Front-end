import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
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

// util p/ logs padronizados
const L = {
  group(label: string) {
    if (typeof window !== 'undefined') console.groupCollapsed(`🧪 [TemperatureLine] ${label}`);
  },
  end() {
    if (typeof window !== 'undefined') console.groupEnd();
  },
  info(...args: any[]) {
    if (typeof window !== 'undefined') console.info('[TemperatureLine]', ...args);
  },
  warn(...args: any[]) {
    if (typeof window !== 'undefined') console.warn('[TemperatureLine]', ...args);
  },
  error(...args: any[]) {
    if (typeof window !== 'undefined') console.error('[TemperatureLine]', ...args);
  },
  table(rows: any[]) {
    if (typeof window !== 'undefined' && 'table' in console) console.table(rows);
  },
};

export function TemperatureLine({ data, isLoading = false, onAdjustFilters }: TemperatureLineProps) {
  // log entrada crua
  useEffect(() => {
    L.group('Entrada (data)');
    L.info('Quantidade de pontos recebidos:', data.length);
    const sample = data.slice(0, 5).map((p, i) => ({
      i,
      timestamp: (p as any).timestamp,
      average: (p as any).average,
      max: (p as any).max,
      min: (p as any).min,
    }));
    L.table(sample);
    L.end();
  }, [data]);

  const chartData = useMemo<ChartPoint[]>(() => {
    const t0 = performance.now();
    L.group('Normalização + Ordenação + Filtro');

    // 1) Normalização
    const normalized = data.map((p, idx) => {
      const rawTs = (p as any).timestamp;
      const ts = rawTs instanceof Date ? rawTs : new Date(rawTs);
      const tsMs = ts.getTime();

      if (Number.isNaN(tsMs)) {
        L.warn('timestamp inválido no índice', idx, 'rawTs=', rawTs);
      }

      const avg = typeof (p as any).average === 'number' ? (p as any).average : null;
      const mx = typeof (p as any).max === 'number' ? (p as any).max : avg;
      const mn = typeof (p as any).min === 'number' ? (p as any).min : avg;

      const safeMax = typeof mx === 'number' ? mx : null;
      const safeMin = typeof mn === 'number' ? mn : null;

      const bandLower = safeMin ?? 0;
      const bandRange =
        safeMax !== null && safeMin !== null ? Math.max(safeMax - safeMin, 0) : 0;

      if (
        (avg !== null && Number.isNaN(avg)) ||
        (safeMax !== null && Number.isNaN(safeMax)) ||
        (safeMin !== null && Number.isNaN(safeMin))
      ) {
        L.warn('Valor NaN detectado no índice', idx, { avg, safeMax, safeMin });
      }

      return {
        timestampMs: tsMs,
        average: avg,
        max: safeMax,
        min: safeMin,
        bandLower,
        bandRange,
      } as ChartPoint;
    });

    L.info('Após normalização:', { total: normalized.length });
    L.table(normalized.slice(0, 5));

    // 2) Ordenação
    normalized.sort((a, b) => a.timestampMs - b.timestampMs);
    L.info(
      'Domínio temporal:',
      normalized.length
        ? {
            min: normalized[0].timestampMs,
            minFmt: fmtData(new Date(normalized[0].timestampMs)),
            max: normalized[normalized.length - 1].timestampMs,
            maxFmt: fmtData(new Date(normalized[normalized.length - 1].timestampMs)),
          }
        : 'N/A'
    );

    // 3) Filtro (remove pontos totalmente nulos)
    const filtered = normalized.filter(
      (p) => p.average !== null || p.max !== null || p.min !== null,
    );
    L.info('Após filtro de pontos vazios:', {
      antes: normalized.length,
      depois: filtered.length,
      removidos: normalized.length - filtered.length,
    });

    const dt = Math.round(performance.now() - t0);
    L.info(`Tempo total da memoização: ${dt}ms`);
    L.end();

    return filtered;
  }, [data]);

  // log saída do useMemo
  useEffect(() => {
    L.group('Saída (chartData)');
    L.info('Quantidade final para render:', chartData.length);
    L.table(chartData.slice(0, 8));
    L.end();
  }, [chartData]);

  // logs de estados visuais
  useEffect(() => {
    if (isLoading) {
      L.info('Estado visual: carregando (skeletons ativos)');
    }
  }, [isLoading]);

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
    L.warn('Sem dados após normalização/filtro — exibindo estado vazio.');
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

  L.info('Renderizando gráfico com', chartData.length, 'pontos.');

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
              tickFormatter={(ms) => {
                const d = new Date(ms as number);
                const out = fmtData(d);
                return out;
              }}
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
              labelFormatter={(ms) => {
                const d = new Date(ms as number);
                const out = fmtData(d);
                // log leve para tooltip (não exagerar — tooltip chama muito)
                return out;
              }}
              formatter={(value: number | string, name) => {
                const v =
                  typeof value === 'number' ? fmtTemp(value) : (value ?? '').toString();
                const label =
                  name === 'average'
                    ? 'Temperatura média (°C)'
                    : name === 'max'
                    ? 'Máxima (°C)'
                    : name === 'min'
                    ? 'Mínima (°C)'
                    : (name ?? '').toString();
                return [v, label];
              }}
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
              hide={true}
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
