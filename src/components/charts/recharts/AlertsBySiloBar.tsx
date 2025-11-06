import { useEffect, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { AlertsBySiloPoint } from '@/lib/metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid hsl(var(--border))',
  backgroundColor: 'hsl(var(--card))',
  color: 'hsl(var(--foreground))',
};

interface AlertsBySiloBarProps {
  data: AlertsBySiloPoint[];
  isLoading?: boolean;
  onAdjustFilters?: () => void;
}

export function AlertsBySiloBar({ data, isLoading = false, onAdjustFilters }: AlertsBySiloBarProps) {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        warning: Math.max(point.total - point.critical, 0),
        total: point.total,
      })),
    [data],
  );

  useEffect(() => {
    console.log('[AlertsBySiloBar] dados recebidos:', data);
  }, [data]);

  useEffect(() => {
    console.log('[AlertsBySiloBar] dados do gráfico:', chartData);
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <Skeleton className="h-5 w-56" />
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
          <CardTitle className="text-lg font-semibold">Alertas por silo</CardTitle>
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
    <Card className="border-border/60" aria-label="Gráfico de alertas por silo">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Alertas por silo</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ left: 12, right: 16, top: 12, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis
              dataKey="siloName"
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={56}
            />
            <YAxis allowDecimals={false} width={48} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number | string, name) => {
                if (name === 'critical') {
                  return [value, 'Alertas críticos'];
                }

                if (name === 'warning') {
                  return [value, 'Alertas'];
                }

                return [value, 'Total de alertas'];
              }}
            />
            <Legend verticalAlign="bottom" height={24} />
            <Bar dataKey="warning" name="Alertas" stackId="alerts" barSize={24} radius={[6, 6, 0, 0]} fill="hsl(var(--chart-6))" />
            <Bar dataKey="critical" name="Críticos" stackId="alerts" barSize={24} radius={[6, 6, 0, 0]} fill="hsl(var(--chart-7))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
